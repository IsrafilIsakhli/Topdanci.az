export type EnvSource = Record<string, string | undefined>;

declare const process:
  | {
      env: EnvSource;
    }
  | undefined;

const defaultEnv: EnvSource = typeof process === 'undefined' ? {} : process.env;

export function requireEnv(name: string, env: EnvSource = defaultEnv): string {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function optionalEnv(
  name: string,
  fallback: string,
  env: EnvSource = defaultEnv,
): string {
  return env[name] || fallback;
}
