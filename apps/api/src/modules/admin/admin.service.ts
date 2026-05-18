import { randomBytes } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApplicationStatus,
  PriceType,
  Prisma,
  ProductStatus,
  StoreRole,
  StoreStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { toCursorPagination } from '../../common/pagination/cursor-pagination';
import { hashSensitiveValue } from '../../common/security/hash-ip';
import { slugify } from '../../common/slug/slugify';
import { PrismaService } from '../prisma/prisma.service';
import type { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import type { ListStoreApplicationsQueryDto } from './dto/list-store-applications-query.dto';
import type { RejectProductDto, SuspendProductDto } from './dto/review-product.dto';
import type {
  ApproveStoreApplicationDto,
  RejectStoreApplicationDto,
} from './dto/review-store-application.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly cache: PublicCacheService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async overview() {
    const [pendingStores, pendingProducts, reports] = await Promise.all([
      this.prisma.storeApplication.count({ where: { status: ApplicationStatus.PENDING } }),
      this.prisma.product.count({ where: { status: ProductStatus.PENDING_REVIEW } }),
      this.prisma.report.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      data: {
        pendingStores,
        pendingProducts,
        reports,
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
    const { take, cursor, skip } = toCursorPagination(query);
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.PENDING_REVIEW,
      ...(query.storeId ? { storeId: query.storeId } : {}),
    };
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
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
    await this.cache.invalidateProducts();

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
    await this.cache.invalidateProducts();

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
    await this.cache.invalidateProducts();

    return { data: mapModerationProduct(updated) };
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
} satisfies Prisma.ProductSelect;

type ModerationProduct = Prisma.ProductGetPayload<{ select: typeof moderationProductSelect }>;

function mapModerationProduct(product: ModerationProduct) {
  return {
    ...product,
    price: product.price?.toString() ?? null,
    minOrderQuantity: product.minOrderQuantity?.toString() ?? null,
    priceLabel:
      product.priceType === PriceType.NEGOTIABLE || !product.price
        ? 'Razilasma yolu ile'
        : `${product.price} ${product.currency}`,
  };
}
