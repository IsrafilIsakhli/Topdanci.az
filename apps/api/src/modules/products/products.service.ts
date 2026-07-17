import { Injectable, NotFoundException } from '@nestjs/common';
import { PriceType, Prisma, ProductStatus, StoreStatus } from '@prisma/client';
import { cacheKey } from '../../common/cache/cache-key';
import { toCursorPagination } from '../../common/pagination/cursor-pagination';
import { ListProductsQueryDto, type ProductSort } from './dto/list-products-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listPublicProducts(query: ListProductsQueryDto) {
    const key = cacheKey('products:list', query);
    const cached = await this.redis.getJson(key);

    if (cached) {
      return cached;
    }

    const where = publicProductWhere(query);
    const { take, cursor, skip } = toCursorPagination(query);
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: productOrderBy(query.sort),
        select: publicProductSelect,
      }),
      this.prisma.product.count({ where }),
    ]);
    const page = products.slice(0, take);

    const response = {
      data: page.map(mapPublicProduct),
      meta: {
        total,
        nextCursor: products.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
    await this.redis.setJson(key, response, 60);

    return response;
  }

  async getPublicProduct(slug: string) {
    const key = cacheKey('products:detail', { slug });
    const cached = await this.redis.getJson(key);

    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
        store: { status: StoreStatus.ACTIVE },
      },
      select: publicProductSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const response = { data: mapPublicProduct(product) };
    await this.redis.setJson(key, response, 300);

    return response;
  }
}

const publicProductSelect = {
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
  publishedAt: true,
  category: {
    select: {
      slug: true,
      name: true,
    },
  },
  store: {
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      district: true,
      verifiedAt: true,
      phone: true,
      whatsappNumber: true,
      email: true,
    },
  },
  images: {
    where: { status: 'READY' },
    orderBy: { sortOrder: 'asc' },
    take: 5,
    select: {
      id: true,
      cdnUrl: true,
      storageKey: true,
      altText: true,
      width: true,
      height: true,
      variants: true,
      blurHash: true,
    },
  },
} satisfies Prisma.ProductSelect;

type PublicProductRecord = Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>;

function publicProductWhere(query: ListProductsQueryDto): Prisma.ProductWhereInput {
  return {
    status: ProductStatus.ACTIVE,
    store: {
      status: StoreStatus.ACTIVE,
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.store ? { slug: query.store } : {}),
    },
    ...(query.category ? { category: { slug: query.category } } : {}),
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

function productOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  if (sort === 'popular') {
    return [{ leadEvents: { _count: 'desc' } }, { publishedAt: 'desc' }, { id: 'desc' }];
  }

  if (sort === 'price_asc') {
    return [{ price: { sort: 'asc', nulls: 'last' } }, { id: 'desc' }];
  }

  if (sort === 'price_desc') {
    return [{ price: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }];
  }

  return [{ publishedAt: 'desc' }, { id: 'desc' }];
}

function mapPublicProduct(product: PublicProductRecord) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: product.price ? product.price.toString() : null,
    priceType: product.priceType,
    priceLabel: product.priceType === PriceType.NEGOTIABLE || !product.price ? 'Razılaşma yolu ilə' : `${product.price} ${product.currency}`,
    currency: product.currency,
    unit: product.unit,
    minOrderQuantity: product.minOrderQuantity?.toString() ?? null,
    stockStatus: product.stockStatus,
    publishedAt: product.publishedAt,
    category: product.category,
    store: {
      ...product.store,
      verified: Boolean(product.store.verifiedAt),
    },
    images: product.images,
  };
}
