import { Injectable } from '@nestjs/common';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class PublicCacheService {
  constructor(private readonly redis: RedisService) {}

  async invalidateCatalog(): Promise<void> {
    await Promise.all([
      this.redis.deleteByPrefix('cache:categories:'),
      this.redis.deleteByPrefix('cache:stores:'),
      this.redis.deleteByPrefix('cache:products:'),
      this.redis.deleteByPrefix('cache:search:'),
    ]);
  }

  async invalidateProducts(): Promise<void> {
    await Promise.all([
      this.redis.deleteByPrefix('cache:products:'),
      this.redis.deleteByPrefix('cache:search:'),
    ]);
  }

  async invalidateStores(): Promise<void> {
    await Promise.all([
      this.redis.deleteByPrefix('cache:stores:'),
      this.redis.deleteByPrefix('cache:categories:'),
      this.redis.deleteByPrefix('cache:search:'),
    ]);
  }
}
