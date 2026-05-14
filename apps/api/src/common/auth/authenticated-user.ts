import type { UserRole, UserStatus } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
  status: UserStatus;
  email?: string;
  phone?: string;
};

export type AuthenticatedRequest = {
  auth?: AuthenticatedUser;
  method: string;
  headers?: Record<string, string | string[] | undefined>;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};
