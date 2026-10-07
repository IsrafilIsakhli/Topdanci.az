import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportStatus, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminAnalyticsQueryDto } from './dto/admin-analytics-query.dto';
import { BulkProductActionDto, BulkRejectProductsDto, FlagProductDto } from './dto/bulk-product-action.dto';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import { ListAdminReportsQueryDto } from './dto/list-admin-reports-query.dto';
import { ListAdminStoresQueryDto } from './dto/list-admin-stores-query.dto';
import { ListAdminUsersQueryDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/list-admin-users-query.dto';
import { ListStoreApplicationsQueryDto } from './dto/list-store-applications-query.dto';
import { RejectProductDto, SuspendProductDto } from './dto/review-product.dto';
import { ApproveStoreApplicationDto, RejectStoreApplicationDto } from './dto/review-store-application.dto';
import { CreateAdminCategoryDto, UpdateAdminCategoryDto } from './dto/write-admin-category.dto';

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

  @Get('products')
  listProducts(@Query() query: ListAdminProductsQueryDto) {
    return this.adminService.listProducts(query);
  }

  @Post('products/bulk/approve')
  bulkApproveProducts(@Body() dto: BulkProductActionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.bulkApproveProducts(dto, user);
  }

  @Post('products/bulk/reject')
  bulkRejectProducts(@Body() dto: BulkRejectProductsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.bulkRejectProducts(dto, user);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
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

  @Post('products/:id/flag')
  flagProduct(@Param('id') id: string, @Body() dto: FlagProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.flagProduct(id, dto, user);
  }

  @Get('stores')
  listStores(@Query() query: ListAdminStoresQueryDto) {
    return this.adminService.listStores(query);
  }

  @Get('stores/:id')
  getStore(@Param('id') id: string) {
    return this.adminService.getStore(id);
  }

  @Post('stores/:id/suspend')
  @Roles(UserRole.SUPER_ADMIN)
  suspendStore(@Param('id') id: string, @Body() dto: SuspendProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.suspendStore(id, dto, user);
  }

  @Post('stores/:id/reactivate')
  @Roles(UserRole.SUPER_ADMIN)
  reactivateStore(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.reactivateStore(id, user);
  }

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  listUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/role')
  @Roles(UserRole.SUPER_ADMIN)
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.updateUserRole(id, dto, user);
  }

  @Patch('users/:id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.updateUserStatus(id, dto, user);
  }

  @Get('categories/tree')
  @Roles(UserRole.SUPER_ADMIN)
  categoryTree() {
    return this.adminService.categoryTree();
  }

  @Post('categories')
  @Roles(UserRole.SUPER_ADMIN)
  createCategory(@Body() dto: CreateAdminCategoryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.createCategory(dto, user);
  }

  @Patch('categories/:id')
  @Roles(UserRole.SUPER_ADMIN)
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateAdminCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.updateCategory(id, dto, user);
  }

  @Post('categories/:id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  deactivateCategory(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.deactivateCategory(id, user);
  }

  @Post('categories/:id/reactivate')
  @Roles(UserRole.SUPER_ADMIN)
  reactivateCategory(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.reactivateCategory(id, user);
  }

  @Get('reports')
  listReports(@Query() query: ListAdminReportsQueryDto) {
    return this.adminService.listReports(query);
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return this.adminService.getReport(id);
  }

  @Post('reports/:id/in-review')
  markReportInReview(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.updateReportStatus(id, ReportStatus.IN_REVIEW, user);
  }

  @Post('reports/:id/resolve')
  resolveReport(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.updateReportStatus(id, ReportStatus.RESOLVED, user);
  }

  @Post('reports/:id/reject')
  rejectReport(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.updateReportStatus(id, ReportStatus.REJECTED, user);
  }

  @Get('audit-logs')
  @Roles(UserRole.SUPER_ADMIN)
  auditLogs(@Query() query: ListAuditLogsQueryDto) {
    return this.adminService.auditLogs(query);
  }

  @Get('analytics')
  analytics(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminService.analytics(query);
  }

  @Get('system')
  @Roles(UserRole.SUPER_ADMIN)
  system() {
    return this.adminService.system();
  }
}
