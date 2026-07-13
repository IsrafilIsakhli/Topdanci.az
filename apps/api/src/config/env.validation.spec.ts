import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation';

const baseProductionEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:password@db.example.com:5432/topdanbazar',
  JWT_ACCESS_SECRET: 'strong-access-secret-with-more-than-32-characters',
  JWT_REFRESH_SECRET: 'strong-refresh-secret-with-more-than-32-characters',
  WEB_ORIGIN: 'https://topdanci-az.vercel.app',
  API_ORIGIN: 'https://api.topdanci.az',
  REDIS_URL: 'rediss://default:secret@redis.example.com:6379',
  METRICS_TOKEN: 'private-metrics-token',
  AWS_REGION: 'eu-central-1',
  AWS_S3_BUCKET: 'topdanbazar-prod',
  CDN_BASE_URL: 'https://cdn.topdanci.az',
} as const;

describe('validateEnv', () => {
  it('accepts production origins and cross-site cookie settings', () => {
    const env = validateEnv({
      ...baseProductionEnv,
      AUTH_COOKIE_SAME_SITE: 'none',
      AUTH_COOKIE_SECURE: 'true',
    });

    expect(env.WEB_ORIGIN).toBe('https://topdanci-az.vercel.app');
    expect(env.AUTH_COOKIE_SAME_SITE).toBe('none');
    expect(env.AUTH_COOKIE_SECURE).toBe('true');
  });

  it('rejects localhost origins in production', () => {
    expect(() =>
      validateEnv({
        ...baseProductionEnv,
        WEB_ORIGIN: 'http://localhost:3000',
      }),
    ).toThrow('WEB_ORIGIN must use https in production');
  });

  it('rejects insecure production cookies', () => {
    expect(() =>
      validateEnv({
        ...baseProductionEnv,
        AUTH_COOKIE_SECURE: 'false',
      }),
    ).toThrow('AUTH_COOKIE_SECURE cannot be false in production');
  });
});
