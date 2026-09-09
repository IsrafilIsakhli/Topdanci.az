import { Body, Controller, Get, Headers, HttpCode, Ip, Patch, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedRequest, AuthenticatedUser } from '../../common/auth/authenticated-user';
import {
  ACCESS_COOKIE_NAME,
  applyAuthCookies,
  clearAuthCookies,
  type CookieResponse,
  parseCookieHeader,
  REFRESH_COOKIE_NAME,
} from './domain/auth-cookies';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { SetupPasswordDto } from './dto/setup-password.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const result = await this.authService.login(dto, {
      ipAddress,
      ...(userAgent ? { userAgent } : {}),
    });
    applyAuthCookies(response, result.tokens, this.authService.cookieConfig());

    return result.data;
  }

  @Post('refresh')
  @Public()
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const cookies = parseCookieHeader(request.headers?.cookie);
    const result = await this.authService.refresh(cookies[REFRESH_COOKIE_NAME], {
      ipAddress,
      ...(userAgent ? { userAgent } : {}),
    });
    applyAuthCookies(response, result.tokens, this.authService.cookieConfig());

    return result.data;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() request: AuthenticatedRequest,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const cookies = parseCookieHeader(request.headers?.cookie);
    const result = await this.authService.logout(cookies[REFRESH_COOKIE_NAME], user);
    clearAuthCookies(response, this.authService.cookieConfig());

    return result;
  }

  @Post('logout-all')
  @HttpCode(200)
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const result = await this.authService.logoutAll(user);
    clearAuthCookies(response, this.authService.cookieConfig());

    return result;
  }

  @Post('setup-password')
  @Public()
  @HttpCode(200)
  setupPassword(@Body() dto: SetupPasswordDto) {
    return this.authService.setupPassword(dto);
  }

  @Get('session')
  @Public()
  session(@Req() request: AuthenticatedRequest) {
    const cookies = parseCookieHeader(request.headers?.cookie);
    return this.authService.session(cookies[ACCESS_COOKIE_NAME]);
  }

  @Patch('me')
  async updateAccount(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAccountDto) {
    const updated = await this.authService.updateAccount(user, dto);
    return { data: { user: updated } };
  }

  @Post('change-password')
  @HttpCode(200)
  async changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    const result = await this.authService.changePassword(user, dto);
    return { data: result };
  }
}
