import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UserRole, UserStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';

type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  status: UserStatus;
  typ: 'access';
  iat: number;
  exp: number;
  email?: string;
  phone?: string;
};

@Injectable()
export class JwtTokenService {
  constructor(private readonly config: ConfigService) {}

  createAccessToken(user: AuthenticatedUser): string {
    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = Number(this.config.get('AUTH_ACCESS_TOKEN_TTL_SECONDS', 900));
    const payload: AccessTokenPayload = {
      sub: user.id,
      role: user.role,
      status: user.status,
      typ: 'access',
      iat: now,
      exp: now + ttlSeconds,
      ...(user.email ? { email: user.email } : {}),
      ...(user.phone ? { phone: user.phone } : {}),
    };

    return signJwt(payload, this.config.getOrThrow<string>('JWT_ACCESS_SECRET'));
  }

  verifyAccessToken(token: string | undefined): AuthenticatedUser | null {
    if (!token) {
      return null;
    }

    const payload = verifyJwt(token, this.config.getOrThrow<string>('JWT_ACCESS_SECRET'));

    if (!isAccessTokenPayload(payload)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now || payload.typ !== 'access' || payload.status !== 'ACTIVE') {
      return null;
    }

    return {
      id: payload.sub,
      role: payload.role,
      status: payload.status,
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.phone ? { phone: payload.phone } : {}),
    };
  }
}

function signJwt(payload: AccessTokenPayload, secret: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = hmac(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

function verifyJwt(token: string, secret: string): unknown {
  const [header, body, signature, extra] = token.split('.');

  if (!header || !body || !signature || extra) {
    return null;
  }

  const expectedSignature = hmac(`${header}.${body}`, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(body)) as unknown;
  } catch {
    return null;
  }
}

function hmac(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function isAccessTokenPayload(value: unknown): value is AccessTokenPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Partial<AccessTokenPayload>;

  return (
    typeof payload.sub === 'string' &&
    typeof payload.role === 'string' &&
    typeof payload.status === 'string' &&
    payload.typ === 'access' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number'
  );
}
