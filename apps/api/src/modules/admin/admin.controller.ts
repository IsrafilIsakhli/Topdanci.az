import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import { ListStoreApplicationsQueryDto } from './dto/list-store-applications-query.dto';
import { RejectProductDto, SuspendProductDto } from './dto/review-product.dto';
import { ApproveStoreApplicationDto, RejectStoreApplicationDto } from './dto/review-store-application.dto';

@ApiTags('admin')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller({
  path: 'admin',
  version: '1',
})
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('store-applications')
  listStoreApplications(@Query() query: ListStoreApplicationsQueryDto) {
    return this.adminService.listStoreApplications(query);
  }

  @Get('store-applications/:id')
  getStoreApplication(@Param('id') id: string) {
    return this.adminService.getStoreApplication(id);
  }

  @Post('store-applications/:id/approve')
  approveStoreApplication(
    @Param('id') id: string,
    @Body() dto: ApproveStoreApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.approveStoreApplication(id, dto, user);
  }

  @Post('store-applications/:id/reject')
  rejectStoreApplication(
    @Param('id') id: string,
    @Body() dto: RejectStoreApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.rejectStoreApplication(id, dto, user);
  }

  @Get('products/pending')
  listPendingProducts(@Query() query: ListAdminProductsQueryDto) {
    return this.adminService.listPendingProducts(query);
  }

  @Post('products/:id/approve')
  approveProduct(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.approveProduct(id, user);
  }

  @Post('products/:id/reject')
  rejectProduct(
    @Param('id') id: string,
    @Body() dto: RejectProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.rejectProduct(id, dto, user);
  }

  @Post('products/:id/suspend')
  suspendProduct(
    @Param('id') id: string,
    @Body() dto: SuspendProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.suspendProduct(id, dto, user);
  }
}
