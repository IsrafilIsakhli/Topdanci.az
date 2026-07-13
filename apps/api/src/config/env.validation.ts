type Environment = Record<string, string | undefined>;

const requiredInAllEnvironments = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

export type AppEnvironment = Environment & {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  WEB_ORIGIN: string;
  API_ORIGIN: string;
  RATE_LIMIT_TTL_MS: string;
  RATE_LIMIT_MAX: string;
  API_BODY_LIMIT: string;
  REQUEST_TIMEOUT_MS: string;
  METRICS_TOKEN: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  LEAD_HASH_SALT: string;
  AUTH_ACCESS_TOKEN_TTL_SECONDS: string;
  AUTH_REFRESH_TOKEN_TTL_SECONDS: string;
  AUTH_COOKIE_SAME_SITE: 'lax' | 'none' | 'strict';
  AUTH_COOKIE_DOMAIN: string;
  AUTH_COOKIE_SECURE: string;
  LOGIN_FAILURE_LIMIT: string;
  LOGIN_FAILURE_WINDOW_SECONDS: string;
  MEDIA_WORKER_ENABLED: string;
  MEDIA_WORKER_CONCURRENCY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  CDN_BASE_URL: string;
};

export function validateEnv(env: Environment): AppEnvironment {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const authCookieSameSite = normalizeCookieSameSite(env.AUTH_COOKIE_SAME_SITE);
  const authCookieSecure = normalizeBooleanString(env.AUTH_COOKIE_SECURE);

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be development, test, or production. Received: ${nodeEnv}`);
  }

  for (const key of requiredInAllEnvironments) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  if (nodeEnv === 'production') {
    assertProductionSecret('JWT_ACCESS_SECRET', env.JWT_ACCESS_SECRET);
    assertProductionSecret('JWT_REFRESH_SECRET', env.JWT_REFRESH_SECRET);
    assertRequiredProductionValue('WEB_ORIGIN', env.WEB_ORIGIN);
    assertRequiredProductionValue('API_ORIGIN', env.API_ORIGIN);
    assertRequiredProductionValue('REDIS_URL', env.REDIS_URL);
    assertRequiredProductionValue('METRICS_TOKEN', env.METRICS_TOKEN);
    assertRequiredProductionValue('AWS_REGION', env.AWS_REGION);
    assertRequiredProductionValue('AWS_S3_BUCKET', env.AWS_S3_BUCKET);
    assertRequiredProductionValue('CDN_BASE_URL', env.CDN_BASE_URL);
    assertProductionOrigin('WEB_ORIGIN', env.WEB_ORIGIN);
    assertProductionOrigin('API_ORIGIN', env.API_ORIGIN);

    if (authCookieSecure === 'false') {
      throw new Error('AUTH_COOKIE_SECURE cannot be false in production');
    }
  }

  return {
    ...env,
    NODE_ENV: nodeEnv as AppEnvironment['NODE_ENV'],
    PORT: env.PORT ?? '4000',
    DATABASE_URL: env.DATABASE_URL!,
    REDIS_URL: env.REDIS_URL ?? 'redis://localhost:6379',
    WEB_ORIGIN: env.WEB_ORIGIN ?? 'http://localhost:3000',
    API_ORIGIN: env.API_ORIGIN ?? 'http://localhost:4000',
    RATE_LIMIT_TTL_MS: env.RATE_LIMIT_TTL_MS ?? '60000',
    RATE_LIMIT_MAX: env.RATE_LIMIT_MAX ?? '120',
    API_BODY_LIMIT: env.API_BODY_LIMIT ?? '256kb',
    REQUEST_TIMEOUT_MS: env.REQUEST_TIMEOUT_MS ?? '15000',
    METRICS_TOKEN: env.METRICS_TOKEN ?? '',
    JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET!,
    LEAD_HASH_SALT: env.LEAD_HASH_SALT ?? env.JWT_ACCESS_SECRET!,
    AUTH_ACCESS_TOKEN_TTL_SECONDS: env.AUTH_ACCESS_TOKEN_TTL_SECONDS ?? '900',
    AUTH_REFRESH_TOKEN_TTL_SECONDS: env.AUTH_REFRESH_TOKEN_TTL_SECONDS ?? '2592000',
    AUTH_COOKIE_SAME_SITE: authCookieSameSite,
    AUTH_COOKIE_DOMAIN: env.AUTH_COOKIE_DOMAIN ?? '',
    AUTH_COOKIE_SECURE: authCookieSecure ?? '',
    LOGIN_FAILURE_LIMIT: env.LOGIN_FAILURE_LIMIT ?? '5',
    LOGIN_FAILURE_WINDOW_SECONDS: env.LOGIN_FAILURE_WINDOW_SECONDS ?? '900',
    MEDIA_WORKER_ENABLED: env.MEDIA_WORKER_ENABLED ?? 'true',
    MEDIA_WORKER_CONCURRENCY: env.MEDIA_WORKER_CONCURRENCY ?? '2',
    AWS_REGION: env.AWS_REGION ?? env.S3_REGION ?? '',
    AWS_S3_BUCKET: env.AWS_S3_BUCKET ?? env.S3_BUCKET ?? '',
    AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID ?? env.S3_ACCESS_KEY_ID ?? '',
    AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY ?? env.S3_SECRET_ACCESS_KEY ?? '',
    CDN_BASE_URL: env.CDN_BASE_URL ?? '',
  };
}

function assertProductionSecret(name: string, value: string | undefined): void {
  if (!value || value.length < 32 || value === 'change-me') {
    throw new Error(`${name} must be a strong production secret with at least 32 characters`);
  }
}

function assertRequiredProductionValue(name: string, value: string | undefined): void {
  if (!value) {
    throw new Error(`${name} is required in production`);
  }
}

function normalizeCookieSameSite(value: string | undefined): AppEnvironment['AUTH_COOKIE_SAME_SITE'] {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return 'lax';
  }

  if (normalized === 'lax' || normalized === 'none' || normalized === 'strict') {
    return normalized;
  }

  throw new Error('AUTH_COOKIE_SAME_SITE must be lax, none, or strict');
}

function normalizeBooleanString(value: string | undefined): 'true' | 'false' | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized === 'true' || normalized === 'false') {
    return normalized;
  }

  throw new Error('AUTH_COOKIE_SECURE must be true or false when provided');
}

function assertProductionOrigin(name: string, value: string | undefined): void {
  const origins = (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of origins) {
    let parsed: URL;

    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`${name} must contain valid absolute URL origins`);
    }

    if (parsed.protocol !== 'https:') {
      throw new Error(`${name} must use https in production`);
    }

    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname)) {
      throw new Error(`${name} cannot point to localhost in production`);
    }
  }
}
