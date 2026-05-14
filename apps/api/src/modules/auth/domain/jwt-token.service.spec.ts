import { describe, expect, it } from 'vitest';
import { UserRole, UserStatus } from '@prisma/client';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  it('creates and verifies access tokens', () => {
    const service = new JwtTokenService(configServiceStub());
    const token = service.createAccessToken({
      id: 'user_1',
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      email: 'seller@topdanci.az',
    });

    expect(service.verifyAccessToken(token)).toEqual({
      id: 'user_1',
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      email: 'seller@topdanci.az',
    });
  });

  it('rejects malformed tokens', () => {
    const service = new JwtTokenService(configServiceStub());

    expect(service.verifyAccessToken('not-a-jwt')).toBeNull();
  });

  it('rejects tokens signed with another secret', () => {
    const service = new JwtTokenService(configServiceStub('first-secret'));
    const otherService = new JwtTokenService(configServiceStub('second-secret'));
    const token = service.createAccessToken({
      id: 'user_1',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    expect(otherService.verifyAccessToken(token)).toBeNull();
  });
});

function configServiceStub(secret = 'test-access-secret-with-enough-length') {
  return {
    get: (key: string, fallback?: unknown) => {
      if (key === 'AUTH_ACCESS_TOKEN_TTL_SECONDS') {
        return 900;
      }

      return fallback;
    },
    getOrThrow: (key: string) => {
      if (key === 'JWT_ACCESS_SECRET') {
        return secret;
      }

      throw new Error(`Unexpected config key: ${key}`);
    },
  } as never;
}
