import { Injectable } from '@nestjs/common';
import { ProductStatus, StoreStatus } from '@prisma/client';
import { cacheKey } from '../../common/cache/cache-key';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async search(query: string) {
    const q = normalizeQuery(query);

    if (q.length < 2) {
      return { data: { products: [], stores: [], categories: [] }, meta: { total: 0 } };
    }

    const key = cacheKey('search:results', { q });
    const cached = await this.redis.getJson(key);

    if (cached) {
      return cached;
    }

    const [products, stores, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          store: { status: StoreStatus.ACTIVE },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { store: { name: { contains: q, mode: 'insensitive' } } },
            { category: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 10,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          store: { select: { slug: true, name: true } },
          category: { select: { slug: true, name: true } },
        },
      }),
      this.prisma.store.findMany({
        where: {
          status: StoreStatus.ACTIVE,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 8,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        select: { id: true, slug: true, name: true, city: true },
      }),
      this.prisma.category.findMany({
        where: {
          status: 'ACTIVE',
          name: { contains: q, mode: 'insensitive' },
        },
        take: 8,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, slug: true, name: true },
      }),
    ]);

    const response = {
      data: {
        products,
        stores,
        categories,
      },
      meta: {
        total: products.length + stores.length + categories.length,
      },
    };
    await this.redis.setJson(key, response, 60);

    return response;
  }

  async suggestions(query: string) {
    const q = normalizeQuery(query);

    if (q.length < 2) {
      return { data: [], meta: { total: 0 } };
    }

    const key = cacheKey('search:suggestions', { q });
    const cached = await this.redis.getJson(key);

    if (cached) {
      return cached;
    }

    const [products, stores, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          store: { status: StoreStatus.ACTIVE },
          title: { contains: q, mode: 'insensitive' },
        },
        take: 5,
        select: { title: true },
      }),
      this.prisma.store.findMany({
        where: {
          status: StoreStatus.ACTIVE,
          name: { contains: q, mode: 'insensitive' },
        },
        take: 5,
        select: { name: true },
      }),
      this.prisma.category.findMany({
        where: {
          status: 'ACTIVE',
          name: { contains: q, mode: 'insensitive' },
        },
        take: 5,
        select: { name: true },
      }),
    ]);
    const data = Array.from(
      new Set([
        ...products.map((item) => item.title),
        ...stores.map((item) => item.name),
        ...categories.map((item) => item.name),
      ]),
    ).slice(0, 10);
    const response = { data, meta: { total: data.length } };
    await this.redis.setJson(key, response, 60);

    return response;
  }
}

function normalizeQuery(query: string): string {
  return query.trim().slice(0, 120);
}
