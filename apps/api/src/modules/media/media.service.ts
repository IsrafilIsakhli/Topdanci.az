import { Injectable } from '@nestjs/common';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';

@Injectable()
export class MediaService {
  createUploadUrl(dto: CreateUploadUrlDto) {
    return {
      data: {
        storageKey: `pending/${Date.now()}-${dto.fileName}`,
        uploadUrl: 'https://example.invalid/upload-url-will-be-signed-by-s3',
        contentType: dto.contentType,
        maxSizeBytes: 10_000_000,
      },
    };
  }
}
