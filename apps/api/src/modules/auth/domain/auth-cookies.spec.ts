import { describe, expect, it } from 'vitest';
import { ACCESS_COOKIE_NAME, applyAuthCookies, clearAuthCookies, CSRF_COOKIE_NAME, REFRESH_COOKIE_NAME } from './auth-cookies';

describe('auth cookies', () => {
  it('applies cross-site production cookie options', () => {
    const response = cookieResponseStub();

    applyAuthCookies(
      response,
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        csrfToken: 'csrf-token',
      },
      {
        secure: true,
        sameSite: 'none',
        domain: '.topdanci.az',
        accessMaxAgeMs: 900_000,
        refreshMaxAgeMs: 2_592_000_000,
      },
    );

    expect(response.cookies).toEqual([
      [
        ACCESS_COOKIE_NAME,
        'access-token',
        expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'none', domain: '.topdanci.az' }),
      ],
      [
        REFRESH_COOKIE_NAME,
        'refresh-token',
        expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'none', domain: '.topdanci.az' }),
      ],
      [
        CSRF_COOKIE_NAME,
        'csrf-token',
        expect.objectContaining({ httpOnly: false, secure: true, sameSite: 'none', domain: '.topdanci.az' }),
      ],
    ]);
  });

  it('clears cookies with the same production options', () => {
    const response = cookieResponseStub();

    clearAuthCookies(response, {
      secure: true,
      sameSite: 'none',
      domain: '.topdanci.az',
      accessMaxAgeMs: 900_000,
      refreshMaxAgeMs: 2_592_000_000,
    });

    expect(response.cleared).toEqual([
      [ACCESS_COOKIE_NAME, { path: '/', domain: '.topdanci.az', sameSite: 'none', secure: true }],
      [REFRESH_COOKIE_NAME, { path: '/', domain: '.topdanci.az', sameSite: 'none', secure: true }],
      [CSRF_COOKIE_NAME, { path: '/', domain: '.topdanci.az', sameSite: 'none', secure: true }],
    ]);
  });
});

function cookieResponseStub() {
  return {
    cookies: [] as unknown[],
    cleared: [] as unknown[],
    cookie(name: string, value: string, options: unknown) {
      this.cookies.push([name, value, options]);
    },
    clearCookie(name: string, options: unknown) {
      this.cleared.push([name, options]);
    },
  };
}
