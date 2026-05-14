import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private warnedAboutCacheFailure = false;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.getOrThrow<string>('REDIS_URL'), {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<void> {
    await this.ensureConnected();
    await this.client.ping();
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      await this.ensureConnected();
      const value = await this.client.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.warnCacheFailure('cache_get_failed', error);
      return null;
    }
  }

  async getString(key: string): Promise<string | null> {
    await this.ensureConnected();
    return this.client.get(key);
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.ensureConnected();
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.warnCacheFailure('cache_set_failed', error);
    }
  }

  async incrementWithTtl(key: string, ttlSeconds: number): Promise<number> {
    await this.ensureConnected();
    const count = await this.client.incr(key);

    if (count === 1) {
      await this.client.expire(key, ttlSeconds);
    }

    return count;
  }

  async ttlSeconds(key: string): Promise<number> {
    await this.ensureConnected();
    return this.client.ttl(key);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      await this.ensureConnected();
      await this.client.del(...keys);
    } catch (error) {
      this.warnCacheFailure('cache_delete_failed', error);
    }
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    try {
      await this.ensureConnected();
      let cursor = '0';

      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 250);
        cursor = nextCursor;

        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      this.warnCacheFailure('cache_prefix_delete_failed', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => undefined);
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.status === 'ready' || this.client.status === 'connecting') {
      return;
    }

    await this.client.connect();
  }

  private warnCacheFailure(event: string, error: unknown): void {
    if (this.config.get('NODE_ENV') === 'production') {
      this.logger.error(
        JSON.stringify({ event }),
        error instanceof Error ? error.stack : String(error),
      );
      return;
    }

    if (!this.warnedAboutCacheFailure) {
      this.warnedAboutCacheFailure = true;
      this.logger.warn(
        JSON.stringify({
          event,
          message: 'Redis cache is unavailable; continuing without cache in non-production.',
        }),
      );
    }
  }
}
