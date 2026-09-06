import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import {
  CompleteStoreAssetUploadDto,
  CreateStoreAssetUploadUrlDto,
} from './dto/create-store-asset-upload-url.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller({
  path: 'media',
  version: '1',
})
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  createUploadUrl(@Body() dto: CreateUploadUrlDto, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.createUploadUrl(dto, user);
  }

  @Post('store-assets/upload-url')
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  createStoreAssetUploadUrl(
    @Body() dto: CreateStoreAssetUploadUrlDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaService.createStoreAssetUploadUrl(dto, user);
  }

  @Post('store-assets/:storeId/complete')
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  completeStoreAsset(
    @Param('storeId') storeId: string,
    @Body() dto: CompleteStoreAssetUploadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaService.completeStoreAsset(storeId, dto, user);
  }

  @Post('product-images/:id/complete')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  completeProductImage(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.completeProductImage(id, user);
  }
}
