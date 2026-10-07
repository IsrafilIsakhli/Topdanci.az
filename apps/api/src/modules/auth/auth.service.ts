import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserStatus, type UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { hashSensitiveValue } from '../../common/security/hash-ip';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type { AuthCookieConfig, AuthCookieSameSite } from './domain/auth-cookies';
import { JwtTokenService } from './domain/jwt-token.service';
import { isStrongPassword, passwordPolicyMessage } from './domain/password-policy';
import type { LoginDto } from './dto/login.dto';
import type { SetupPasswordDto } from './dto/setup-password.dto';
import type { UpdateAccountDto } from './dto/update-account.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';

type AuthRequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
};

type AuthResult = {
  data: {
    authenticated: true;
    user: AuthenticatedUser;
  };
  tokens: AuthTokens;
};

type AuthUserRecord = {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
};

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly audit: AuditService,
    private readonly config: ConfigService,
    private readonly jwtTokens: JwtTokenService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit(): void {
    if (this.config.get('NODE_ENV') === 'test') {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpiredRefreshSessions();
    }, 60 * 60 * 1000);
    this.cleanupTimer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  async login(dto: LoginDto, context: AuthRequestContext): Promise<AuthResult> {
    const lockoutKey = this.loginLockoutKey(dto.identifier, context.ipAddress);
    await this.ensureLoginAllowed(lockoutKey);

    const userRecord = await this.findLoginUser(dto.identifier);

    if (!userRecord?.passwordHash) {
      await this.recordLoginFailure(lockoutKey);
      throw new UnauthorizedException('Invalid login credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, userRecord.passwordHash);

    if (!passwordMatches) {
      await this.recordLoginFailure(lockoutKey);
      throw new UnauthorizedException('Invalid login credentials');
    }

    await this.clearLoginFailures(lockoutKey);

    const user = toAuthenticatedUser(userRecord);
    const refreshSession = this.createRefreshTokenData(context);

    await this.prisma.$transaction([
      this.prisma.refreshSession.create({
        data: {
          userId: user.id,
          tokenHash: refreshSession.tokenHash,
          expiresAt: refreshSession.expiresAt,
          ...(refreshSession.ipHash ? { ipHash: refreshSession.ipHash } : {}),
          ...(refreshSession.userAgentHash ? { userAgentHash: refreshSession.userAgentHash } : {}),
        },
        select: { id: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        select: { id: true },
      }),
    ]);

    await this.audit.record({
      actorId: user.id,
      action: 'AUTH_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      metadata: {
        ipHashStored: Boolean(refreshSession.ipHash),
        userAgentHashStored: Boolean(refreshSession.userAgentHash),
      },
    });

    return this.authResult(user, refreshSession.refreshToken);
  }

  async refresh(refreshToken: string | undefined, context: AuthRequestContext): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh session is missing');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        revokedAt: true,
        expiresAt: true,
        user: {
          select: authUserSelect,
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      session.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Refresh session is invalid');
    }

    const user = toAuthenticatedUser(session.user);
    const nextSession = this.createRefreshTokenData(context);

    await this.prisma.$transaction(async (transaction) => {
      const now = new Date();
      const rotation = await transaction.refreshSession.updateMany({
        where: { id: session.id, revokedAt: null, expiresAt: { gt: now } },
        data: { revokedAt: now, lastUsedAt: now },
      });

      if (rotation.count !== 1) {
        throw new UnauthorizedException('Refresh session is invalid');
      }

      await transaction.refreshSession.create({
        data: {
          userId: user.id,
          tokenHash: nextSession.tokenHash,
          expiresAt: nextSession.expiresAt,
          ...(nextSession.ipHash ? { ipHash: nextSession.ipHash } : {}),
          ...(nextSession.userAgentHash ? { userAgentHash: nextSession.userAgentHash } : {}),
        },
        select: { id: true },
      });
    });

    await this.audit.record({
      actorId: user.id,
      action: 'AUTH_REFRESH',
      resourceType: 'RefreshSession',
      resourceId: session.id,
    });

    return this.authResult(user, nextSession.refreshToken);
  }

  async logout(refreshToken: string | undefined, user?: AuthenticatedUser, pushToken?: string): Promise<{ data: { authenticated: false } }> {
    let actorId = user?.id;
    let refreshSessionId: string | undefined;

    if (refreshToken) {
      const session = await this.prisma.refreshSession.findUnique({
        where: { tokenHash: this.hashRefreshToken(refreshToken) },
        select: {
          id: true,
          userId: true,
          revokedAt: true,
        },
      });

      if (session && pushToken) await this.prisma.pushDevice.deleteMany({ where: { userId: session.userId, token: pushToken } });
      if (session && !session.revokedAt) {
        actorId = actorId ?? session.userId;
        refreshSessionId = session.id;
        await this.prisma.refreshSession.update({
          where: { id: session.id },
          data: {
            revokedAt: new Date(),
            lastUsedAt: new Date(),
          },
          select: { id: true },
        });
      }
    }

    if (actorId) {
      if (pushToken) await this.prisma.pushDevice.deleteMany({ where: { userId: actorId, token: pushToken } });
      await this.audit.record({
        actorId,
        action: 'AUTH_LOGOUT',
        resourceType: refreshSessionId ? 'RefreshSession' : 'User',
        resourceId: refreshSessionId ?? actorId,
      });
    }

    return {
      data: {
        authenticated: false,
      },
    };
  }

  async logoutAll(user: AuthenticatedUser): Promise<{ data: { authenticated: false; revokedSessions: number } }> {
    await this.prisma.pushDevice.deleteMany({ where: { userId: user.id } });
    const result = await this.prisma.refreshSession.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });

    await this.audit.record({
      actorId: user.id,
      action: 'AUTH_LOGOUT_ALL',
      resourceType: 'User',
      resourceId: user.id,
      metadata: { revokedSessions: result.count },
    });

    return {
      data: {
        authenticated: false,
        revokedSessions: result.count,
      },
    };
  }

  async setupPassword(dto: SetupPasswordDto): Promise<{ data: { completed: true } }> {
    if (!isStrongPassword(dto.password)) {
      throw new BadRequestException(passwordPolicyMessage());
    }

    const tokenHash = this.hashSetupToken(dto.token);
    const setupToken = await this.prisma.accountSetupToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        usedAt: true,
        expiresAt: true,
      },
    });

    if (!setupToken || setupToken.usedAt || setupToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Account setup token is invalid');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: setupToken.userId },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE,
        },
        select: { id: true },
      }),
      this.prisma.accountSetupToken.update({
        where: { id: setupToken.id },
        data: { usedAt: new Date() },
        select: { id: true },
      }),
    ]);

    await this.audit.record({
      actorId: setupToken.userId,
      action: 'AUTH_PASSWORD_SETUP_COMPLETED',
      resourceType: 'User',
      resourceId: setupToken.userId,
    });

    return { data: { completed: true } };
  }

  async cleanupExpiredRefreshSessions(): Promise<number> {
    const result = await this.prisma.refreshSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });

    return result.count;
  }

  session(accessToken: string | undefined): { data: { authenticated: false } | { authenticated: true; user: AuthenticatedUser } } {
    const user = this.jwtTokens.verifyAccessToken(accessToken);

    if (!user) {
      return {
        data: {
          authenticated: false,
        },
      };
    }

    return {
      data: {
        authenticated: true,
        user,
      },
    };
  }

  async updateAccount(user: AuthenticatedUser, dto: UpdateAccountDto): Promise<AuthenticatedUser> {
    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: authUserSelect,
    });

    if (!record?.passwordHash) {
      throw new UnauthorizedException('Password is not configured for this account');
    }

    const passwordMatches = await bcrypt.compare(dto.currentPassword, record.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const email = dto.email !== undefined ? dto.email.trim().toLowerCase() || null : record.email;
    const phone = dto.phone !== undefined ? dto.phone.trim() || null : record.phone;
    const fullName = dto.fullName !== undefined ? dto.fullName.trim() || null : record.fullName;

    if (email && email !== record.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email, id: { not: user.id } },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('This email is already in use');
      }
    }

    if (phone && phone !== record.phone) {
      const existing = await this.prisma.user.findFirst({
        where: { phone, id: { not: user.id } },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('This phone number is already in use');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(email !== record.email ? { email } : {}),
        ...(phone !== record.phone ? { phone } : {}),
        ...(fullName !== record.fullName ? { fullName } : {}),
      },
      select: authUserSelect,
    });

    return toAuthenticatedUser(updated);
  }

  async changePassword(user: AuthenticatedUser, dto: ChangePasswordDto): Promise<{ success: boolean }> {
    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: authUserSelect,
    });

    if (!record?.passwordHash) {
      throw new UnauthorizedException('Password is not configured for this account');
    }

    const passwordMatches = await bcrypt.compare(dto.currentPassword, record.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException('New password must be different from the current one');
    }

    if (!isStrongPassword(dto.newPassword)) {
      throw new BadRequestException(passwordPolicyMessage());
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.refreshSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { success: true };
  }

  accessTokenTtlSeconds(): number {
    return Number(this.config.get('AUTH_ACCESS_TOKEN_TTL_SECONDS', 900));
  }

  cookieConfig(): AuthCookieConfig {
    const sameSite = normalizeCookieSameSite(this.config.get<string>('AUTH_COOKIE_SAME_SITE', 'lax'));
    const secureOverride = normalizeBoolean(this.config.get<string>('AUTH_COOKIE_SECURE'));
    const secure = sameSite === 'none' ? true : secureOverride ?? (this.config.get('NODE_ENV') === 'production');
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN', '').trim();

    return {
      secure,
      sameSite,
      ...(domain ? { domain } : {}),
      accessMaxAgeMs: Number(this.config.get('AUTH_ACCESS_TOKEN_TTL_SECONDS', 900)) * 1000,
      refreshMaxAgeMs: Number(this.config.get('AUTH_REFRESH_TOKEN_TTL_SECONDS', 2_592_000)) * 1000,
    };
  }

  private async findLoginUser(identifier: string): Promise<AuthUserRecord | null> {
    const normalizedIdentifier = identifier.trim();
    const normalizedEmail = normalizedIdentifier.toLowerCase();

    return this.prisma.user.findFirst({
      where: {
        status: UserStatus.ACTIVE,
        OR: [{ email: normalizedEmail }, { phone: normalizedIdentifier }],
      },
      select: authUserSelect,
    });
  }

  private createRefreshTokenData(context: AuthRequestContext): {
    refreshToken: string;
    tokenHash: string;
    expiresAt: Date;
    ipHash?: string;
    userAgentHash?: string;
  } {
    const refreshToken = randomBytes(48).toString('base64url');
    const salt = this.config.get<string>('LEAD_HASH_SALT', this.config.getOrThrow<string>('JWT_REFRESH_SECRET'));
    const refreshTtlSeconds = Number(this.config.get('AUTH_REFRESH_TOKEN_TTL_SECONDS', 2_592_000));

    return {
      refreshToken,
      tokenHash: this.hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
      ...(context.ipAddress ? { ipHash: hashSensitiveValue(context.ipAddress, salt) } : {}),
      ...(context.userAgent ? { userAgentHash: hashSensitiveValue(context.userAgent, salt) } : {}),
    };
  }

  private hashRefreshToken(refreshToken: string): string {
    return hashSensitiveValue(refreshToken, this.config.getOrThrow<string>('JWT_REFRESH_SECRET'));
  }

  private hashSetupToken(token: string): string {
    return hashSensitiveValue(token, this.config.getOrThrow<string>('JWT_REFRESH_SECRET'));
  }

  private authResult(user: AuthenticatedUser, refreshToken: string): AuthResult {
    return {
      data: {
        authenticated: true,
        user,
      },
      tokens: {
        accessToken: this.jwtTokens.createAccessToken(user),
        refreshToken,
        csrfToken: randomBytes(24).toString('base64url'),
      },
    };
  }

  private loginLockoutKey(identifier: string, ipAddress?: string): string {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const salt = this.config.get<string>('LEAD_HASH_SALT', this.config.getOrThrow<string>('JWT_ACCESS_SECRET'));
    return `auth:login:${hashSensitiveValue(`${normalizedIdentifier}:${ipAddress ?? 'unknown'}`, salt)}`;
  }

  private async ensureLoginAllowed(key: string): Promise<void> {
    try {
      const count = Number(await this.redis.getString(key));
      const limit = Number(this.config.get('LOGIN_FAILURE_LIMIT', 5));

      if (Number.isFinite(count) && count >= limit) {
        const ttl = await this.redis.ttlSeconds(key);
        throw new HttpException(
          `Too many login attempts. Try again in ${Math.max(ttl, 1)} seconds`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      if (error instanceof HttpException || this.config.get('NODE_ENV') === 'production') {
        throw error;
      }
    }
  }

  private async recordLoginFailure(key: string): Promise<void> {
    try {
      await this.redis.incrementWithTtl(key, Number(this.config.get('LOGIN_FAILURE_WINDOW_SECONDS', 900)));
    } catch (error) {
      if (this.config.get('NODE_ENV') === 'production') {
        throw error;
      }
    }
  }

  private async clearLoginFailures(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

const authUserSelect = {
  id: true,
  email: true,
  phone: true,
  passwordHash: true,
  fullName: true,
  role: true,
  status: true,
} as const;

function toAuthenticatedUser(user: AuthUserRecord): AuthenticatedUser {
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    ...(user.email ? { email: user.email } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
  };
}

function normalizeCookieSameSite(value: string | undefined): AuthCookieSameSite {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'none' || normalized === 'strict') {
    return normalized;
  }

  return 'lax';
}

function normalizeBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  return value.trim().toLowerCase() === 'true';
}
