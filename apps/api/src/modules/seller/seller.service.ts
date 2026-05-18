import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PriceType, Prisma, ProductStatus, StoreStatus, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { toCursorPagination } from '../../common/pagination/cursor-pagination';
import { slugify } from '../../common/slug/slugify';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ListSellerProductsQueryDto } from './dto/list-seller-products-query.dto';
import type { CreateSellerProductDto, UpdateSellerProductDto } from './dto/write-product.dto';

@Injectable()
export class SellerService {
  constructor(
    private readonly audit: AuditService,
    private readonly cache: PublicCacheService,
    private readonly prisma: PrismaService,
  ) {}

  async overview(user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return {
        data: {
          totalProducts: 0,
          activeProducts: 0,
          pendingProducts: 0,
          whatsappClicksToday: 0,
          storeViewsToday: 0,
          adminScoped: true,
        },
      };
    }

    const storeIds = await this.prisma.storeMember.findMany({
      where: { userId: user.id },
      select: { storeId: true },
    });
    const scopedStoreIds = storeIds.map((store) => store.storeId);

    if (scopedStoreIds.length === 0) {
      return {
        data: {
          totalProducts: 0,
          activeProducts: 0,
          pendingProducts: 0,
          whatsappClicksToday: 0,
          storeViewsToday: 0,
        },
      };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [totalProducts, activeProducts, pendingProducts, whatsappClicksToday, storeViewsToday] =
      await Promise.all([
        this.prisma.product.count({ where: { storeId: { in: scopedStoreIds } } }),
        this.prisma.product.count({
          where: { storeId: { in: scopedStoreIds }, status: ProductStatus.ACTIVE },
        }),
        this.prisma.product.count({
          where: { storeId: { in: scopedStoreIds }, status: ProductStatus.PENDING_REVIEW },
        }),
        this.prisma.leadEvent.count({
          where: {
            storeId: { in: scopedStoreIds },
            type: 'WHATSAPP_CLICK',
            createdAt: { gte: startOfToday },
          },
        }),
        this.prisma.leadEvent.count({
          where: {
            storeId: { in: scopedStoreIds },
            type: 'STORE_VIEW',
            createdAt: { gte: startOfToday },
          },
        }),
      ]);

    return {
      data: {
        totalProducts,
        activeProducts,
        pendingProducts,
        whatsappClicksToday,
        storeViewsToday,
      },
    };
  }

