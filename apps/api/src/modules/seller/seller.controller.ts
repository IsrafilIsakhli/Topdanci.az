import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListSellerProductsQueryDto } from './dto/list-seller-products-query.dto';
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

  @Get('products')
  listProducts(@CurrentUser() user: AuthenticatedUser, @Query() query: ListSellerProductsQueryDto) {
    return this.sellerService.listProducts(user, query);
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
