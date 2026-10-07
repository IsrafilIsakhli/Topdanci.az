import { Body, Controller, Get, Headers, UnauthorizedException, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { JwtTokenService } from '../auth/domain/jwt-token.service';
import { CreateBuyerOfferDto, CreateBuyerRequestDto, ListBuyerRequestsDto, ManageBuyerRequestDto } from './buyer-requests.dto';
import { BuyerRequestsService } from './buyer-requests.service';
@ApiTags('buyer-requests')
@Controller({ path: 'buyer-requests', version: '1' })
export class BuyerRequestsController {
  constructor(private readonly service: BuyerRequestsService, private readonly tokens: JwtTokenService) {}
  @Public() @Get() list(@Query() query: ListBuyerRequestsDto) { return this.service.list(query); }
  @Get('mine') mine(@CurrentUser() user: AuthenticatedUser, @Query() query: ListBuyerRequestsDto) { return this.service.mine(user.id, query); }
  @Get(':id/owned') owned(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.owned(id, user.id); }
  @Post(':id/owned/close') ownedClose(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.ownedClose(id, user.id); }
  @Post(':id/claim') @Throttle({ default: { limit: 20, ttl: 60000 } })
  claim(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: ManageBuyerRequestDto) { return this.service.claim(id, user.id, dto.token); }
  @Public() @Get(':id') detail(@Param('id') id: string) { return this.service.detail(id); }
  @Public() @Post() @Throttle({ default: { limit: 5, ttl: 3600000 } })
  create(@Body() dto: CreateBuyerRequestDto, @Headers('authorization') header?: string) {
    const user = header?.startsWith('Bearer ') ? this.tokens.verifyAccessToken(header.slice(7)) : null;
    if (header && !user) throw new UnauthorizedException('Sessiyanın müddəti bitib. Yenidən daxil olun.');
    return this.service.create(dto, user?.id);
  }
  @Public() @Post(':id/manage') @Throttle({ default: { limit: 30, ttl: 60000 } })
  manage(@Param('id') id: string, @Body() dto: ManageBuyerRequestDto) { return this.service.manage(id, dto.token); }
  @Public() @Post(':id/close') @Throttle({ default: { limit: 10, ttl: 60000 } })
  close(@Param('id') id: string, @Body() dto: ManageBuyerRequestDto) { return this.service.close(id, dto.token); }
  @Roles(UserRole.SELLER) @Post(':id/offers') @Throttle({ default: { limit: 15, ttl: 60000 } })
  offer(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBuyerOfferDto) { return this.service.offer(id, user, dto); }
}
