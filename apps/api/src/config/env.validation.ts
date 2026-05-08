type Environment = Record<string, string | undefined>;

const requiredInAllEnvironments = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

export type AppEnvironment = Environment & {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: string;
  DATABASE_URL: string;
  WEB_ORIGIN: string;
  API_ORIGIN: string;
  RATE_LIMIT_TTL_MS: string;
  RATE_LIMIT_MAX: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
};

export function validateEnv(env: Environment): AppEnvironment {
  const nodeEnv = env.NODE_ENV ?? 'development';

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
  }

  return {
    ...env,
    NODE_ENV: nodeEnv as AppEnvironment['NODE_ENV'],
    PORT: env.PORT ?? '4000',
    DATABASE_URL: env.DATABASE_URL!,
    WEB_ORIGIN: env.WEB_ORIGIN ?? 'http://localhost:3000',
    API_ORIGIN: env.API_ORIGIN ?? 'http://localhost:4000',
    RATE_LIMIT_TTL_MS: env.RATE_LIMIT_TTL_MS ?? '60000',
    RATE_LIMIT_MAX: env.RATE_LIMIT_MAX ?? '120',
    JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET!,
  };
}

function assertProductionSecret(name: string, value: string | undefined): void {
  if (!value || value.length < 32 || value === 'change-me') {
    throw new Error(`${name} must be a strong production secret with at least 32 characters`);
  }
}
