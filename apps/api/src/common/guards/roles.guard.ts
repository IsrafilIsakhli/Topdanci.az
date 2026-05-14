import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/authenticated-user';
import { ROUTE_ROLES } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROUTE_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.auth;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user');
    }

    if (user.role === UserRole.SUPER_ADMIN || roles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
