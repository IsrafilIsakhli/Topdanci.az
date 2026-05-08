import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller({
  path: 'media',
  version: '1',
})
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.mediaService.createUploadUrl(dto);
  }
}
