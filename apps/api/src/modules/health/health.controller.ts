import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
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
    private readonly config: ConfigService,
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
  metricsSnapshot(@Headers('x-metrics-token') metricsToken?: string) {
    this.assertMetricsAccess(metricsToken);

    return {
      data: this.metrics.snapshot(),
      timestamp: new Date().toISOString(),
    };
  }

  private assertMetricsAccess(metricsToken: string | undefined): void {
    const expectedToken = this.config.get<string>('METRICS_TOKEN', '');

    if (!expectedToken) {
      return;
    }

    if (metricsToken !== expectedToken) {
      throw new UnauthorizedException('Metrics token is required');
    }
  }
}
