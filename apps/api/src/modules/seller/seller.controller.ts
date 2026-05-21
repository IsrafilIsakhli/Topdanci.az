import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListSellerProductsQueryDto } from './dto/list-seller-products-query.dto';
import { ListSellerLeadsQueryDto, SellerAnalyticsQueryDto } from './dto/seller-analytics-query.dto';
import { UpdateSellerStoreDto } from './dto/update-seller-store.dto';
import { CreateSellerProductDto, UpdateSellerProductDto } from './dto/write-product.dto';
import { SellerService } from './seller.service';

@ApiTags('seller')
@Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller({
  path: 'seller',
  version: '1',
})
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.sellerService.overview(user);
  }

  @Get('stores')
  listStores(@CurrentUser() user: AuthenticatedUser) {
    return this.sellerService.listStores(user);
  }

  @Get('stores/:id')
  getStore(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.sellerService.getStore(user, id);
  }

  @Patch('stores/:id')
  updateStore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSellerStoreDto,
  ) {
    return this.sellerService.updateStore(user, id, dto);
  }

  @Get('analytics')
  analytics(@CurrentUser() user: AuthenticatedUser, @Query() query: SellerAnalyticsQueryDto) {
    return this.sellerService.analytics(user, query);
  }

  @Get('leads')
  leads(@CurrentUser() user: AuthenticatedUser, @Query() query: ListSellerLeadsQueryDto) {
    return this.sellerService.listLeads(user, query);
  }

  @Get('products')
  listProducts(@CurrentUser() user: AuthenticatedUser, @Query() query: ListSellerProductsQueryDto) {
    return this.sellerService.listProducts(user, query);
  }

  @Get('products/:id')
  getProduct(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.sellerService.getProduct(user, id);
  }

  @Post('products')
  createProduct(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSellerProductDto) {
    return this.sellerService.createProduct(user, dto);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSellerProductDto,
  ) {
    return this.sellerService.updateProduct(user, id, dto);
  }

  @Post('products/:id/submit-review')
  submitProductReview(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.sellerService.submitProductReview(user, id);
  }

  @Delete('products/:id')
  deleteProduct(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.sellerService.deleteProduct(user, id);
  }
}
