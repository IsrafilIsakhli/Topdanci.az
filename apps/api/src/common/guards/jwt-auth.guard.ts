import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../auth/authenticated-user';
import { IS_PUBLIC_ROUTE } from '../decorators/public.decorator';
import { ACCESS_COOKIE_NAME, parseCookieHeader } from '../../modules/auth/domain/auth-cookies';
import { JwtTokenService } from '../../modules/auth/domain/jwt-token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokens: JwtTokenService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.isPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractAccessToken(request);
    const user = this.jwtTokens.verifyAccessToken(token);

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    request.auth = user;
    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [context.getHandler(), context.getClass()]),
    );
  }

  private extractAccessToken(request: AuthenticatedRequest): string | undefined {
    const cookies = parseCookieHeader(request.headers?.cookie);

    if (cookies[ACCESS_COOKIE_NAME]) {
      return cookies[ACCESS_COOKIE_NAME];
    }

    const authorization = request.headers?.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;

    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim();
    }

    return undefined;
  }
}
