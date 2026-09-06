import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LeadType, NotificationType, PriceType, Prisma, ProductStatus, StoreStatus, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PublicCacheService } from '../../common/cache/public-cache.service';
import { toCursorPagination } from '../../common/pagination/cursor-pagination';
import { slugify } from '../../common/slug/slugify';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ListSellerProductsQueryDto } from './dto/list-seller-products-query.dto';
import type { ListSellerLeadsQueryDto, SellerAnalyticsQueryDto } from './dto/seller-analytics-query.dto';
import type { UpdateSellerStoreDto } from './dto/update-seller-store.dto';
import type { CreateSellerProductDto, UpdateSellerProductDto } from './dto/write-product.dto';

@Injectable()
export class SellerService {
  constructor(
    private readonly audit: AuditService,
    private readonly cache: PublicCacheService,
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async overview(user: AuthenticatedUser) {
    const storeIds = await this.scopedStoreIds(user);

    if (storeIds.length === 0) {
      return {
        data: {
          totalProducts: 0,
          activeProducts: 0,
          pendingProducts: 0,
          draftProducts: 0,
          whatsappClicksToday: 0,
          storeViewsToday: 0,
          stores: [],
          recentLeads: [],
          topProducts: [],
        },
      };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      stores,
      totalProducts,
      activeProducts,
      pendingProducts,
      draftProducts,
      whatsappClicksToday,
      storeViewsToday,
      recentLeads,
      topProductGroups,
    ] = await Promise.all([
      this.prisma.store.findMany({
        where: { id: { in: storeIds } },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: sellerStoreSelect,
      }),
      this.prisma.product.count({ where: { storeId: { in: storeIds }, status: { not: ProductStatus.DELETED } } }),
      this.prisma.product.count({ where: { storeId: { in: storeIds }, status: ProductStatus.ACTIVE } }),
      this.prisma.product.count({
        where: { storeId: { in: storeIds }, status: ProductStatus.PENDING_REVIEW },
      }),
      this.prisma.product.count({ where: { storeId: { in: storeIds }, status: ProductStatus.DRAFT } }),
      this.prisma.leadEvent.count({
        where: {
          storeId: { in: storeIds },
          type: LeadType.WHATSAPP_CLICK,
          createdAt: { gte: startOfToday },
        },
      }),
      this.prisma.leadEvent.count({
        where: {
          storeId: { in: storeIds },
          type: LeadType.STORE_VIEW,
          createdAt: { gte: startOfToday },
        },
      }),
      this.prisma.leadEvent.findMany({
        where: { storeId: { in: storeIds } },
        take: 8,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: sellerLeadSelect,
      }),
      this.prisma.leadEvent.groupBy({
        by: ['productId'],
        where: {
          storeId: { in: storeIds },
          productId: { not: null },
        },
        _count: { _all: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      }),
    ]);

    const topProductIds = topProductGroups
      .map((item) => item.productId)
      .filter((productId): productId is string => Boolean(productId));
    const topProducts = topProductIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: {
                id: true,
                cdnUrl: true,
                status: true,
                sortOrder: true,
              },
            },
          },
        })
      : [];

    return {
      data: {
        totalProducts,
        activeProducts,
        pendingProducts,
        draftProducts,
        whatsappClicksToday,
        storeViewsToday,
        stores: stores.map(mapSellerStore),
        recentLeads: recentLeads.map(mapSellerLead),
        topProducts: topProductGroups.map((group) => {
          const product = topProducts.find((item) => item.id === group.productId);
          return {
            id: group.productId,
            title: product?.title ?? 'Məhsul',
            slug: product?.slug ?? null,
            status: product?.status ?? null,
            leadCount: group._count._all,
            image: product?.images?.[0] ?? null,
          };
        }),
      },
    };
  }

  async listStores(user: AuthenticatedUser) {
    const storeIds = await this.scopedStoreIds(user);
    const stores = await this.prisma.store.findMany({
      where: { id: { in: storeIds } },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: sellerStoreSelect,
    });

    return {
      data: stores.map(mapSellerStore),
      meta: {
        total: stores.length,
      },
    };
  }

  async getStore(user: AuthenticatedUser, id: string) {
    await this.requireStoreAccess(user, id);
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: sellerStoreSelect,
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return { data: mapSellerStore(store) };
  }

  async updateStore(user: AuthenticatedUser, id: string, dto: UpdateSellerStoreDto) {
    await this.requireStoreAccess(user, id);
    this.ensurePatchHasChanges(dto);

    const data: Prisma.StoreUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.legalName !== undefined) data.legalName = dto.legalName;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.district !== undefined) data.district = dto.district;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.whatsappNumber !== undefined) data.whatsappNumber = dto.whatsappNumber;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.workingHours !== undefined) data.workingHours = dto.workingHours as Prisma.InputJsonValue;

    const store = await this.prisma.store.update({
      where: { id },
      data,
      select: sellerStoreSelect,
    });

    await this.audit.record({
      actorId: user.id,
      action: 'SELLER_STORE_UPDATED',
      resourceType: 'Store',
      resourceId: store.id,
    });
    await this.cache.invalidateStores();

    return { data: mapSellerStore(store) };
  }

  async analytics(user: AuthenticatedUser, query: SellerAnalyticsQueryDto) {
    const storeIds = await this.scopedStoreIds(user, query.storeId);
    const since = rangeStartDate(query.range);

    const [leadGroups, productGroups, totalLeads] = await Promise.all([
      this.prisma.leadEvent.groupBy({
        by: ['type'],
        where: { storeId: { in: storeIds }, createdAt: { gte: since } },
        _count: { _all: true },
      }),
      this.prisma.product.groupBy({
        by: ['status'],
        where: { storeId: { in: storeIds } },
        _count: { _all: true },
      }),
      this.prisma.leadEvent.count({
        where: { storeId: { in: storeIds }, createdAt: { gte: since } },
      }),
    ]);

    const leadCounts = Object.fromEntries(leadGroups.map((item) => [item.type, item._count._all]));
    const productCounts = Object.fromEntries(productGroups.map((item) => [item.status, item._count._all]));

    return {
      data: {
        range: query.range,
        totalLeads,
        leadCounts: {
          productViews: leadCounts[LeadType.PRODUCT_VIEW] ?? 0,
          storeViews: leadCounts[LeadType.STORE_VIEW] ?? 0,
          whatsappClicks: leadCounts[LeadType.WHATSAPP_CLICK] ?? 0,
          phoneReveals: leadCounts[LeadType.PHONE_REVEAL] ?? 0,
          emailClicks: leadCounts[LeadType.EMAIL_CLICK] ?? 0,
        },
        productCounts: {
          draft: productCounts[ProductStatus.DRAFT] ?? 0,
          pendingReview: productCounts[ProductStatus.PENDING_REVIEW] ?? 0,
          active: productCounts[ProductStatus.ACTIVE] ?? 0,
          passive: productCounts[ProductStatus.PASSIVE] ?? 0,
          rejected: productCounts[ProductStatus.REJECTED] ?? 0,
          deleted: productCounts[ProductStatus.DELETED] ?? 0,
        },
      },
    };
  }

  async listLeads(user: AuthenticatedUser, query: ListSellerLeadsQueryDto) {
    const storeIds = await this.scopedStoreIds(user, query.storeId);
    const since = rangeStartDate(query.range);
    const { take, cursor, skip } = toCursorPagination(query);
    const where: Prisma.LeadEventWhereInput = {
      storeId: { in: storeIds },
      createdAt: { gte: since },
      ...(query.type ? { type: query.type } : {}),
    };
    const [leads, total] = await Promise.all([
      this.prisma.leadEvent.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: sellerLeadSelect,
      }),
      this.prisma.leadEvent.count({ where }),
    ]);
    const page = leads.slice(0, take);

    return {
      data: page.map(mapSellerLead),
      meta: {
        total,
        nextCursor: leads.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
  }

  async listProducts(user: AuthenticatedUser, query: ListSellerProductsQueryDto) {
    const storeIds = await this.scopedStoreIds(user, query.storeId);
    const { take, cursor, skip } = toCursorPagination(query);
    const where: Prisma.ProductWhereInput = {
      storeId: { in: storeIds },
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
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

  async getProduct(user: AuthenticatedUser, id: string) {
    await this.requireProductAccess(user, id);
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: sellerProductSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { data: mapSellerProduct(product) };
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
    await this.cache.invalidateCatalog();
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
    await this.cache.invalidateCatalog();
    await this.notifications.createForRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN], {
      type: NotificationType.ACTION_REQUIRED,
      title: 'Yeni məhsul yoxlama gözləyir',
      message: product.title,
      href: `/admin/products/${product.id}`,
      metadata: { productId: product.id, storeId: existing.storeId },
    });

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
    await this.cache.invalidateCatalog();

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

  private ensurePatchHasChanges(dto: object): void {
    const hasDefinedValue = Object.values(dto as Record<string, unknown>).some((value) => value !== undefined);

    if (!hasDefinedValue) {
      throw new BadRequestException('At least one field must be provided');
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

const sellerStoreSelect = {
  id: true,
  slug: true,
  name: true,
  legalName: true,
  taxNumber: true,
  description: true,
  status: true,
  logoKey: true,
  bannerKey: true,
  phone: true,
  whatsappNumber: true,
  email: true,
  city: true,
  district: true,
  address: true,
  workingHours: true,
  verifiedAt: true,
  publishedAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  members: {
    select: {
      role: true,
      userId: true,
    },
  },
  _count: {
    select: {
      products: {
        where: { status: { not: ProductStatus.DELETED } },
      },
    },
  },
} satisfies Prisma.StoreSelect;

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

const sellerLeadSelect = {
  id: true,
  type: true,
  source: true,
  createdAt: true,
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
} satisfies Prisma.LeadEventSelect;

type SellerStore = Prisma.StoreGetPayload<{ select: typeof sellerStoreSelect }>;
type SellerProduct = Prisma.ProductGetPayload<{ select: typeof sellerProductSelect }>;
type SellerLead = Prisma.LeadEventGetPayload<{ select: typeof sellerLeadSelect }>;

function mapSellerStore(store: SellerStore) {
  const { _count, ...publicStore } = store;
  const steps = [
    {
      key: 'profile',
      label: 'Mağaza məlumatları',
      completed: Boolean(store.name && store.description && store.category),
      href: '/seller/store',
    },
    {
      key: 'contact',
      label: 'Əlaqə məlumatları',
      completed: Boolean((store.phone || store.whatsappNumber) && store.email),
      href: '/seller/store',
    },
    {
      key: 'location',
      label: 'Ünvan məlumatları',
      completed: Boolean(store.city && store.address),
      href: '/seller/store',
    },
    {
      key: 'media',
      label: 'Logo və banner',
      completed: Boolean(store.logoKey && store.bannerKey),
      href: '/seller/store',
    },
    {
      key: 'catalog',
      label: 'İlk məhsul',
      completed: _count.products > 0,
      href: '/seller/products/new',
    },
  ];
  const completed = steps.filter((step) => step.completed).length;

  return {
    ...publicStore,
    productCount: _count.products,
    verified: Boolean(store.verifiedAt),
    onboarding: {
      completed,
      total: steps.length,
      percentage: Math.round((completed / steps.length) * 100),
      steps,
    },
  };
}

function mapSellerProduct(product: SellerProduct) {
  return {
    ...product,
    price: product.price?.toString() ?? null,
    minOrderQuantity: product.minOrderQuantity?.toString() ?? null,
    priceLabel:
      product.priceType === PriceType.NEGOTIABLE || !product.price
        ? 'Razılaşma yolu ilə'
        : `${product.price} ${product.currency}`,
  };
}

function mapSellerLead(lead: SellerLead) {
  return {
    id: lead.id,
    type: lead.type,
    source: lead.source,
    createdAt: lead.createdAt,
    store: lead.store,
    product: lead.product,
  };
}

function rangeStartDate(range: '7d' | '30d' | '90d' = '30d'): Date {
  const daysByRange = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  return new Date(Date.now() - daysByRange[range] * 24 * 60 * 60 * 1000);
}
