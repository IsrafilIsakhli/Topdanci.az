import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const ROUTE_ROLES = 'routeRoles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROUTE_ROLES, roles);
