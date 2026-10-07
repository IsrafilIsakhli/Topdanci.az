import { UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AuditService } from '../audit/audit.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { RedisService } from '../redis/redis.service';
import { AuthService } from './auth.service';
import type { JwtTokenService } from './domain/jwt-token.service';

const user = {
  id: 'user-1',
  email: 'seller@example.com',
  phone: null,
  passwordHash: null,
  fullName: 'Seller',
  role: UserRole.SELLER,
  status: UserStatus.ACTIVE,
};

function createService(prisma: object) {
  const audit = { record: vi.fn().mockResolvedValue(undefined) };
  const config = {
    get: vi.fn((_key: string, fallback: unknown) => fallback),
    getOrThrow: vi.fn(() => 'test-secret'),
  };
  const jwtTokens = { createAccessToken: vi.fn(() => 'access-token') };

  return new AuthService(
    audit as unknown as AuditService,
    config as unknown as ConfigService,
    jwtTokens as unknown as JwtTokenService,
    prisma as PrismaService,
    {} as RedisService,
  );
}

describe('AuthService sessions', () => {
  it('rotates a refresh session only after conditional revocation succeeds', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const create = vi.fn().mockResolvedValue({ id: 'next-session' });
    const prisma = {
      refreshSession: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'session-1',
          revokedAt: null,
          expiresAt: new Date(Date.now() + 60_000),
          user,
        }),
      },
      $transaction: vi.fn(async (callback: (tx: object) => Promise<unknown>) =>
        callback({ refreshSession: { updateMany, create } }),
      ),
    };

    const result = await createService(prisma).refresh('refresh-token', {});

    expect(result.data.authenticated).toBe(true);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'session-1', revokedAt: null }),
    }));
    expect(create).toHaveBeenCalledOnce();
  });

  it('does not create a new session when another request already rotated it', async () => {
    const create = vi.fn();
    const prisma = {
      refreshSession: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'session-1',
          revokedAt: null,
          expiresAt: new Date(Date.now() + 60_000),
          user,
        }),
      },
      $transaction: vi.fn(async (callback: (tx: object) => Promise<unknown>) =>
        callback({ refreshSession: { updateMany: vi.fn().mockResolvedValue({ count: 0 }), create } }),
      ),
    };

    await expect(createService(prisma).refresh('refresh-token', {})).rejects.toBeInstanceOf(UnauthorizedException);
    expect(create).not.toHaveBeenCalled();
  });

  it('revokes existing refresh sessions when the password changes', async () => {
    const currentPassword = 'CurrentPass123';
    const passwordHash = await bcrypt.hash(currentPassword, 4);
    const update = vi.fn().mockResolvedValue({ id: user.id });
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ ...user, passwordHash }),
        update,
      },
      refreshSession: { updateMany },
      $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
    };

    await expect(createService(prisma).changePassword({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    }, {
      currentPassword,
      newPassword: 'NewPassword123',
    })).resolves.toEqual({ success: true });
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
