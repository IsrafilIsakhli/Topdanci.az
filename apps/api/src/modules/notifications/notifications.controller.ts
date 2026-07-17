import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListNotificationsQueryDto) {
    return this.notifications.list(user, query);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notifications.markRead(user, id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.markAllRead(user);
  }
}
