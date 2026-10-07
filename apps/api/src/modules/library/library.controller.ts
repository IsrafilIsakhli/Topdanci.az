import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { LibraryService } from './library.service';
import { SyncLibraryDto } from './library.dto';
@Controller({ path: 'library', version: '1' })
export class LibraryController {
  constructor(private readonly service: LibraryService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser) { return this.service.list(user.id); }
  @Patch() @Throttle({ default: { limit: 30, ttl: 60000 } })
  sync(@CurrentUser() user: AuthenticatedUser, @Body() dto: SyncLibraryDto) { return this.service.sync(user.id, dto); }
}