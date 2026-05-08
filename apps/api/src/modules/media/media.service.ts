import { BadRequestException, Injectable } from '@nestjs/common';
import {
  isAllowedProductImageMimeType,
  maxProductImageSizeBytes,
  productImageObjectKey,
} from './domain/media-policy';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';

@Injectable()
export class MediaService {
  createUploadUrl(dto: CreateUploadUrlDto) {
    if (!isAllowedProductImageMimeType(dto.contentType)) {
      throw new BadRequestException('Unsupported image content type');
    }

    if (dto.sizeBytes > maxProductImageSizeBytes()) {
      throw new BadRequestException('Image is too large');
    }

    const storageKey = productImageObjectKey('pending-store', 'pending-product', dto.fileName);

    return {
      data: {
        storageKey,
        uploadUrl: 'https://example.invalid/upload-url-will-be-signed-by-s3',
        contentType: dto.contentType,
        maxSizeBytes: maxProductImageSizeBytes(),
      },
    };
  }
}
