import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/authenticated-user';
import { STORE_MEMBER_REQUIREMENT, type StoreMemberRequirement } from '../decorators/store-member.decorator';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class StoreMemberGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<StoreMemberRequirement>(STORE_MEMBER_REQUIREMENT, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.auth;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user');
    }

    if (requirement.allowAdmin !== false && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)) {
      return true;
    }

    const storeId = extractStoreId(request, requirement);

    if (!storeId) {
      throw new ForbiddenException('Store scope is required');
    }

    const membership = await this.prisma.storeMember.findFirst({
      where: {
        userId: user.id,
        storeId,
      },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenException('Store access denied');
    }

    return true;
  }
}

function extractStoreId(request: AuthenticatedRequest, requirement: StoreMemberRequirement): string | undefined {
  if (requirement.source === 'params') {
    return request.params?.[requirement.key];
  }

  if (requirement.source === 'query') {
    const value = request.query?.[requirement.key];
    return Array.isArray(value) ? value[0] : value;
  }

  if (typeof request.body === 'object' && request.body !== null && requirement.key in request.body) {
    const value = (request.body as Record<string, unknown>)[requirement.key];
    return typeof value === 'string' ? value : undefined;
  }

  return undefined;
}
