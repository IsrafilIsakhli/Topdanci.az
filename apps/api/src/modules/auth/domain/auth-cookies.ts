export const ACCESS_COOKIE_NAME = 'tb_access';
export const REFRESH_COOKIE_NAME = 'tb_refresh';
export const CSRF_COOKIE_NAME = 'tb_csrf';

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: AuthCookieSameSite;
  domain?: string;
  path?: string;
  maxAge?: number;
};

export type CookieResponse = {
  cookie(name: string, value: string, options: CookieOptions): void;
  clearCookie(name: string, options: Pick<CookieOptions, 'domain' | 'path' | 'sameSite' | 'secure'>): void;
};

export type AuthCookieSameSite = 'lax' | 'none' | 'strict';

export type AuthCookieConfig = {
  secure: boolean;
  sameSite: AuthCookieSameSite;
  domain?: string;
  accessMaxAgeMs: number;
  refreshMaxAgeMs: number;
};

export function applyAuthCookies(
  response: CookieResponse,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string },
  config: AuthCookieConfig,
): void {
  const baseOptions = {
    httpOnly: true,
    secure: config.secure,
    sameSite: config.sameSite,
    path: '/',
    ...(config.domain ? { domain: config.domain } : {}),
  };

  response.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...baseOptions,
    maxAge: config.accessMaxAgeMs,
  });
  response.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...baseOptions,
    maxAge: config.refreshMaxAgeMs,
  });
  response.cookie(CSRF_COOKIE_NAME, tokens.csrfToken, {
    httpOnly: false,
    secure: config.secure,
    sameSite: config.sameSite,
    path: '/',
    ...(config.domain ? { domain: config.domain } : {}),
    maxAge: config.refreshMaxAgeMs,
  });
}

export function clearAuthCookies(response: CookieResponse, config?: AuthCookieConfig): void {
  const clearOptions = {
    path: '/',
    ...(config?.domain ? { domain: config.domain } : {}),
    ...(config?.sameSite ? { sameSite: config.sameSite } : {}),
    ...(typeof config?.secure === 'boolean' ? { secure: config.secure } : {}),
  };

  response.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
  response.clearCookie(REFRESH_COOKIE_NAME, clearOptions);
  response.clearCookie(CSRF_COOKIE_NAME, clearOptions);
}

export function parseCookieHeader(cookieHeader: string | string[] | undefined): Record<string, string> {
  const header = Array.isArray(cookieHeader) ? cookieHeader.join(';') : cookieHeader;

  if (!header) {
    return {};
  }

  return header.split(';').reduce<Record<string, string>>((cookies, pair) => {
    const separatorIndex = pair.indexOf('=');

    if (separatorIndex < 0) {
      return cookies;
    }

    const name = pair.slice(0, separatorIndex).trim();
    const rawValue = pair.slice(separatorIndex + 1).trim();

    if (!name) {
      return cookies;
    }

    cookies[name] = safeDecode(rawValue);
    return cookies;
  }, {});
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
