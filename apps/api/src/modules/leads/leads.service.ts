import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, StoreStatus } from '@prisma/client';
import { hashIpAddress } from '../../common/security/hash-ip';
import { PrismaService } from '../prisma/prisma.service';
import { shouldDeduplicateLead } from './domain/lead-event.policy';
import { CreateLeadEventDto } from './dto/create-lead-event.dto';

type LeadRequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class LeadsService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async track(dto: CreateLeadEventDto, context: LeadRequestContext) {
    const salt = this.config.get<string>('LEAD_HASH_SALT', this.config.get<string>('JWT_ACCESS_SECRET', 'local-dev'));
    const ipHash = context.ipAddress ? hashIpAddress(context.ipAddress, salt) : undefined;
    const userAgentHash = context.userAgent ? hashIpAddress(context.userAgent, salt) : undefined;
    const store = await this.prisma.store.findFirst({
      where: {
        id: dto.storeId,
        status: StoreStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!store) {
      return {
        data: {
          accepted: false,
          reason: 'STORE_NOT_FOUND',
        },
      };
    }

    const dedupeWhere = buildDedupeWhere(dto, ipHash);

    if (dedupeWhere) {
      const duplicate = await this.prisma.leadEvent.findFirst({
        where: dedupeWhere,
        select: { id: true },
      });

      if (duplicate) {
        return {
          data: {
            accepted: true,
            deduplicated: true,
            type: dto.type,
          },
        };
      }
    }

    await this.prisma.leadEvent.create({
      data: leadEventCreateData(dto, ipHash, userAgentHash),
      select: { id: true },
    });

    return {
      data: {
        accepted: true,
        type: dto.type,
      },
    };
  }
}

function buildDedupeWhere(dto: CreateLeadEventDto, ipHash?: string): Prisma.LeadEventWhereInput | null {
  if (!shouldDeduplicateLead(dto.type) || (!dto.anonymousId && !ipHash)) {
    return null;
  }

  const dedupeWindow = new Date(Date.now() - 10 * 60 * 1000);

  return {
    type: dto.type,
    storeId: dto.storeId,
    productId: dto.productId ?? null,
    createdAt: { gte: dedupeWindow },
    OR: [
      ...(dto.anonymousId ? [{ anonymousId: dto.anonymousId }] : []),
      ...(ipHash ? [{ ipHash }] : []),
    ],
  };
}

function leadEventCreateData(
  dto: CreateLeadEventDto,
  ipHash?: string,
  userAgentHash?: string,
): Prisma.LeadEventUncheckedCreateInput {
  return {
    type: dto.type,
    storeId: dto.storeId,
    ...(dto.productId ? { productId: dto.productId } : {}),
    ...(dto.anonymousId ? { anonymousId: dto.anonymousId } : {}),
    ...(dto.source ? { source: dto.source } : {}),
    ...(ipHash ? { ipHash } : {}),
    ...(userAgentHash ? { userAgentHash } : {}),
  };
}
