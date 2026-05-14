import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { MetricsService } from '../../common/metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Public()
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(
    private readonly metrics: MetricsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'topdanbazar-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    await this.redis.ping();

    return {
      status: 'ready',
      dependencies: {
        database: 'ok',
        redis: 'ok',
      },
      metrics: this.metrics.snapshot(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  metricsSnapshot() {
    return {
      data: this.metrics.snapshot(),
      timestamp: new Date().toISOString(),
    };
  }
}
