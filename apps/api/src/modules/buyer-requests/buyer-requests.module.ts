import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BuyerRequestsController } from './buyer-requests.controller';
import { BuyerRequestsService } from './buyer-requests.service';
@Module({ imports: [AuthModule], controllers: [BuyerRequestsController], providers: [BuyerRequestsService] })
export class BuyerRequestsModule {}
