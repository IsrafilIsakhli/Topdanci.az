import { Module } from '@nestjs/common';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

@Module({
  controllers: [SellerController],
  providers: [SellerService, PublicCacheService],
})
export class SellerModule {}