  async listProducts(user: AuthenticatedUser, query: ListSellerProductsQueryDto) {
    const storeIds = await this.scopedStoreIds(user, query.storeId);
    const { take, cursor, skip } = toCursorPagination(query);
    const where: Prisma.ProductWhereInput = {
      storeId: { in: storeIds },
      ...(query.status ? { status: query.status } : {}),
    };
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: sellerProductSelect,
      }),
      this.prisma.product.count({ where }),
    ]);
    const page = products.slice(0, take);

    return {
      data: page.map(mapSellerProduct),
      meta: {
        total,
        nextCursor: products.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  async createProduct(user: AuthenticatedUser, dto: CreateSellerProductDto) {
    const store = await this.requireStoreAccess(user, dto.storeId);

    if (store.status !== StoreStatus.ACTIVE) {
      throw new BadRequestException('Only active stores can create products');
    }

    await this.ensureCategoryExists(dto.categoryId);

    const slug = await this.uniqueProductSlug(dto.title);
    const product = await this.prisma.product.create({
      data: {
        storeId: dto.storeId,
        slug,
        title: dto.title,
        status: ProductStatus.DRAFT,
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.priceType ? { priceType: dto.priceType } : {}),
        ...(dto.currency ? { currency: dto.currency } : {}),
        ...(dto.unit ? { unit: dto.unit } : {}),
        ...(dto.minOrderQuantity !== undefined ? { minOrderQuantity: dto.minOrderQuantity } : {}),
        ...(dto.stockStatus ? { stockStatus: dto.stockStatus } : {}),
      },
      select: sellerProductSelect,
    });

    await this.audit.record({
      actorId: user.id,
      action: 'SELLER_PRODUCT_CREATED',
      resourceType: 'Product',
      resourceId: product.id,
      metadata: { storeId: dto.storeId },
    });

    return { data: mapSellerProduct(product) };
  }

  async updateProduct(user: AuthenticatedUser, id: string, dto: UpdateSellerProductDto) {
    const existing = await this.requireProductAccess(user, id);
    this.ensurePatchHasChanges(dto);
    await this.ensureCategoryExists(dto.categoryId);

    if (existing.status === ProductStatus.DELETED) {
      throw new BadRequestException('Deleted product cannot be edited');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.priceType ? { priceType: dto.priceType } : {}),
        ...(dto.currency ? { currency: dto.currency } : {}),
        ...(dto.unit ? { unit: dto.unit } : {}),
        ...(dto.minOrderQuantity !== undefined ? { minOrderQuantity: dto.minOrderQuantity } : {}),
        ...(dto.stockStatus ? { stockStatus: dto.stockStatus } : {}),
        status: ProductStatus.DRAFT,
        publishedAt: null,
        reviewNote: null,
        reviewedAt: null,
        reviewedById: null,
      },
      select: sellerProductSelect,
    });

    await this.audit.record({
      actorId: user.id,
      action: 'SELLER_PRODUCT_UPDATED',
      resourceType: 'Product',
      resourceId: product.id,
      metadata: { storeId: existing.storeId },
    });
    await this.cache.invalidateProducts();

    return { data: mapSellerProduct(product) };
  }

  async submitProductReview(user: AuthenticatedUser, id: string) {
    const existing = await this.requireProductAccess(user, id);

    const submittableStatuses: ProductStatus[] = [
      ProductStatus.DRAFT,
      ProductStatus.REJECTED,
      ProductStatus.PASSIVE,
    ];

    if (!submittableStatuses.includes(existing.status)) {
      throw new BadRequestException('Product cannot be submitted for review from its current status');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.PENDING_REVIEW,
        publishedAt: null,
        reviewNote: null,
      },
      select: sellerProductSelect,
    });

    await this.audit.record({
      actorId: user.id,
      action: 'SELLER_PRODUCT_SUBMITTED_FOR_REVIEW',
      resourceType: 'Product',
      resourceId: product.id,
      metadata: { storeId: existing.storeId },
    });
    await this.cache.invalidateProducts();

    return { data: mapSellerProduct(product) };
  }

  async deleteProduct(user: AuthenticatedUser, id: string) {
    const existing = await this.requireProductAccess(user, id);

    if (existing.status === ProductStatus.DELETED) {
      return { data: { id, status: ProductStatus.DELETED } };
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.DELETED,
        publishedAt: null,
      },
      select: { id: true },
    });

    await this.audit.record({
      actorId: user.id,
      action: 'SELLER_PRODUCT_DELETED',
      resourceType: 'Product',
      resourceId: id,
      metadata: { storeId: existing.storeId },
    });
    await this.cache.invalidateProducts();

    return { data: { id, status: ProductStatus.DELETED } };
  }

  private async scopedStoreIds(user: AuthenticatedUser, requestedStoreId?: string): Promise<string[]> {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      if (requestedStoreId) {
        const store = await this.prisma.store.findUnique({
          where: { id: requestedStoreId },
          select: { id: true },
        });

        if (!store) {
          throw new NotFoundException('Store not found');
        }

        return [store.id];
      }

      const stores = await this.prisma.store.findMany({ select: { id: true } });
      return stores.map((store) => store.id);
    }

    const memberships = await this.prisma.storeMember.findMany({
      where: {
        userId: user.id,
        ...(requestedStoreId ? { storeId: requestedStoreId } : {}),
      },
      select: { storeId: true },
    });

    if (requestedStoreId && memberships.length === 0) {
      throw new ForbiddenException('Store access denied');
    }

    return memberships.map((membership) => membership.storeId);
  }

  private async requireStoreAccess(user: AuthenticatedUser, storeId: string) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, status: true },
      });

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      return store;
    }

    const membership = await this.prisma.storeMember.findFirst({
      where: { userId: user.id, storeId },
      select: {
        store: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Store access denied');
    }

    return membership.store;
  }

  private async requireProductAccess(user: AuthenticatedUser, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        storeId: true,
        status: true,
        store: {
          select: {
            members: {
              where: { userId: user.id },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (!isAdmin && product.store.members.length === 0) {
      throw new ForbiddenException('Product access denied');
    }

    return product;
  }

  private async ensureCategoryExists(categoryId?: string): Promise<void> {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }
  }

  private ensurePatchHasChanges(dto: UpdateSellerProductDto): void {
    const hasDefinedValue = Object.values(dto).some((value) => value !== undefined);

    if (!hasDefinedValue) {
      throw new BadRequestException('At least one product field must be provided');
    }
  }

  private async uniqueProductSlug(title: string): Promise<string> {
    const base = slugify(title) || `product-${Date.now()}`;

    for (let index = 0; index < 50; index += 1) {
      const slug = index === 0 ? base : `${base}-${index + 1}`;
      const exists = await this.prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!exists) {
        return slug;
      }
    }

    throw new BadRequestException('Product slug could not be generated');
  }
}

const sellerProductSelect = {
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
  publishedAt: true,
  updatedAt: true,
  store: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  images: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      cdnUrl: true,
      status: true,
      sortOrder: true,
    },
  },
} satisfies Prisma.ProductSelect;

type SellerProduct = Prisma.ProductGetPayload<{ select: typeof sellerProductSelect }>;

function mapSellerProduct(product: SellerProduct) {
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
