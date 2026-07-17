import { randomBytes } from 'node:crypto';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApplicationStatus,
  CategoryStatus,
  NotificationType,
  PriceType,
  Prisma,
  ProductStatus,
  ReportStatus,
  StoreRole,
  StoreStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { MetricsService } from '../../common/metrics/metrics.service';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { toCursorPagination } from '../../common/pagination/cursor-pagination';
import { hashSensitiveValue } from '../../common/security/hash-ip';
import { slugify } from '../../common/slug/slugify';
import { MediaQueueService } from '../media/media-queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type { AdminAnalyticsQueryDto } from './dto/admin-analytics-query.dto';
import type { BulkProductActionDto, BulkRejectProductsDto, FlagProductDto } from './dto/bulk-product-action.dto';
import type { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';
import type { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import type { ListAdminReportsQueryDto } from './dto/list-admin-reports-query.dto';
import type { ListAdminStoresQueryDto } from './dto/list-admin-stores-query.dto';
import type { ListAdminUsersQueryDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/list-admin-users-query.dto';
import type { ListStoreApplicationsQueryDto } from './dto/list-store-applications-query.dto';
import type { RejectProductDto, SuspendProductDto } from './dto/review-product.dto';
import type {
  ApproveStoreApplicationDto,
  RejectStoreApplicationDto,
} from './dto/review-store-application.dto';
import type { CreateAdminCategoryDto, UpdateAdminCategoryDto } from './dto/write-admin-category.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly cache: PublicCacheService,
    private readonly config: ConfigService,
    private readonly mediaQueue: MediaQueueService,
    private readonly metrics: MetricsService,
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async overview() {
    const today = startOfToday();
    const [
      pendingStores,
      pendingProducts,
      openReports,
      activeStores,
      activeProducts,
      todayLeadEvents,
      whatsappClicksToday,
      recentStoreApplications,
      recentPendingProducts,
      recentReports,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.storeApplication.count({ where: { status: ApplicationStatus.PENDING } }),
      this.prisma.product.count({ where: { status: ProductStatus.PENDING_REVIEW } }),
      this.prisma.report.count({ where: { status: ReportStatus.OPEN } }),
      this.prisma.store.count({ where: { status: StoreStatus.ACTIVE } }),
      this.prisma.product.count({ where: { status: ProductStatus.ACTIVE, store: { status: StoreStatus.ACTIVE } } }),
      this.prisma.leadEvent.count({ where: { createdAt: { gte: today } } }),
      this.prisma.leadEvent.count({ where: { type: 'WHATSAPP_CLICK', createdAt: { gte: today } } }),
      this.prisma.storeApplication.findMany({
        where: { status: ApplicationStatus.PENDING },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 5,
        select: storeApplicationSelect,
      }),
      this.prisma.product.findMany({
        where: { status: ProductStatus.PENDING_REVIEW },
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
        take: 5,
        select: moderationProductSelect,
      }),
      this.prisma.report.findMany({
        where: { status: ReportStatus.OPEN },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 5,
        select: reportSelect,
      }),
      this.prisma.auditLog.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 5,
        select: auditLogSelect,
      }),
    ]);

    return {
      data: {
        pendingStores,
        pendingProducts,
        reports: openReports,
        openReports,
        activeStores,
        activeProducts,
        todayLeadEvents,
        whatsappClicksToday,
        recentStoreApplications,
        recentPendingProducts: recentPendingProducts.map(mapModerationProduct),
        recentReports: recentReports.map(mapReport),
        recentAuditLogs: recentAuditLogs.map(mapAuditLog),
      },
    };
  }

  async listStoreApplications(query: ListStoreApplicationsQueryDto) {
    const { take, cursor, skip } = toCursorPagination(query);
    const where = query.status ? { status: query.status } : {};
    const [applications, total] = await Promise.all([
      this.prisma.storeApplication.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: storeApplicationSelect,
      }),
      this.prisma.storeApplication.count({ where }),
    ]);
    const page = applications.slice(0, take);

    return {
      data: page,
      meta: {
        total,
        nextCursor: applications.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  async getStoreApplication(id: string) {
    const application = await this.prisma.storeApplication.findUnique({
      where: { id },
      select: storeApplicationSelect,
    });

    if (!application) {
      throw new NotFoundException('Store application not found');
    }

    return { data: application };
  }

  async approveStoreApplication(id: string, dto: ApproveStoreApplicationDto, admin: AuthenticatedUser) {
    const now = new Date();
    const setupToken = randomBytes(32).toString('base64url');
    const setupTokenHash = this.hashSetupToken(setupToken);
    const setupTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.$transaction(async (tx) => {
      const application = await tx.storeApplication.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          contactName: true,
          contactPhone: true,
          contactEmail: true,
          companyName: true,
          taxNumber: true,
          categoryId: true,
          city: true,
          district: true,
          description: true,
        },
      });

      if (!application) {
        throw new NotFoundException('Store application not found');
      }

      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Store application is already reviewed');
      }

      const seller = await this.upsertSellerUser(tx, application);
      const storeSlug = await this.uniqueStoreSlug(tx, dto.storeSlug ?? application.companyName);
      const store = await tx.store.create({
        data: {
          ownerUserId: seller.id,
          reviewedById: admin.id,
          categoryId: application.categoryId,
          slug: storeSlug,
          name: application.companyName,
          legalName: application.companyName,
          taxNumber: application.taxNumber,
          description: application.description,
          status: StoreStatus.ACTIVE,
          phone: application.contactPhone,
          whatsappNumber: application.contactPhone,
          email: application.contactEmail,
          city: application.city,
          district: application.district,
          verifiedAt: now,
          publishedAt: now,
        },
        select: { id: true, slug: true, name: true },
      });

      await tx.storeMember.create({
        data: {
          storeId: store.id,
          userId: seller.id,
          role: StoreRole.OWNER,
        },
        select: { id: true },
      });

      await tx.accountSetupToken.create({
        data: {
          userId: seller.id,
          tokenHash: setupTokenHash,
          expiresAt: setupTokenExpiresAt,
        },
        select: { id: true },
      });

      await tx.storeApplication.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedById: admin.id,
          reviewedAt: now,
          ...(dto.reviewNote ? { reviewNote: dto.reviewNote } : {}),
        },
        select: { id: true },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: 'ADMIN_STORE_APPLICATION_APPROVED',
          resourceType: 'StoreApplication',
          resourceId: application.id,
          metadata: {
            storeId: store.id,
            sellerUserId: seller.id,
            reviewNote: dto.reviewNote ?? null,
          },
        },
      });

      return {
        data: {
          applicationId: application.id,
          seller: {
            id: seller.id,
            email: seller.email,
            phone: seller.phone,
          },
          store,
          setup: {
            token: setupToken,
            url: `${this.config.get<string>('WEB_ORIGIN', 'http://localhost:3000').replace(/\/+$/, '')}/account/setup?token=${setupToken}`,
            expiresAt: setupTokenExpiresAt,
          },
        },
      };
    });

    await this.cache.invalidateStores();
    await this.notifications.createForUsers([result.data.seller.id], {
      type: NotificationType.SUCCESS,
      title: 'Mağaza müraciətiniz təsdiqləndi',
      message: result.data.store.name,
      href: '/seller',
      metadata: { applicationId: result.data.applicationId, storeId: result.data.store.id },
    });
    return result;
  }

  async rejectStoreApplication(id: string, dto: RejectStoreApplicationDto, admin: AuthenticatedUser) {
    const application = await this.prisma.storeApplication.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!application) {
      throw new NotFoundException('Store application not found');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Store application is already reviewed');
    }

    const reviewed = await this.prisma.storeApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
        reviewNote: dto.reviewNote,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
      select: storeApplicationSelect,
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'ADMIN_STORE_APPLICATION_REJECTED',
        resourceType: 'StoreApplication',
        resourceId: id,
        metadata: {
          reviewNote: dto.reviewNote,
        },
      },
      select: { id: true },
    });

    return { data: reviewed };
  }

  async listPendingProducts(query: ListAdminProductsQueryDto) {
    return this.listModerationProducts({ ...query, status: ProductStatus.PENDING_REVIEW });
  }

  async listProducts(query: ListAdminProductsQueryDto) {
    return this.listModerationProducts(query);
  }

  async bulkApproveProducts(dto: BulkProductActionDto, admin: AuthenticatedUser) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.ids }, status: ProductStatus.PENDING_REVIEW },
      select: moderationProductSelect,
    });
    const now = new Date();
    const updated = await this.prisma.$transaction(
      products.map((product) =>
        this.prisma.product.update({
          where: { id: product.id },
          data: {
            status: ProductStatus.ACTIVE,
            publishedAt: now,
            reviewedAt: now,
            reviewedById: admin.id,
            reviewNote: null,
          },
          select: moderationProductSelect,
        }),
      ),
    );

    await Promise.all(updated.map((product) =>
      this.recordProductModeration(admin, 'ADMIN_PRODUCT_APPROVED', product, { status: ProductStatus.ACTIVE }),
    ));
    await Promise.all(updated.map((product) => this.notifyStoreMembers(product.store.id, {
      type: NotificationType.SUCCESS,
      title: 'Məhsul təsdiqləndi',
      message: product.title,
      href: `/seller/products/${product.id}/edit`,
    })));
    await this.cache.invalidateCatalog();

    return {
      data: updated.map(mapModerationProduct),
      meta: { updated: updated.length, skipped: dto.ids.length - updated.length },
    };
  }

  async bulkRejectProducts(dto: BulkRejectProductsDto, admin: AuthenticatedUser) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.ids }, status: ProductStatus.PENDING_REVIEW },
      select: moderationProductSelect,
    });
    const now = new Date();
    const updated = await this.prisma.$transaction(
      products.map((product) =>
        this.prisma.product.update({
          where: { id: product.id },
          data: {
            status: ProductStatus.REJECTED,
            publishedAt: null,
            reviewedAt: now,
            reviewedById: admin.id,
            reviewNote: dto.reviewNote,
          },
          select: moderationProductSelect,
        }),
      ),
    );

    await Promise.all(updated.map((product) =>
      this.recordProductModeration(admin, 'ADMIN_PRODUCT_REJECTED', product, {
        status: ProductStatus.REJECTED,
        reviewNote: dto.reviewNote,
      }),
    ));
    await Promise.all(updated.map((product) => this.notifyStoreMembers(product.store.id, {
      type: NotificationType.WARNING,
      title: 'Məhsul rədd edildi',
      message: `${product.title}: ${dto.reviewNote}`,
      href: `/seller/products/${product.id}/edit`,
    })));
    await this.cache.invalidateCatalog();

    return {
      data: updated.map(mapModerationProduct),
      meta: { updated: updated.length, skipped: dto.ids.length - updated.length },
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: productDetailSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const leadCounts = await this.prisma.leadEvent.groupBy({
      by: ['type'],
      where: { productId: product.id },
      _count: { _all: true },
    });

    return {
      data: {
        ...mapModerationProduct(product),
        images: product.images,
        leadCounts: mapLeadCounts(leadCounts),
      },
    };
  }

  async approveProduct(id: string, admin: AuthenticatedUser) {
    const product = await this.requireModeratableProduct(id, ProductStatus.PENDING_REVIEW);
    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.ACTIVE,
        publishedAt: new Date(),
        reviewedAt: new Date(),
        reviewedById: admin.id,
        reviewNote: null,
      },
      select: moderationProductSelect,
    });

    await this.recordProductModeration(admin, 'ADMIN_PRODUCT_APPROVED', updated, {
      status: ProductStatus.ACTIVE,
    });
    await this.notifyStoreMembers(updated.store.id, {
      type: NotificationType.SUCCESS,
      title: 'Məhsul təsdiqləndi',
      message: updated.title,
      href: `/seller/products/${updated.id}/edit`,
    });
    await this.cache.invalidateCatalog();

    return { data: mapModerationProduct(updated) };
  }

  async rejectProduct(id: string, dto: RejectProductDto, admin: AuthenticatedUser) {
    const product = await this.requireModeratableProduct(id, ProductStatus.PENDING_REVIEW);
    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.REJECTED,
        publishedAt: null,
        reviewedAt: new Date(),
        reviewedById: admin.id,
        reviewNote: dto.reviewNote,
      },
      select: moderationProductSelect,
    });

    await this.recordProductModeration(admin, 'ADMIN_PRODUCT_REJECTED', updated, {
      status: ProductStatus.REJECTED,
      reviewNote: dto.reviewNote,
    });
    await this.notifyStoreMembers(updated.store.id, {
      type: NotificationType.WARNING,
      title: 'Məhsul rədd edildi',
      message: `${updated.title}: ${dto.reviewNote}`,
      href: `/seller/products/${updated.id}/edit`,
    });
    await this.cache.invalidateCatalog();

    return { data: mapModerationProduct(updated) };
  }

  async suspendProduct(id: string, dto: SuspendProductDto, admin: AuthenticatedUser) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status === ProductStatus.DELETED) {
      throw new BadRequestException('Deleted product cannot be suspended');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.PASSIVE,
        publishedAt: null,
        reviewedAt: new Date(),
        reviewedById: admin.id,
        ...(dto.reviewNote ? { reviewNote: dto.reviewNote } : {}),
      },
      select: moderationProductSelect,
    });

    await this.recordProductModeration(admin, 'ADMIN_PRODUCT_SUSPENDED', updated, {
      status: ProductStatus.PASSIVE,
      reviewNote: dto.reviewNote ?? null,
    });
    await this.cache.invalidateCatalog();

    return { data: mapModerationProduct(updated) };
  }

  async flagProduct(id: string, dto: FlagProductDto, admin: AuthenticatedUser) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, title: true, storeId: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const duplicate = await this.prisma.report.findFirst({
      where: {
        productId: id,
        type: 'SUSPICIOUS_PRODUCT',
        status: { in: [ReportStatus.OPEN, ReportStatus.IN_REVIEW] },
      },
      select: { id: true },
    });
    if (duplicate) throw new BadRequestException('Product is already flagged');

    const report = await this.prisma.report.create({
      data: {
        reporterId: admin.id,
        productId: id,
        storeId: product.storeId,
        type: 'SUSPICIOUS_PRODUCT',
        message: dto.reason,
      },
      select: reportSelect,
    });
    await this.recordAdminAction(admin, 'ADMIN_PRODUCT_FLAGGED', 'Product', id, {
      reportId: report.id,
      reason: dto.reason,
    });
    await this.notifyStoreMembers(product.storeId, {
      type: NotificationType.ACTION_REQUIRED,
      title: 'Məhsul əlavə yoxlamaya işarələndi',
      message: `${product.title}: ${dto.reason}`,
      href: `/seller/products/${product.id}/edit`,
    });

    return { data: mapReport(report) };
  }

  async listStores(query: ListAdminStoresQueryDto) {
    const { take, cursor, skip } = toCursorPagination(query);
    const where = adminStoreWhere(query);
    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: adminStoreListSelect,
      }),
      this.prisma.store.count({ where }),
    ]);
    const page = stores.slice(0, take);

    return {
      data: page.map(mapAdminStore),
      meta: {
        total,
        nextCursor: stores.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  async getStore(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: adminStoreDetailSelect,
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const [leadCounts, auditLogs] = await Promise.all([
      this.prisma.leadEvent.groupBy({
        by: ['type'],
        where: { storeId: store.id },
        _count: { _all: true },
      }),
      this.prisma.auditLog.findMany({
        where: { resourceId: store.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10,
        select: auditLogSelect,
      }),
    ]);

    return {
      data: {
        ...mapAdminStore(store),
        products: store.products.map(mapModerationProduct),
        members: store.members,
        leadCounts: mapLeadCounts(leadCounts),
        auditLogs: auditLogs.map(mapAuditLog),
      },
    };
  }

  async suspendStore(id: string, dto: SuspendProductDto, admin: AuthenticatedUser) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.status === StoreStatus.SUSPENDED) {
      throw new BadRequestException('Store is already suspended');
    }

    const updated = await this.prisma.store.update({
      where: { id },
      data: {
        status: StoreStatus.SUSPENDED,
        publishedAt: null,
      },
      select: adminStoreListSelect,
    });

    await this.recordAdminAction(admin, 'ADMIN_STORE_SUSPENDED', 'Store', id, {
      reviewNote: dto.reviewNote ?? null,
    });
    await this.cache.invalidateCatalog();

    return { data: mapAdminStore(updated) };
  }

  async reactivateStore(id: string, admin: AuthenticatedUser) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.status === StoreStatus.ACTIVE) {
      throw new BadRequestException('Store is already active');
    }

    const now = new Date();
    const updated = await this.prisma.store.update({
      where: { id },
      data: {
        status: StoreStatus.ACTIVE,
        verifiedAt: now,
        publishedAt: now,
      },
      select: adminStoreListSelect,
    });

    await this.recordAdminAction(admin, 'ADMIN_STORE_REACTIVATED', 'Store', id, {
      status: StoreStatus.ACTIVE,
    });
    await this.cache.invalidateCatalog();

    return { data: mapAdminStore(updated) };
  }

  async listUsers(query: ListAdminUsersQueryDto) {
    const { take, cursor, skip } = toCursorPagination(query);
    const where = adminUserWhere(query);
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: adminUserListSelect,
      }),
      this.prisma.user.count({ where }),
    ]);
    const page = users.slice(0, take);

    return {
      data: page.map(mapAdminUser),
      meta: {
        total,
        nextCursor: users.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: adminUserDetailSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      data: {
        ...mapAdminUser(user),
        storeMembers: user.storeMembers,
        ownedStores: user.ownedStores,
        recentAuditLogs: user.auditLogs.map(mapAuditLog),
      },
    };
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto, admin: AuthenticatedUser) {
    const user = await this.requireUser(id);
    await this.assertCanMutateSuperAdmin(user, admin, { nextRole: dto.role });
    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: adminUserListSelect,
    });

    await this.recordAdminAction(admin, 'SUPER_ADMIN_USER_ROLE_UPDATED', 'User', id, {
      previousRole: user.role,
      nextRole: dto.role,
    });

    return { data: mapAdminUser(updated) };
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto, admin: AuthenticatedUser) {
    const user = await this.requireUser(id);
    await this.assertCanMutateSuperAdmin(user, admin, { nextStatus: dto.status });
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: adminUserListSelect,
    });

    await this.recordAdminAction(admin, 'SUPER_ADMIN_USER_STATUS_UPDATED', 'User', id, {
      previousStatus: user.status,
      nextStatus: dto.status,
    });

    return { data: mapAdminUser(updated) };
  }

  async categoryTree() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: adminCategorySelect,
    });

    return {
      data: buildCategoryTree(categories.map(mapAdminCategory)),
      meta: {
        total: categories.length,
      },
    };
  }

  async createCategory(dto: CreateAdminCategoryDto, admin: AuthenticatedUser) {
    await this.assertParentCategory(dto.parentId);
    const slug = await this.uniqueCategorySlug(dto.slug ?? dto.name);
    const category = await this.prisma.category.create({
      data: {
        slug,
        name: dto.name,
        sortOrder: dto.sortOrder,
        ...(dto.parentId ? { parentId: dto.parentId } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.icon ? { icon: dto.icon } : {}),
      },
      select: adminCategorySelect,
    });

    await this.recordAdminAction(admin, 'SUPER_ADMIN_CATEGORY_CREATED', 'Category', category.id, {
      slug: category.slug,
    });
    await this.cache.invalidateCatalog();

    return { data: mapAdminCategory(category) };
  }

  async updateCategory(id: string, dto: UpdateAdminCategoryDto, admin: AuthenticatedUser) {
    const category = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.parentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    await this.assertParentCategory(dto.parentId);
    const data: Prisma.CategoryUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = await this.uniqueCategorySlug(dto.slug, id);
    if (dto.parentId !== undefined) data.parentId = dto.parentId || null;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) data.status = dto.status;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one category field must be changed');
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data,
      select: adminCategorySelect,
    });

    await this.recordAdminAction(admin, 'SUPER_ADMIN_CATEGORY_UPDATED', 'Category', id, {
      changedFields: Object.keys(data),
    });
    await this.cache.invalidateCatalog();

    return { data: mapAdminCategory(updated) };
  }

  async deactivateCategory(id: string, admin: AuthenticatedUser) {
    return this.setCategoryStatus(id, CategoryStatus.PASSIVE, admin, 'SUPER_ADMIN_CATEGORY_DEACTIVATED');
  }

  async reactivateCategory(id: string, admin: AuthenticatedUser) {
    return this.setCategoryStatus(id, CategoryStatus.ACTIVE, admin, 'SUPER_ADMIN_CATEGORY_REACTIVATED');
  }

  async listReports(query: ListAdminReportsQueryDto) {
    const { take, cursor, skip } = toCursorPagination(query);
    const where: Prisma.ReportWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.storeId ? { storeId: query.storeId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
    };
    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: reportSelect,
      }),
      this.prisma.report.count({ where }),
    ]);
    const page = reports.slice(0, take);

    return {
      data: page.map(mapReport),
      meta: {
        total,
        nextCursor: reports.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  async updateReportStatus(id: string, status: ReportStatus, admin: AuthenticatedUser) {
    const report = await this.prisma.report.findUnique({ where: { id }, select: { id: true, status: true } });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: { status },
      select: reportSelect,
    });

    await this.recordAdminAction(admin, 'ADMIN_REPORT_STATUS_UPDATED', 'Report', id, {
      previousStatus: report.status,
      nextStatus: status,
    });

    return { data: mapReport(updated) };
  }

  async auditLogs(query: ListAuditLogsQueryDto) {
    const { take, cursor, skip } = toCursorPagination(query);
    const createdAt: Prisma.DateTimeFilter = {};
    if (query.from) createdAt.gte = new Date(query.from);
    if (query.to) createdAt.lte = new Date(query.to);
    const where: Prisma.AuditLogWhereInput = {
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.action ? { action: { contains: query.action, mode: 'insensitive' } } : {}),
      ...(query.resourceType ? { resourceType: query.resourceType } : {}),
      ...(query.resourceId ? { resourceId: query.resourceId } : {}),
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    };
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: auditLogSelect,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    const page = logs.slice(0, take);

    return {
      data: page.map(mapAuditLog),
      meta: {
        total,
        nextCursor: logs.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  async analytics(query: AdminAnalyticsQueryDto) {
    const startDate = rangeStart(query.range);
    const [
      totalLeads,
      leadCounts,
      topStoreGroups,
      topProductGroups,
      activeStores,
      categoryRows,
      trendRows,
    ] = await Promise.all([
      this.prisma.leadEvent.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.leadEvent.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true },
      }),
      this.prisma.leadEvent.groupBy({
        by: ['storeId'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true },
        orderBy: { _count: { storeId: 'desc' } },
        take: 8,
      }),
      this.prisma.leadEvent.groupBy({
        by: ['productId'],
        where: { createdAt: { gte: startDate }, productId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 8,
      }),
      this.prisma.store.findMany({
        where: { status: StoreStatus.ACTIVE },
        select: { city: true },
      }),
      this.prisma.category.findMany({
        where: { status: CategoryStatus.ACTIVE },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        take: 8,
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: { where: { status: ProductStatus.ACTIVE, store: { status: StoreStatus.ACTIVE } } },
            },
          },
        },
      }),
      this.prisma.$queryRaw<Array<{ day: Date; count: number }>>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
        FROM lead_events
        WHERE "createdAt" >= ${startDate}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

    const [topStores, topProducts] = await Promise.all([
      this.prisma.store.findMany({
        where: { id: { in: topStoreGroups.map((item) => item.storeId) } },
        select: { id: true, slug: true, name: true, city: true },
      }),
      this.prisma.product.findMany({
        where: { id: { in: topProductGroups.map((item) => item.productId).filter(isString) } },
        select: { id: true, slug: true, title: true, store: { select: { id: true, name: true, slug: true } } },
      }),
    ]);

    return {
      data: {
        range: query.range,
        totalLeads,
        leadCounts: mapLeadCounts(leadCounts),
        trend: trendRows.map((row) => ({
          day: row.day.toISOString().slice(0, 10),
          count: Number(row.count),
        })),
        topStores: topStoreGroups.map((group) => ({
          ...(topStores.find((store) => store.id === group.storeId) ?? { id: group.storeId, slug: null, name: 'Unknown store' }),
          leadCount: group._count._all,
        })),
        topProducts: topProductGroups.map((group) => ({
          ...(topProducts.find((product) => product.id === group.productId) ?? {
            id: group.productId,
            slug: null,
            title: 'Unknown product',
            store: null,
          }),
          leadCount: group._count._all,
        })),
        cityBreakdown: groupByCity(activeStores),
        categoryBreakdown: categoryRows.map((category) => ({
          id: category.id,
          name: category.name,
          activeProducts: category._count.products,
        })),
      },
    };
  }

  async system() {
    const [database, redis] = await Promise.all([
      checkDependency(() => this.prisma.$queryRaw`SELECT 1`),
      checkDependency(() => this.redis.ping()),
    ]);
    await this.mediaQueue.refreshMetrics().catch(() => undefined);
    const metrics = this.metrics.snapshot();

    return {
      data: {
        status: database.ok && redis.ok ? 'ready' : 'degraded',
        dependencies: {
          database,
          redis,
          mediaQueue: { ok: metrics.worker.queueReady },
          mediaWorker: { ok: metrics.worker.workerReady },
        },
        metrics,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async listModerationProducts(query: ListAdminProductsQueryDto) {
    const { take, cursor, skip } = toCursorPagination(query);
    const where: Prisma.ProductWhereInput = adminProductWhere(query);
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: moderationProductSelect,
      }),
      this.prisma.product.count({ where }),
    ]);
    const page = products.slice(0, take);

    return {
      data: page.map(mapModerationProduct),
      meta: {
        total,
        nextCursor: products.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  private async upsertSellerUser(
    tx: Prisma.TransactionClient,
    application: {
      contactName: string;
      contactPhone: string;
      contactEmail: string | null;
    },
  ) {
    const normalizedEmail = application.contactEmail?.trim().toLowerCase() || null;
    const existing = await tx.user.findFirst({
      where: {
        OR: [
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          { phone: application.contactPhone },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return tx.user.update({
        where: { id: existing.id },
        data: {
          role: UserRole.SELLER,
          status: UserStatus.ACTIVE,
          fullName: application.contactName,
          ...(normalizedEmail ? { email: normalizedEmail } : {}),
          phone: application.contactPhone,
        },
        select: { id: true, email: true, phone: true },
      });
    }

    return tx.user.create({
      data: {
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        fullName: application.contactName,
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        phone: application.contactPhone,
      },
      select: { id: true, email: true, phone: true },
    });
  }

  private async uniqueStoreSlug(tx: Prisma.TransactionClient, input: string): Promise<string> {
    const base = slugify(input) || `store-${randomBytes(4).toString('hex')}`;

    for (let index = 0; index < 50; index += 1) {
      const slug = index === 0 ? base : `${base}-${index + 1}`;
      const exists = await tx.store.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!exists) {
        return slug;
      }
    }

    throw new BadRequestException('Store slug could not be generated');
  }

  private async uniqueCategorySlug(input: string, ignoreId?: string): Promise<string> {
    const base = slugify(input);

    if (!base) {
      throw new BadRequestException('Category slug is required');
    }

    const existing = await this.prisma.category.findUnique({
      where: { slug: base },
      select: { id: true },
    });

    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException('Category slug is already used');
    }

    return base;
  }

  private hashSetupToken(token: string): string {
    return hashSensitiveValue(token, this.config.getOrThrow<string>('JWT_REFRESH_SECRET'));
  }

  private async requireModeratableProduct(id: string, status: ProductStatus) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== status) {
      throw new BadRequestException(`Product must be ${status}`);
    }

    return product;
  }

  private async requireUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async assertCanMutateSuperAdmin(
    user: { id: string; role: UserRole; status: UserStatus },
    admin: AuthenticatedUser,
    next: { nextRole?: UserRole; nextStatus?: UserStatus },
  ): Promise<void> {
    if (user.id === admin.id && next.nextStatus && next.nextStatus !== UserStatus.ACTIVE) {
      throw new ForbiddenException('You cannot suspend your own account');
    }

    const weakensSuperAdmin =
      user.role === UserRole.SUPER_ADMIN &&
      ((next.nextRole && next.nextRole !== UserRole.SUPER_ADMIN) ||
        (next.nextStatus && next.nextStatus !== UserStatus.ACTIVE));

    if (!weakensSuperAdmin) {
      return;
    }

    const activeSuperAdmins = await this.prisma.user.count({
      where: {
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        id: { not: user.id },
      },
    });

    if (activeSuperAdmins === 0) {
      throw new BadRequestException('At least one active super admin must remain');
    }
  }

  private async assertParentCategory(parentId: string | null | undefined): Promise<void> {
    if (!parentId) {
      return;
    }

    const parent = await this.prisma.category.findUnique({ where: { id: parentId }, select: { id: true } });

    if (!parent) {
      throw new BadRequestException('Parent category not found');
    }
  }

  private async setCategoryStatus(id: string, status: CategoryStatus, admin: AuthenticatedUser, action: string) {
    const category = await this.prisma.category.findUnique({ where: { id }, select: { id: true, status: true } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: { status },
      select: adminCategorySelect,
    });

    await this.recordAdminAction(admin, action, 'Category', id, {
      previousStatus: category.status,
      nextStatus: status,
    });
    await this.cache.invalidateCatalog();

    return { data: mapAdminCategory(updated) };
  }

  private async recordProductModeration(
    admin: AuthenticatedUser,
    action: string,
    product: ModerationProduct,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action,
        resourceType: 'Product',
        resourceId: product.id,
        metadata: {
          ...metadata,
          storeId: product.store.id,
        },
      },
      select: { id: true },
    });
  }

  private async notifyStoreMembers(
    storeId: string,
    input: { type: NotificationType; title: string; message: string; href?: string },
  ): Promise<void> {
    const members = await this.prisma.storeMember.findMany({
      where: { storeId },
      select: { userId: true },
    });
    await this.notifications.createForUsers(members.map((member) => member.userId), input);
  }

  private async recordAdminAction(
    admin: AuthenticatedUser,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      actorId: admin.id,
      action,
      resourceType,
      resourceId,
    };

    if (metadata) {
      data.metadata = metadata as Prisma.InputJsonValue;
    }

    await this.prisma.auditLog.create({
      data,
      select: { id: true },
    });
  }
}

