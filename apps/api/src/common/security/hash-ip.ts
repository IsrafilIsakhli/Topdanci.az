import { createHash } from 'node:crypto';

export function hashIpAddress(ipAddress: string, salt: string): string {
  return hashSensitiveValue(ipAddress, salt);
}

export function hashSensitiveValue(value: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}
