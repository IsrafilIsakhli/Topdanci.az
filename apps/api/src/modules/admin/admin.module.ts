import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [AdminController],
  providers: [AdminService, PublicCacheService],
})
export class AdminModule {}
