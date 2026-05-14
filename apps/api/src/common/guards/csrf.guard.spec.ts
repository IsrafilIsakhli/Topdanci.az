import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  it('allows safe methods without csrf token', () => {
    const guard = new CsrfGuard(privateRouteReflector());
    expect(guard.canActivate(contextFor({ method: 'GET' }))).toBe(true);
  });

  it('rejects unsafe private mutations without matching csrf token', () => {
    const guard = new CsrfGuard(privateRouteReflector());

    expect(() => guard.canActivate(contextFor({ method: 'POST' }))).toThrow(ForbiddenException);
  });

  it('allows unsafe private mutations with matching csrf cookie and header', () => {
    const guard = new CsrfGuard(privateRouteReflector());

    expect(
      guard.canActivate(
        contextFor({
          method: 'POST',
          headers: {
            cookie: 'tb_csrf=abc123',
            'x-csrf-token': 'abc123',
          },
        }),
      ),
    ).toBe(true);
  });
});

function privateRouteReflector() {
  return {
    getAllAndOverride: () => false,
  } as never;
}

function contextFor(request: { method: string; headers?: Record<string, string> }): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({
        method: request.method,
        headers: request.headers ?? {},
      }),
    }),
  } as unknown as ExecutionContext;
}
