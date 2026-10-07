import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StoreStatus, UserStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreateBuyerOfferDto, CreateBuyerRequestDto, ListBuyerRequestsDto } from './buyer-requests.dto';
export const requestSelect = { id: true, title: true, quantity: true, unit: true, city: true, category: true, description: true, status: true, expiresAt: true, createdAt: true, _count: { select: { offers: true } } } satisfies Prisma.BuyerRequestSelect;
export function managementHash(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function validManagementToken(token: string, hash: string) {
  const candidate = Buffer.from(managementHash(token), 'hex'); const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
@Injectable()
export class BuyerRequestsService {
  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}
  async mine(userId: string, query: ListBuyerRequestsDto) {
    const where = { ownerUserId: userId };
    const rows = await this.prisma.buyerRequest.findMany({ where, take: query.limit + 1, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}), select: requestSelect });
    const data = rows.slice(0, query.limit);
    return { data, meta: { nextCursor: rows.length > query.limit ? data.at(-1)?.id : null } };
  }
  async owned(id: string, userId: string) {
    const record = await this.prisma.buyerRequest.findFirst({ where: { id, ownerUserId: userId }, select: requestSelect });
    if (!record) throw new NotFoundException('Bu tələb hesabınıza aid deyil.');
    return { data: { ...record, owned: true, offers: await this.offers(id) } };
  }
  async ownedClose(id: string, userId: string) {
    const result = await this.prisma.buyerRequest.updateMany({ where: { id, ownerUserId: userId }, data: { status: 'CLOSED' } });
    if (!result.count) throw new NotFoundException('Bu tələb hesabınıza aid deyil.');
    return { data: { closed: true } };
  }
  async claim(id: string, userId: string, token: string) {
    await this.authorize(id, token);
    const result = await this.prisma.buyerRequest.updateMany({ where: { id, OR: [{ ownerUserId: null }, { ownerUserId: userId }] }, data: { ownerUserId: userId } });
    if (!result.count) throw new ForbiddenException('Tələb başqa hesaba aiddir.');
    return { data: { claimed: true } };
  }
  async list(query: ListBuyerRequestsDto) {
    const where: Prisma.BuyerRequestWhereInput = { status: 'ACTIVE', expiresAt: { gt: new Date() },
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}) };
    const [items, total] = await Promise.all([this.prisma.buyerRequest.findMany({ where, take: query.limit + 1, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}), select: requestSelect }), this.prisma.buyerRequest.count({ where })]);
    const data = items.slice(0, query.limit); return { data, meta: { total, nextCursor: items.length > query.limit ? data.at(-1)?.id : null } };
  }
  async detail(id: string) {
    const item = await this.prisma.buyerRequest.findUnique({ where: { id }, select: requestSelect });
    if (!item) throw new NotFoundException('Tələb tapılmadı.');
    return { data: item };
  }
  async create(dto: CreateBuyerRequestDto, ownerUserId?: string) {
    if (ownerUserId && !await this.prisma.user.findFirst({ where: { id: ownerUserId, status: 'ACTIVE' }, select: { id: true } })) throw new ForbiddenException('Hesab aktiv deyil.');
    if (dto.category && !await this.prisma.category.findFirst({ where: { slug: dto.category, status: 'ACTIVE' }, select: { id: true } })) throw new BadRequestException('Kateqoriya tapılmadı.');
    const token = randomBytes(32).toString('hex');
    const data = await this.prisma.buyerRequest.create({ data: { ...dto, managementHash: managementHash(token), ...(ownerUserId ? { ownerUserId } : {}), expiresAt: new Date(Date.now() + 30 * 86400000) }, select: requestSelect });
    if (dto.category) {
      const category = await this.prisma.category.findUnique({ where: { slug: dto.category }, select: { id: true, parentId: true } });
      const ids: string[] = []; let current = category;
      while (current && ids.length < 12 && !ids.includes(current.id)) {
        ids.push(current.id); current = current.parentId ? await this.prisma.category.findUnique({ where: { id: current.parentId }, select: { id: true, parentId: true } }) : null;
      }
      const stores = await this.prisma.store.findMany({ where: { status: StoreStatus.ACTIVE, categoryId: { in: ids }, ownerUser: { status: UserStatus.ACTIVE } }, take: 500, select: { ownerUserId: true } });
      await this.notifications.createForUsers(stores.flatMap((store) => store.ownerUserId ? [store.ownerUserId] : []),
        { title: 'Yeni alıcı tələbi', message: dto.title + ' · ' + dto.quantity + ' ' + dto.unit + ' · ' + dto.city, href: '/requests/' + data.id }).catch(() => undefined);
    }
    return { data: { request: data, managementToken: token } };
  }
  async authorize(id: string, token: string) {
    const record = await this.prisma.buyerRequest.findUnique({ where: { id }, select: { managementHash: true } });
    if (!record || !validManagementToken(token, record.managementHash)) throw new ForbiddenException('Tələbi idarə etmək üçün giriş açarı düzgün deyil.');
  }
  async manage(id: string, token: string) {
    await this.authorize(id, token); const detail = await this.detail(id);
    return { data: { ...detail.data, owned: true, offers: await this.offers(id) } };
  }
  private async offers(id: string) {
    const offers = await this.prisma.buyerOffer.findMany({ where: { requestId: id, store: { status: StoreStatus.ACTIVE } }, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }], take: 100,
      select: { id: true, price: true, message: true, createdAt: true, updatedAt: true, store: { select: { id: true, slug: true, name: true, city: true, phone: true, whatsappNumber: true, email: true, verifiedAt: true } } } });
    return offers.map((offer) => ({ ...offer, store: { ...offer.store, verified: !!offer.store.verifiedAt } }));
  }
  async close(id: string, token: string) {
    await this.authorize(id, token);
    await this.prisma.buyerRequest.update({ where: { id }, data: { status: 'CLOSED' } }); return { data: { closed: true } };
  }
  async offer(id: string, user: AuthenticatedUser, dto: CreateBuyerOfferDto) {
    const [request, store] = await Promise.all([
      this.prisma.buyerRequest.findUnique({ where: { id }, select: { title: true, status: true, expiresAt: true, ownerUserId: true } }),
      this.prisma.store.findFirst({ where: { id: dto.storeId, status: StoreStatus.ACTIVE, members: { some: { userId: user.id } } }, select: { id: true, name: true } }),
    ]);
    if (!store) throw new ForbiddenException('Yalnız öz aktiv mağazanızdan təklif göndərə bilərsiniz.');
    if (!request || request.status !== 'ACTIVE' || request.expiresAt <= new Date()) throw new BadRequestException('Bu tələb artıq təklif qəbul etmir.');
    const data = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM buyer_requests WHERE id = ${id} FOR UPDATE`;
      const current = await tx.buyerRequest.findUnique({ where: { id }, select: { status: true, expiresAt: true } });
      if (!current || current.status !== 'ACTIVE' || current.expiresAt <= new Date()) throw new BadRequestException('Bu tələb artıq təklif qəbul etmir.');
      return tx.buyerOffer.upsert({ where: { requestId_storeId: { requestId: id, storeId: store.id } },
        create: { requestId: id, storeId: store.id, price: dto.price ?? null, message: dto.message }, update: { price: dto.price ?? null, message: dto.message },
        select: { id: true, price: true, message: true, updatedAt: true } });
    });
    if (request.ownerUserId) await this.notifications.createForUsers([request.ownerUserId], { title: 'Tələbinizə yeni təklif var', message: store.name + ' · ' + request.title, href: '/requests/' + id }).catch(() => undefined);
    return { data };
  }
}
