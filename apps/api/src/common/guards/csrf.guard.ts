import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../auth/authenticated-user';
import { IS_PUBLIC_ROUTE } from '../decorators/public.decorator';
import { CSRF_COOKIE_NAME, parseCookieHeader } from '../../modules/auth/domain/auth-cookies';

const csrfHeaderName = 'x-csrf-token';
const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.isPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (safeMethods.has(request.method)) {
      return true;
    }

    const cookies = parseCookieHeader(request.headers?.cookie);
    const csrfCookie = cookies[CSRF_COOKIE_NAME];
    const csrfHeader = getHeader(request.headers?.[csrfHeaderName]);

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('CSRF token is required');
    }

    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [context.getHandler(), context.getClass()]),
    );
  }
}

function getHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
