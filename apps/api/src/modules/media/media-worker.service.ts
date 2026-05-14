import { Readable } from 'node:stream';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageStatus } from '@prisma/client';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import sharp from 'sharp';
import { MetricsService } from '../../common/metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { isAllowedProductImageMimeType, maxProductImageSizeBytes } from './domain/media-policy';
import { MEDIA_IMAGE_QUEUE, type ProductImageJobData } from './media-queue.service';

const variantWidths = [320, 640, 1200] as const;

@Injectable()
export class MediaWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaWorkerService.name);
  private connection?: Redis;
  private worker?: Worker<ProductImageJobData>;

  constructor(
    private readonly config: ConfigService,
    private readonly metrics: MetricsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit(): void {
    if (this.config.get('NODE_ENV') === 'test' || this.config.get('MEDIA_WORKER_ENABLED', 'true') === 'false') {
      return;
    }

    this.connection = this.redis.getClient().duplicate({
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
    });
    this.worker = new Worker<ProductImageJobData>(
      MEDIA_IMAGE_QUEUE,
      async (job) => {
        await this.processProductImage(job.data.imageId);
      },
      {
        connection: this.connection,
        concurrency: Number(this.config.get('MEDIA_WORKER_CONCURRENCY', 2)),
      },
    );

    this.worker.on('completed', () => this.metrics.setWorkerMetrics({ ready: true }));
    this.worker.on('failed', (_job, error) => {
      this.metrics.setWorkerMetrics({ ready: true });
      this.logger.warn(
        JSON.stringify({
          event: 'media_image_job_failed',
          message: error.message,
        }),
      );
    });
    this.metrics.setWorkerMetrics({ ready: true });
  }

  async processProductImage(imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        storageKey: true,
        mimeType: true,
        sizeBytes: true,
        productId: true,
      },
    });

    if (!image) {
      return;
    }

    try {
      if (!isAllowedProductImageMimeType(image.mimeType)) {
        throw new Error('Unsupported image content type');
      }

      if (image.sizeBytes > maxProductImageSizeBytes()) {
        throw new Error('Image is too large');
      }

      const bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
      const client = this.s3Client();
      const head = await client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: image.storageKey,
        }),
      );

      if (head.ContentLength && head.ContentLength > maxProductImageSizeBytes()) {
        throw new Error('Stored image is too large');
      }

      if (head.ContentType && !isAllowedProductImageMimeType(head.ContentType)) {
        throw new Error('Stored image content type is unsupported');
      }

      const object = await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: image.storageKey,
        }),
      );
      const body = await streamToBuffer(object.Body);
      const source = sharp(body, { failOn: 'warning' });
      const metadata = await source.metadata();
      const variants: Record<string, string> = {};

      for (const width of variantWidths) {
        const variantKey = variantObjectKey(image.storageKey, width);
        const output = await sharp(body)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: variantKey,
            Body: output,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        );
        variants[`${width}w`] = buildCdnUrl(this.config.get<string>('CDN_BASE_URL', ''), variantKey) ?? variantKey;
      }

      await this.prisma.productImage.update({
        where: { id: image.id },
        data: {
          status: ImageStatus.READY,
          width: metadata.width,
          height: metadata.height,
          variants,
          failureReason: null,
          cdnUrl: variants['1200w'] ?? buildCdnUrl(this.config.get<string>('CDN_BASE_URL', ''), image.storageKey),
        },
        select: { id: true },
      });
    } catch (error) {
      await this.prisma.productImage.update({
        where: { id: image.id },
        data: {
          status: ImageStatus.FAILED,
          failureReason: error instanceof Error ? error.message : 'Image processing failed',
        },
        select: { id: true },
      });
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close().catch(() => undefined);
    await this.connection?.quit().catch(() => undefined);
  }

  private s3Client(): S3Client {
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY', '');

    return new S3Client({
      region: this.config.getOrThrow<string>('AWS_REGION'),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });
  }
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (body instanceof Readable) {
    const chunks: Buffer[] = [];

    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  throw new Error('Unsupported S3 response body');
}

function variantObjectKey(storageKey: string, width: number): string {
  const extensionIndex = storageKey.lastIndexOf('.');

  if (extensionIndex < 0) {
    return `${storageKey}-${width}.webp`;
  }

  return `${storageKey.slice(0, extensionIndex)}-${width}.webp`;
}

function buildCdnUrl(cdnBaseUrl: string, storageKey: string): string | null {
  if (!cdnBaseUrl) {
    return null;
  }

  return `${cdnBaseUrl.replace(/\/+$/, '')}/${storageKey}`;
}
