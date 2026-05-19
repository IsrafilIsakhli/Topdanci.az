import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { MetricsService } from '../../common/metrics/metrics.service';
import { RedisService } from '../redis/redis.service';

export const MEDIA_IMAGE_QUEUE = 'media-image-processing';

export type ProductImageJobData = {
  imageId: string;
};

@Injectable()
export class MediaQueueService implements OnModuleInit, OnModuleDestroy {
  private connection?: Redis;
  private queue?: Queue<ProductImageJobData>;

  constructor(
    private readonly config: ConfigService,
    private readonly metrics: MetricsService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit(): void {
    if (this.config.get('NODE_ENV') === 'test') {
      return;
    }

    this.connection = this.redis.getClient().duplicate({
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
    });
    this.queue = new Queue<ProductImageJobData>(MEDIA_IMAGE_QUEUE, {
      connection: this.connection,
    });
    this.metrics.setWorkerMetrics({ queueReady: true });
  }

  async addProductImageJob(imageId: string): Promise<void> {
    if (!this.queue) {
      return;
    }

    await this.queue.add(
      'product-image-complete',
      { imageId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
    await this.refreshMetrics();
  }

  async refreshMetrics(): Promise<void> {
    if (!this.queue) {
      this.metrics.setWorkerMetrics({ queueReady: false });
      return;
    }

    const counts = await this.queue.getJobCounts('waiting', 'active', 'failed');
    this.metrics.setWorkerMetrics({
      queueReady: true,
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      failed: counts.failed ?? 0,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue?.close().catch(() => undefined);
    await this.connection?.quit().catch(() => undefined);
  }
}
