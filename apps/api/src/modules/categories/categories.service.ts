import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryStatus, ProductStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicCategories(query: ListCategoriesQueryDto) {
    const where = {
      status: CategoryStatus.ACTIVE,
      ...(query.q
        ? {
            name: {
              contains: query.q,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        _count: {
          select: {
            products: {
              where: {
                status: ProductStatus.ACTIVE,
                store: { status: StoreStatus.ACTIVE },
              },
            },
            stores: {
              where: { status: StoreStatus.ACTIVE },
            },
          },
        },
      },
    });

    return {
      data: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
        productCount: category._count.products,
        storeCount: category._count.stores,
      })),
      meta: {
        total: categories.length,
      },
    };
  }

  async getPublicCategory(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        status: CategoryStatus.ACTIVE,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        _count: {
          select: {
            products: {
              where: {
                status: ProductStatus.ACTIVE,
                store: { status: StoreStatus.ACTIVE },
              },
            },
            stores: {
              where: { status: StoreStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
        productCount: category._count.products,
        storeCount: category._count.stores,
      },
    };
  }
}
