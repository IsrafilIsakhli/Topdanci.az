import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma, UserRole, UserStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PrismaService } from '../prisma/prisma.service';
import type { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';

export type CreateNotificationInput = {
  type?: NotificationType;
  title: string;
  message: string;
  href?: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthenticatedUser, query: ListNotificationsQueryDto) {
    const where: Prisma.NotificationWhereInput = {
      userId: user.id,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: notificationSelect,
      }),
      this.prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

    return { data: items, meta: { unreadCount } };
  }

  async markRead(user: AuthenticatedUser, id: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId: user.id },
      select: notificationSelect,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return { data: notification, changed: result.count === 1 };
  }

  async markAllRead(user: AuthenticatedUser) {
    const result = await this.prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return { data: { updated: result.count } };
  }

  async createForUsers(userIds: string[], input: CreateNotificationInput): Promise<void> {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
    if (!uniqueUserIds.length) return;

    await this.prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        type: input.type ?? NotificationType.INFO,
        title: input.title,
        message: input.message,
        ...(input.href ? { href: input.href } : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
      })),
    });
  }

  async createForRoles(roles: UserRole[], input: CreateNotificationInput): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { role: { in: roles }, status: UserStatus.ACTIVE },
      select: { id: true },
    });
    await this.createForUsers(users.map((user) => user.id), input);
  }
}

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  href: true,
  metadata: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;
