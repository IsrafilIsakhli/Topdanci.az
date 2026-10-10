import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TicketPriority, TicketStatus, UserRole, UserStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTicketDto,
  ListTicketsDto,
  TicketMessageDto,
  TicketMessagesQueryDto,
  UpdateTicketDto,
} from './dto/ticket.dto';

const personSelect = { id: true, fullName: true, role: true } satisfies Prisma.UserSelect;
const ticketInclude = {
  store: { select: { id: true, name: true, slug: true, city: true } },
  creator: { select: personSelect },
  assignee: { select: personSelect },
  _count: { select: { messages: true } },
} satisfies Prisma.SupportTicketInclude;
const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Açıq',
  IN_PROGRESS: 'İcradadır',
  WAITING_SELLER: 'Mağazadan cavab gözlənilir',
  WAITING_SUPPORT: 'Dəstəkdən cavab gözlənilir',
  CLOSED: 'Bağlı',
};
const priorityLabels: Record<TicketPriority, string> = {
  LOW: 'Aşağı',
  NORMAL: 'Normal',
  HIGH: 'Yüksək',
  URGENT: 'Təcili',
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private scope(user: AuthenticatedUser, admin: boolean): Prisma.SupportTicketWhereInput {
    if (admin) {
      if (user.role !== UserRole.SUPER_ADMIN)
        throw new ForbiddenException('Bu bölmə yalnız superadmin üçün açıqdır.');
      return {};
    }
    return {
      store: { OR: [{ ownerUserId: user.id }, { members: { some: { userId: user.id } } }] },
    };
  }

  async list(user: AuthenticatedUser, query: ListTicketsDto, admin: boolean) {
    const scope = this.scope(user, admin);
    const where: Prisma.SupportTicketWhereInput = {
      ...scope,
      ...(query.status ? { status: query.status } : {}),
      ...(query.reason ? { reason: query.reason } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.q
        ? {
            OR: [
              { subject: { contains: query.q, mode: 'insensitive' } },
              { store: { name: { contains: query.q, mode: 'insensitive' } } },
              ...(/^\d{1,9}$/.test(query.q.replace(/^#/, ''))
                ? [{ number: Number(query.q.replace(/^#/, '')) }]
                : []),
            ],
          }
        : {}),
    };
    const [data, total, groups] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: ticketInclude,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.groupBy({ by: ['status'], where: scope, _count: { _all: true } }),
    ]);
    const counts = Object.fromEntries(
      Object.values(TicketStatus).map((status) => [
        status,
        groups.find((group) => group.status === status)?._count._all ?? 0,
      ]),
    );
    return {
      data,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
        counts,
      },
    };
  }

  private async find(user: AuthenticatedUser, id: string, admin: boolean) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, ...this.scope(user, admin) },
      include: ticketInclude,
    });
    if (!ticket)
      throw new NotFoundException('Müraciət tapılmadı və ya bu mağazaya girişiniz yoxdur.');
    return ticket;
  }

  async detail(user: AuthenticatedUser, id: string, admin: boolean) {
    const ticket = await this.find(user, id, admin);
    const messages = await this.messages(user, id, { limit: 50 }, admin);
    return { data: { ...ticket, messages: messages.data }, meta: messages.meta };
  }

  async messages(
    user: AuthenticatedUser,
    id: string,
    query: TicketMessagesQueryDto,
    admin: boolean,
  ) {
    await this.find(user, id, admin);
    if (
      query.cursor &&
      !(await this.prisma.ticketMessage.findFirst({
        where: { id: query.cursor, ticketId: id },
        select: { id: true },
      }))
    ) {
      throw new BadRequestException('Yazışma səhifəsi düzgün deyil.');
    }
    const items = await this.prisma.ticketMessage.findMany({
      where: { ticketId: id },
      include: { author: { select: personSelect } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });
    const data = items.slice(0, query.limit);
    return {
      data: [...data].reverse(),
      meta: { nextCursor: items.length > query.limit ? (data.at(-1)?.id ?? null) : null },
    };
  }

  async create(user: AuthenticatedUser, dto: CreateTicketDto) {
    const store = await this.prisma.store.findFirst({
      where: {
        id: dto.storeId,
        OR: [{ ownerUserId: user.id }, { members: { some: { userId: user.id } } }],
      },
      select: { id: true },
    });
    if (!store) throw new ForbiddenException('Yalnız öz mağazanız üçün müraciət aça bilərsiniz.');
    const ticket = await this.prisma.supportTicket.create({
      data: {
        storeId: store.id,
        creatorId: user.id,
        subject: dto.subject,
        reason: dto.reason,
        priority: dto.priority,
        messages: { create: { authorId: user.id, authorRole: user.role, body: dto.message } },
      },
      include: ticketInclude,
    });
    await this.audit.record({
      actorId: user.id,
      action: 'TICKET_CREATED',
      resourceType: 'SupportTicket',
      resourceId: ticket.id,
      metadata: { number: ticket.number, reason: ticket.reason },
    });
    await this.notify(user, ticket, false, 'Yeni dəstək müraciəti');
    return { data: ticket };
  }

  async reply(user: AuthenticatedUser, id: string, dto: TicketMessageDto, admin: boolean) {
    const ticket = await this.find(user, id, admin);
    if (ticket.status === TicketStatus.CLOSED)
      throw new ConflictException('Cavab yazmaq üçün əvvəl müraciəti yenidən açın.');
    const status = admin ? TicketStatus.WAITING_SELLER : TicketStatus.WAITING_SUPPORT;
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.supportTicket.updateMany({
        where: { id, version: dto.version, ...this.scope(user, admin) },
        data: { status, version: { increment: 1 }, updatedAt: new Date() },
      });
      if (result.count !== 1)
        throw new ConflictException('Müraciət yenilənib. Son yazışmanı yeniləyib təkrar göndərin.');
      await tx.ticketMessage.create({
        data: { ticketId: id, authorId: user.id, authorRole: user.role, body: dto.message },
      });
      return tx.supportTicket.findUniqueOrThrow({ where: { id }, include: ticketInclude });
    });
    await this.audit.record({
      actorId: user.id,
      action: 'TICKET_REPLIED',
      resourceType: 'SupportTicket',
      resourceId: id,
    });
    await this.notify(user, updated, admin, 'Müraciətə yeni cavab');
    return this.detail(user, id, admin);
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateTicketDto, admin: boolean) {
    const ticket = await this.find(user, id, admin);
    if (
      !admin &&
      (dto.priority !== undefined ||
        dto.claim !== undefined ||
        (dto.status !== TicketStatus.OPEN && dto.status !== TicketStatus.CLOSED))
    ) {
      throw new ForbiddenException('Mağaza yalnız müraciəti bağlaya və ya yenidən aça bilər.');
    }
    if (dto.status === TicketStatus.OPEN && ticket.status !== TicketStatus.CLOSED && !admin)
      throw new BadRequestException('Yalnız bağlı müraciəti yenidən açmaq olar.');
    if (dto.status === TicketStatus.CLOSED && !dto.message?.trim())
      throw new BadRequestException('Bağlanma səbəbini yazın.');
    if (dto.claim && ticket.assigneeId && ticket.assigneeId !== user.id)
      throw new ConflictException('Bu müraciət artıq başqa superadminə təyin edilib.');
    if (dto.claim === false && ticket.assigneeId !== user.id)
      throw new ForbiddenException('Yalnız öz üzərinizə götürdüyünüz müraciəti buraxa bilərsiniz.');

    const changes: string[] = [];
    const data: Prisma.SupportTicketUncheckedUpdateManyInput = {
      version: { increment: 1 },
      updatedAt: new Date(),
    };
    if (dto.status && dto.status !== ticket.status) {
      data.status = dto.status;
      data.closedAt = dto.status === TicketStatus.CLOSED ? new Date() : null;
      changes.push(`Status: ${statusLabels[ticket.status]} → ${statusLabels[dto.status]}`);
    }
    if (dto.priority && dto.priority !== ticket.priority) {
      data.priority = dto.priority;
      changes.push(
        `Prioritet: ${priorityLabels[ticket.priority]} → ${priorityLabels[dto.priority]}`,
      );
    }
    if (dto.claim !== undefined) {
      data.assigneeId = dto.claim ? user.id : null;
      changes.push(
        dto.claim
          ? 'Superadmin müraciəti üzərinə götürdü.'
          : 'Müraciət yenidən ümumi növbəyə qaytarıldı.',
      );
    }
    if (!changes.length) throw new BadRequestException('Dəyişiklik seçilməyib.');
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.supportTicket.updateMany({
        where: { id, version: dto.version, ...this.scope(user, admin) },
        data,
      });
      if (result.count !== 1)
        throw new ConflictException('Müraciət yenilənib. Səhifəni yeniləyib təkrar cəhd edin.');
      await tx.ticketMessage.create({
        data: {
          ticketId: id,
          authorId: user.id,
          authorRole: user.role,
          kind: 'SYSTEM',
          body: [...changes, ...(dto.message ? [dto.message] : [])].join('\n'),
        },
      });
      return tx.supportTicket.findUniqueOrThrow({ where: { id }, include: ticketInclude });
    });
    await this.audit.record({
      actorId: user.id,
      action: 'TICKET_UPDATED',
      resourceType: 'SupportTicket',
      resourceId: id,
      metadata: {
        status: updated.status,
        priority: updated.priority,
        assigneeId: updated.assigneeId,
      },
    });
    await this.notify(user, updated, admin, 'Müraciətin vəziyyəti dəyişdi');
    return this.detail(user, id, admin);
  }

  private async notify(
    user: AuthenticatedUser,
    ticket: { id: string; number: number; subject: string; storeId: string },
    admin: boolean,
    title: string,
  ) {
    try {
      const recipients = await this.prisma.user.findMany({
        where: {
          id: { not: user.id },
          status: UserStatus.ACTIVE,
          ...(admin
            ? {
                OR: [
                  { ownedStores: { some: { id: ticket.storeId } } },
                  { storeMembers: { some: { storeId: ticket.storeId } } },
                ],
              }
            : { role: UserRole.SUPER_ADMIN }),
        },
        select: { id: true },
      });
      await this.notifications.createForUsers(
        recipients.map((person) => person.id),
        {
          title,
          message: `#${ticket.number} · ${ticket.subject}`,
          href: `${admin ? '/seller' : '/admin'}/tickets/${ticket.id}`,
        },
      );
    } catch {
      this.logger.warn(`Ticket bildirişi göndərilmədi: ${ticket.id}`);
    }
  }
}
