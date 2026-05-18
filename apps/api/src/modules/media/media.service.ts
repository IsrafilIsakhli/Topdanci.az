import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  isAllowedProductImageMimeType,
  isFileNameAllowedForMimeType,
  maxProductImageSizeBytes,
  productImageObjectKey,
} from './domain/media-policy';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { MediaQueueService } from './media-queue.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly audit: AuditService,
    private readonly cache: PublicCacheService,
    private readonly config: ConfigService,
    private readonly mediaQueue: MediaQueueService,
    private readonly prisma: PrismaService,
  ) {}

  async createUploadUrl(dto: CreateUploadUrlDto, user: AuthenticatedUser) {
    if (!isAllowedProductImageMimeType(dto.contentType)) {
      throw new BadRequestException('Unsupported image content type');
    }

    if (!isFileNameAllowedForMimeType(dto.fileName, dto.contentType)) {
      throw new BadRequestException('Image extension does not match content type');
    }

    if (dto.sizeBytes > maxProductImageSizeBytes()) {
      throw new BadRequestException('Image is too large');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: {
        id: true,
        storeId: true,
        store: {
          select: {
            members: {
              where: { userId: user.id },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!canManageProduct(user, product.store.members.length > 0)) {
      throw new ForbiddenException('Product media access denied');
    }

    const storageKey = productImageObjectKey(product.storeId, product.id, dto.fileName);
    const cdnUrl = buildCdnUrl(this.config.get<string>('CDN_BASE_URL', ''), storageKey);
    const uploadUrl = await this.createSignedPutUrl(storageKey, dto.contentType);
    const image = await this.prisma.productImage.create({
      data: {
        productId: product.id,
        storageKey,
        ...(cdnUrl ? { cdnUrl } : {}),
        mimeType: dto.contentType,
        sizeBytes: dto.sizeBytes,
      },
      select: { id: true },
    });

    await this.audit.record({
      actorId: user.id,
      action: 'MEDIA_UPLOAD_URL_CREATED',
      resourceType: 'ProductImage',
      resourceId: image.id,
      metadata: {
        productId: product.id,
        storeId: product.storeId,
        mimeType: dto.contentType,
        sizeBytes: dto.sizeBytes,
      },
    });

    return {
      data: {
        imageId: image.id,
        storageKey,
        uploadUrl,
        cdnUrl,
        expiresInSeconds: 300,
        contentType: dto.contentType,
        maxSizeBytes: maxProductImageSizeBytes(),
        status: 'UPLOADING',
        headers: {
          'content-type': dto.contentType,
        },
      },
    };
  }

  async completeProductImage(imageId: string, user: AuthenticatedUser) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        status: true,
        product: {
          select: {
            id: true,
            storeId: true,
            store: {
              select: {
                members: {
                  where: { userId: user.id },
                  take: 1,
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    if (!canManageProduct(user, image.product.store.members.length > 0)) {
      throw new ForbiddenException('Product media access denied');
    }

    if (image.status !== 'UPLOADING') {
      throw new BadRequestException('Product image is not waiting for upload completion');
    }

    await this.mediaQueue.addProductImageJob(image.id);
    await this.cache.invalidateProducts();
    await this.audit.record({
      actorId: user.id,
      action: 'MEDIA_UPLOAD_COMPLETED',
      resourceType: 'ProductImage',
      resourceId: image.id,
      metadata: {
        productId: image.product.id,
        storeId: image.product.storeId,
      },
    });

    return {
      data: {
        imageId: image.id,
        status: 'PROCESSING',
      },
    };
  }

  private async createSignedPutUrl(storageKey: string, contentType: string): Promise<string> {
    const bucket = this.config.get<string>('AWS_S3_BUCKET', '');
    const region = this.config.get<string>('AWS_REGION', '');

    if (!bucket || !region) {
      throw new ServiceUnavailableException('Media storage is not configured');
    }

    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY', '');
    const client = new S3Client({
      region,
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });

    return getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: contentType,
      }),
      { expiresIn: 300 },
    );
  }
}

function canManageProduct(user: AuthenticatedUser, hasStoreMembership: boolean): boolean {
  return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN || hasStoreMembership;
}

function buildCdnUrl(cdnBaseUrl: string, storageKey: string): string | null {
  if (!cdnBaseUrl) {
    return null;
  }

  return `${cdnBaseUrl.replace(/\/+$/, '')}/${storageKey}`;
}
