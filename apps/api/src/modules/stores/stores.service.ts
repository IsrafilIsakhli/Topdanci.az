import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, Prisma, ProductStatus, StoreStatus } from '@prisma/client';
import { cacheKey } from '../../common/cache/cache-key';
import { toCursorPagination } from '../../common/pagination/cursor-pagination';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateStoreApplicationDto } from './dto/create-store-application.dto';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listPublicStores(query: ListStoresQueryDto) {
    const key = cacheKey('stores:list', query);
    const cached = await this.redis.getJson(key);

    if (cached) {
      return cached;
    }

    const where = publicStoreWhere(query);
    const { take, cursor, skip } = toCursorPagination(query);
    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor } : {}),
        ...(skip ? { skip } : {}),
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        select: publicStoreSelect,
      }),
      this.prisma.store.count({ where }),
    ]);
    const page = stores.slice(0, take);

    const response = {
      data: page.map(mapPublicStore),
      meta: {
        total,
        nextCursor: stores.length > take ? page.at(-1)?.id ?? null : null,
      },
    };
    await this.redis.setJson(key, response, 60);

    return response;
  }

  async getPublicStore(slug: string) {
    const key = cacheKey('stores:detail', { slug });
    const cached = await this.redis.getJson(key);

    if (cached) {
      return cached;
    }

    const store = await this.prisma.store.findFirst({
      where: {
        slug,
        status: StoreStatus.ACTIVE,
      },
      select: publicStoreSelect,
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const response = { data: mapPublicStore(store) };
    await this.redis.setJson(key, response, 300);

    return response;
  }

  async createApplication(dto: CreateStoreApplicationDto) {
    const application = await this.prisma.storeApplication.create({
      data: {
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        companyName: dto.companyName,
        city: dto.city,
        status: ApplicationStatus.PENDING,
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.contactEmail ? { contactEmail: dto.contactEmail } : {}),
        ...(dto.taxNumber ? { taxNumber: dto.taxNumber } : {}),
        ...(dto.district ? { district: dto.district } : {}),
        ...(dto.description ? { description: dto.description } : {}),
      },
      select: {
        id: true,
        status: true,
        companyName: true,
        createdAt: true,
      },
    });

    return {
      data: application,
    };
  }
}

const publicStoreSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  logoKey: true,
  bannerKey: true,
  phone: true,
  whatsappNumber: true,
  email: true,
  city: true,
  district: true,
  verifiedAt: true,
  publishedAt: true,
  category: {
    select: {
      slug: true,
      name: true,
    },
  },
  _count: {
    select: {
      products: {
        where: { status: ProductStatus.ACTIVE },
      },
    },
  },
} satisfies Prisma.StoreSelect;

type PublicStoreRecord = Prisma.StoreGetPayload<{ select: typeof publicStoreSelect }>;

function publicStoreWhere(query: ListStoresQueryDto): Prisma.StoreWhereInput {
  return {
    status: StoreStatus.ACTIVE,
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { description: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
  };
}

function mapPublicStore(store: PublicStoreRecord) {
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    description: store.description,
    logoKey: store.logoKey,
    bannerKey: store.bannerKey,
    phone: store.phone,
    whatsappNumber: store.whatsappNumber,
    email: store.email,
    city: store.city,
    district: store.district,
    verified: Boolean(store.verifiedAt),
    publishedAt: store.publishedAt,
    category: store.category,
    productCount: store._count.products,
  };
}