const storeApplicationSelect = {
  id: true,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  companyName: true,
  taxNumber: true,
  categoryId: true,
  city: true,
  district: true,
  description: true,
  status: true,
  reviewNote: true,
  reviewedAt: true,
  createdAt: true,
} satisfies Prisma.StoreApplicationSelect;

const moderationProductSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  price: true,
  priceType: true,
  currency: true,
  unit: true,
  minOrderQuantity: true,
  stockStatus: true,
  status: true,
  reviewNote: true,
  reviewedAt: true,
  publishedAt: true,
  updatedAt: true,
  store: {
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
    },
  },
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  _count: {
    select: {
      reports: {
        where: { status: { in: [ReportStatus.OPEN, ReportStatus.IN_REVIEW] } },
      },
    },
  },
} satisfies Prisma.ProductSelect;

const productDetailSelect = {
  ...moderationProductSelect,
  images: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
    select: {
      id: true,
      cdnUrl: true,
      storageKey: true,
      altText: true,
      sortOrder: true,
      width: true,
      height: true,
      mimeType: true,
      sizeBytes: true,
      status: true,
      failureReason: true,
      variants: true,
    },
  },
} satisfies Prisma.ProductSelect;

const adminStoreListSelect = {
  id: true,
  slug: true,
  name: true,
  legalName: true,
  taxNumber: true,
  description: true,
  status: true,
  phone: true,
  whatsappNumber: true,
  email: true,
  city: true,
  district: true,
  address: true,
  logoKey: true,
  bannerKey: true,
  verifiedAt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  ownerUser: {
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
      role: true,
      status: true,
    },
  },
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  _count: {
    select: {
      products: true,
      members: true,
      leadEvents: true,
      reports: true,
    },
  },
} satisfies Prisma.StoreSelect;

