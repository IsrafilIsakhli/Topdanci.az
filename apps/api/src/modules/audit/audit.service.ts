import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AuditRecordInput = {
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          ...(input.actorId ? { actorId: input.actorId } : {}),
          ...(input.metadata ? { metadata: input.metadata } : {}),
        },
        select: { id: true },
      });
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'audit_log_write_failed',
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
        }),
      );
      this.logger.debug(error instanceof Error ? error.message : String(error));
    }
  }
}
