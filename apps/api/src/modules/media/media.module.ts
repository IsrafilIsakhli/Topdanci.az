import { Module } from '@nestjs/common';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { MediaController } from './media.controller';
import { MediaQueueService } from './media-queue.service';
import { MediaService } from './media.service';
import { MediaWorkerService } from './media-worker.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaQueueService, MediaWorkerService, PublicCacheService],
  exports: [MediaService],
})
export class MediaModule {}