const adminStoreDetailSelect = {
  ...adminStoreListSelect,
  workingHours: true,
  members: {
    orderBy: [{ createdAt: 'asc' as const }],
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          status: true,
        },
      },
    },
  },
  products: {
    orderBy: [{ updatedAt: 'desc' as const }],
    take: 12,
    select: moderationProductSelect,
  },
} satisfies Prisma.StoreSelect;

const auditLogSelect = {
  id: true,
  actorId: true,
  action: true,
  resourceType: true,
  resourceId: true,
  metadata: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
      role: true,
    },
  },
} satisfies Prisma.AuditLogSelect;

const adminUserListSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      storeMembers: true,
      ownedStores: true,
      leadEvents: true,
      reports: true,
      auditLogs: true,
    },
  },
} satisfies Prisma.UserSelect;

const adminUserDetailSelect = {
  ...adminUserListSelect,
  emailVerifiedAt: true,
  phoneVerifiedAt: true,
  storeMembers: {
    orderBy: [{ createdAt: 'desc' as const }],
    select: {
      id: true,
      role: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
        },
      },
    },
  },
  ownedStores: {
    orderBy: [{ createdAt: 'desc' as const }],
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
    },
  },
  auditLogs: {
    orderBy: [{ createdAt: 'desc' as const }, { id: 'desc' as const }],
    take: 10,
    select: auditLogSelect,
  },
} satisfies Prisma.UserSelect;

