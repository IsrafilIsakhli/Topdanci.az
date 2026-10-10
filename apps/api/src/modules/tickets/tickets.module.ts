import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminTicketsController, SellerTicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [PrismaModule, AuditModule, NotificationsModule],
  controllers: [SellerTicketsController, AdminTicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
