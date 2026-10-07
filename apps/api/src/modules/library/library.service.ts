import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapPublicProduct, publicProductSelect } from '../products/products.service';
import { mapPublicStore, publicStoreSelect } from '../stores/stores.service';
import type { SyncLibraryDto } from './library.dto';
@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}
  async list(userId: string) {
    const rows = await this.prisma.favorite.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 200 });
    const [products, stores] = await Promise.all([
      this.prisma.product.findMany({ where: { id: { in: rows.filter(r => r.kind === 'product').map(r => r.targetId) }, status: 'ACTIVE', store: { status: 'ACTIVE' } }, select: publicProductSelect }),
      this.prisma.store.findMany({ where: { id: { in: rows.filter(r => r.kind === 'store').map(r => r.targetId) }, status: 'ACTIVE' }, select: publicStoreSelect }),
    ]);
    const rank = new Map(rows.map((r, i) => [r.targetId, i]));
    return { data: { products: products.sort((a,b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)).map(mapPublicProduct),
      stores: stores.sort((a,b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)).map(mapPublicStore) } };
  }
  async sync(userId: string, dto: SyncLibraryDto) {
    await this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const desired = [...new Map(dto.changes.map(v => [v.kind + ':' + v.id, v])).values()];
      for (const change of [...desired.filter(v => !v.saved), ...desired.filter(v => v.saved)]) {
        const where = { userId_kind_targetId: { userId, kind: change.kind, targetId: change.id } };
        if (!change.saved) { await tx.favorite.deleteMany({ where: where.userId_kind_targetId }); continue; }
        const exists = change.kind === 'product'
          ? await tx.product.findFirst({ where: { id: change.id, status: 'ACTIVE', store: { status: 'ACTIVE' } }, select: { id: true } })
          : await tx.store.findFirst({ where: { id: change.id, status: 'ACTIVE' }, select: { id: true } });
        if (!exists) continue;
        const previous = await tx.favorite.findUnique({ where });
        if (!previous && await tx.favorite.count({ where: { userId, kind: change.kind } }) >= 100) {
          const oldest = await tx.favorite.findFirst({ where: { userId, kind: change.kind }, orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }], select: { id: true } });
          if (oldest) await tx.favorite.delete({ where: { id: oldest.id } });
        }
        await tx.favorite.upsert({ where, create: where.userId_kind_targetId, update: { updatedAt: new Date() } });
      }
    });
    return this.list(userId);
  }
}