const adminCategorySelect = {
  id: true,
  parentId: true,
  slug: true,
  name: true,
  description: true,
  icon: true,
  sortOrder: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      products: true,
      stores: true,
      children: true,
    },
  },
} satisfies Prisma.CategorySelect;

const reportSelect = {
  id: true,
  type: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  reporter: {
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
    },
  },
  store: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  product: {
    select: {
      id: true,
      slug: true,
      title: true,
    },
  },
} satisfies Prisma.ReportSelect;

type ModerationProduct = Prisma.ProductGetPayload<{ select: typeof moderationProductSelect }>;
type AdminStore = Prisma.StoreGetPayload<{ select: typeof adminStoreListSelect }>;
type AdminUser = Prisma.UserGetPayload<{ select: typeof adminUserListSelect }>;
type AdminCategory = Prisma.CategoryGetPayload<{ select: typeof adminCategorySelect }>;
type AdminReport = Prisma.ReportGetPayload<{ select: typeof reportSelect }>;
type AuditLog = Prisma.AuditLogGetPayload<{ select: typeof auditLogSelect }>;

type AdminCategoryNode = ReturnType<typeof mapAdminCategory> & { children: AdminCategoryNode[] };

function adminProductWhere(query: ListAdminProductsQueryDto): Prisma.ProductWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.storeId ? { storeId: query.storeId } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: 'insensitive' } },
            { description: { contains: query.q, mode: 'insensitive' } },
            { store: { name: { contains: query.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };
}

function adminStoreWhere(query: ListAdminStoresQueryDto): Prisma.StoreWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { legalName: { contains: query.q, mode: 'insensitive' } },
            { slug: { contains: query.q, mode: 'insensitive' } },
            { phone: { contains: query.q } },
            { email: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

function adminUserWhere(query: ListAdminUsersQueryDto): Prisma.UserWhereInput {
  return {
    ...(query.role ? { role: query.role } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { email: { contains: query.q, mode: 'insensitive' } },
            { phone: { contains: query.q } },
            { fullName: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

function mapModerationProduct(product: ModerationProduct) {
  const { _count, ...data } = product;
  return {
    ...data,
    price: product.price?.toString() ?? null,
    minOrderQuantity: product.minOrderQuantity?.toString() ?? null,
    priceLabel: formatPrice(product.price, product.priceType, product.currency),
    openReportCount: _count.reports,
  };
}

function mapAdminStore(store: AdminStore) {
  const { _count, ...data } = store;
  return {
    ...data,
    counts: {
      products: _count.products,
      members: _count.members,
      leadEvents: _count.leadEvents,
      reports: _count.reports,
    },
  };
}

function mapAdminUser(user: AdminUser) {
  const { _count, ...data } = user;
  return {
    ...data,
    counts: {
      storeMembers: _count.storeMembers,
      ownedStores: _count.ownedStores,
      leadEvents: _count.leadEvents,
      reports: _count.reports,
      auditLogs: _count.auditLogs,
    },
  };
}

function mapAdminCategory(category: AdminCategory) {
  const { _count, ...data } = category;
  return {
    ...data,
    counts: {
      products: _count.products,
      stores: _count.stores,
      children: _count.children,
    },
  };
}

function mapReport(report: AdminReport) {
  return report;
}

function mapAuditLog(log: AuditLog) {
  return {
    ...log,
    metadata: sanitizeMetadata(log.metadata),
  };
}

function mapLeadCounts(rows: Array<{ type: string; _count: { _all: number } }>) {
  const empty = {
    PRODUCT_VIEW: 0,
    STORE_VIEW: 0,
    WHATSAPP_CLICK: 0,
    PHONE_REVEAL: 0,
    EMAIL_CLICK: 0,
  };

  rows.forEach((row) => {
    if (row.type in empty) {
      empty[row.type as keyof typeof empty] = row._count._all;
    }
  });

  return empty;
}

function buildCategoryTree(categories: ReturnType<typeof mapAdminCategory>[]): AdminCategoryNode[] {
  const byId = new Map<string, AdminCategoryNode>();
  const roots: AdminCategoryNode[] = [];

  categories.forEach((category) => {
    byId.set(category.id, { ...category, children: [] });
  });

  byId.forEach((category) => {
    if (category.parentId && byId.has(category.parentId)) {
      byId.get(category.parentId)?.children.push(category);
      return;
    }
    roots.push(category);
  });

  return roots;
}

function groupByCity(stores: Array<{ city: string }>) {
  const counts = new Map<string, number>();
  stores.forEach((store) => counts.set(store.city, (counts.get(store.city) ?? 0) + 1));

  return [...counts.entries()]
    .map(([city, count]) => ({ city, activeStores: count }))
    .sort((left, right) => right.activeStores - left.activeStores)
    .slice(0, 8);
}

function formatPrice(price: Prisma.Decimal | null, priceType: PriceType, currency: string): string {
  if (priceType === PriceType.NEGOTIABLE || !price) {
    return 'Razılaşma yolu ilə';
  }

  return `${price.toString()} ${currency}`;
}

function rangeStart(range: '7d' | '30d' | '90d'): Date {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isString(value: string | null): value is string {
  return typeof value === 'string';
}

async function checkDependency(check: () => Promise<unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    await check();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Dependency check failed',
    };
  }
}

function sanitizeMetadata(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeMetadata);
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !/(password|secret|token|signed|rawip|raw_ip|useragent|user_agent)/i.test(key))
      .map(([key, item]) => [key, sanitizeMetadata(item)]),
  );
}
