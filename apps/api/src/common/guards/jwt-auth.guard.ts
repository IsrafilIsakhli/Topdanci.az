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
    const { token, method } = this.extractAccessToken(request);
    const user = this.jwtTokens.verifyAccessToken(token);

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    request.auth = user;
    request.authMethod = method;
    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [context.getHandler(), context.getClass()]),
    );
  }

  private extractAccessToken(request: AuthenticatedRequest): {
    token: string | undefined;
    method: 'cookie' | 'bearer';
  } {
    const cookies = parseCookieHeader(request.headers?.cookie);
    const authorization = request.headers?.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : undefined;

    if (bearer && cookies[ACCESS_COOKIE_NAME]) {
      throw new UnauthorizedException('Ambiguous authentication');
    }

    return bearer
      ? { token: bearer, method: 'bearer' }
      : { token: cookies[ACCESS_COOKIE_NAME], method: 'cookie' };
  }
}
