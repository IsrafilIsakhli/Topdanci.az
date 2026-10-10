import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateTicketDto,
  ListTicketsDto,
  TicketMessageDto,
  TicketMessagesQueryDto,
  UpdateTicketDto,
} from './dto/ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('seller-tickets')
@Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller({ path: 'seller/tickets', version: '1' })
export class SellerTicketsController {
  constructor(private readonly tickets: TicketsService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListTicketsDto) {
    return this.tickets.list(user, query, false);
  }
  @Post()
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTicketDto) {
    return this.tickets.create(user, dto);
  }
  @Get(':id') detail(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.tickets.detail(user, id, false);
  }
  @Get(':id/messages') messages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query() query: TicketMessagesQueryDto,
  ) {
    return this.tickets.messages(user, id, query, false);
  }
  @Post(':id/messages')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  reply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: TicketMessageDto,
  ) {
    return this.tickets.reply(user, id, dto, false);
  }
  @Patch(':id') update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.tickets.update(user, id, dto, false);
  }
}

@ApiTags('admin-tickets')
@Roles(UserRole.SUPER_ADMIN)
@Controller({ path: 'admin/tickets', version: '1' })
export class AdminTicketsController {
  constructor(private readonly tickets: TicketsService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListTicketsDto) {
    return this.tickets.list(user, query, true);
  }
  @Get(':id') detail(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.tickets.detail(user, id, true);
  }
  @Get(':id/messages') messages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query() query: TicketMessagesQueryDto,
  ) {
    return this.tickets.messages(user, id, query, true);
  }
  @Post(':id/messages')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  reply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: TicketMessageDto,
  ) {
    return this.tickets.reply(user, id, dto, true);
  }
  @Patch(':id') update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.tickets.update(user, id, dto, true);
  }
}
