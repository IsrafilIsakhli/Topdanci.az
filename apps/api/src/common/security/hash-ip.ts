import { createHash } from 'node:crypto';

export function hashIpAddress(ipAddress: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ipAddress}`).digest('hex');
}
