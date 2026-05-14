import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PublicCacheService } from './common/cache/public-cache.service';
import { MetricsModule } from './common/metrics/metrics.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CsrfGuard } from './common/guards/csrf.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { StoreMemberGuard } from './common/guards/store-member.guard';
import { validateEnv } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { LeadsModule } from './modules/leads/leads.module';
import { MediaModule } from './modules/media/media.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { RedisModule } from './modules/redis/redis.module';
import { RedisService } from './modules/redis/redis.service';
import { RedisThrottlerStorage } from './modules/redis/redis-throttler.storage';
import { SearchModule } from './modules/search/search.module';
import { SellerModule } from './modules/seller/seller.module';
import { StoresModule } from './modules/stores/stores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redis: RedisService) => [
        {
          ttl: Number(config.get('RATE_LIMIT_TTL_MS', 60_000)),
          limit: Number(config.get('RATE_LIMIT_MAX', 120)),
          storage: new RedisThrottlerStorage(redis, config.get('NODE_ENV') !== 'production'),
        },
      ],
    }),
    RedisModule,
    MetricsModule,
    PrismaModule,
    AuditModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    StoresModule,
    ProductsModule,
    SearchModule,
    LeadsModule,
    MediaModule,
    SellerModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: StoreMemberGuard,
    },
    PublicCacheService,
  ],
})
export class AppModule {}
