import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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
  storeAssetObjectKey,
} from './domain/media-policy';
import {
  CompleteStoreAssetUploadDto,
  CreateStoreAssetUploadUrlDto,
  StoreAssetKindDto,
} from './dto/create-store-asset-upload-url.dto';
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

  async createStoreAssetUploadUrl(dto: CreateStoreAssetUploadUrlDto, user: AuthenticatedUser) {
    this.assertValidImage(dto.fileName, dto.contentType, dto.sizeBytes);
    await this.assertCanManageStore(dto.storeId, user);

    const storageKey = storeAssetObjectKey(dto.storeId, dto.kind, dto.fileName);
    const uploadUrl = await this.createSignedPutUrl(storageKey, dto.contentType);
    const cdnUrl = buildCdnUrl(this.config.get<string>('CDN_BASE_URL', ''), storageKey);

    await this.audit.record({
      actorId: user.id,
      action: 'STORE_ASSET_UPLOAD_URL_CREATED',
      resourceType: 'Store',
      resourceId: dto.storeId,
      metadata: {
        kind: dto.kind,
        storageKey,
        mimeType: dto.contentType,
        sizeBytes: dto.sizeBytes,
      },
    });

    return {
      data: {
        storeId: dto.storeId,
        kind: dto.kind,
        storageKey,
        uploadUrl,
        cdnUrl,
        expiresInSeconds: 300,
        headers: { 'content-type': dto.contentType },
      },
    };
  }

  async completeStoreAsset(storeId: string, dto: CompleteStoreAssetUploadDto, user: AuthenticatedUser) {
    this.assertValidImage(dto.storageKey, dto.contentType, dto.sizeBytes);
    await this.assertCanManageStore(storeId, user);

    const expectedPrefix = `stores/${storeId}/assets/${dto.kind}/`;
    if (!dto.storageKey.startsWith(expectedPrefix)) {
      throw new ForbiddenException('Store asset key is outside the allowed store path');
    }

    await this.verifyUploadedObject(dto.storageKey, dto.contentType, dto.sizeBytes);
    await this.prisma.store.update({
      where: { id: storeId },
      data:
        dto.kind === StoreAssetKindDto.LOGO
          ? { logoKey: dto.storageKey }
          : { bannerKey: dto.storageKey },
      select: { id: true },
    });

    await this.cache.invalidateStores();
    await this.audit.record({
      actorId: user.id,
      action: 'STORE_ASSET_UPLOAD_COMPLETED',
      resourceType: 'Store',
      resourceId: storeId,
      metadata: {
        kind: dto.kind,
        storageKey: dto.storageKey,
        mimeType: dto.contentType,
        sizeBytes: dto.sizeBytes,
      },
    });

    return {
      data: {
        storeId,
        kind: dto.kind,
        storageKey: dto.storageKey,
        cdnUrl: buildCdnUrl(this.config.get<string>('CDN_BASE_URL', ''), dto.storageKey),
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
    if (!bucket) {
      throw new ServiceUnavailableException('Media storage is not configured');
    }

    return getSignedUrl(
      this.createS3Client(),
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: contentType,
      }),
      { expiresIn: 300 },
    );
  }

  private async assertCanManageStore(storeId: string, user: AuthenticatedUser): Promise<void> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        members: {
          where: { userId: user.id },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (!canManageProduct(user, store.members.length > 0)) {
      throw new ForbiddenException('Store media access denied');
    }
  }

  private assertValidImage(fileName: string, contentType: string, sizeBytes: number): void {
    if (!isAllowedProductImageMimeType(contentType)) {
      throw new BadRequestException('Unsupported image content type');
    }

    if (!isFileNameAllowedForMimeType(fileName, contentType)) {
      throw new BadRequestException('Image extension does not match content type');
    }

    if (sizeBytes > maxProductImageSizeBytes()) {
      throw new BadRequestException('Image is too large');
    }
  }

  private async verifyUploadedObject(storageKey: string, contentType: string, sizeBytes: number): Promise<void> {
    const bucket = this.config.get<string>('AWS_S3_BUCKET', '');
    if (!bucket) {
      throw new ServiceUnavailableException('Media storage is not configured');
    }

    try {
      const object = await this.createS3Client().send(
        new HeadObjectCommand({ Bucket: bucket, Key: storageKey }),
      );
      const uploadedType = object.ContentType?.split(';')[0]?.trim();
      if (object.ContentLength !== sizeBytes || uploadedType !== contentType) {
        throw new BadRequestException('Uploaded store asset does not match the declared file');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Uploaded store asset could not be verified');
    }
  }

  private createS3Client(): S3Client {
    const region = this.config.get<string>('AWS_REGION', '');
    if (!region) {
      throw new ServiceUnavailableException('Media storage is not configured');
    }

    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY', '');
    return new S3Client({
      region,
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
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
