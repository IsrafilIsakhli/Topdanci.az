import { Logger } from '@nestjs/common';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import { RedisService } from './redis.service';

type ThrottlerRecord = Awaited<ReturnType<ThrottlerStorage['increment']>>;

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly fallback = new ThrottlerStorageService();
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private warnedAboutFallback = false;

  constructor(
    private readonly redis: RedisService,
    private readonly fallbackEnabled: boolean,
  ) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerRecord> {
    try {
      const redisKey = safeRedisKey(key);
      const hitKey = `throttle:${throttlerName}:${redisKey}:hits`;
      const blockKey = `throttle:${throttlerName}:${redisKey}:block`;
      const client = this.redis.getClient();
      await this.redis.ping();

      const blockTtl = await client.pttl(blockKey);

      if (blockTtl > 0) {
        return {
          totalHits: limit + 1,
          timeToExpire: Math.max(await client.pttl(hitKey), 0),
          isBlocked: true,
          timeToBlockExpire: blockTtl,
        };
      }

      const totalHits = await client.incr(hitKey);

      if (totalHits === 1) {
        await client.pexpire(hitKey, ttl);
      }

      const timeToExpire = Math.max(await client.pttl(hitKey), ttl);

      if (totalHits > limit) {
        await client.psetex(blockKey, blockDuration, '1');
        return {
          totalHits,
          timeToExpire,
          isBlocked: true,
          timeToBlockExpire: blockDuration,
        };
      }

      return {
        totalHits,
        timeToExpire,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    } catch (error) {
      if (!this.fallbackEnabled) {
        throw error;
      }

      if (!this.warnedAboutFallback) {
        this.warnedAboutFallback = true;
        this.logger.warn(
          JSON.stringify({
            event: 'redis_rate_limit_fallback',
            message: 'Redis throttling unavailable; using in-memory throttling in non-production.',
          }),
        );
      }

      return this.fallback.increment(key, ttl, limit, blockDuration, throttlerName);
    }
  }
}

function safeRedisKey(value: string): string {
  return value.replaceAll(/[^a-zA-Z0-9:._-]/g, '_').slice(0, 200);
}
