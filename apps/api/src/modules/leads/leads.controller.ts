import { Body, Controller, Headers, Ip, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { CreateLeadEventDto } from './dto/create-lead-event.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@Public()
@Controller({
  path: 'leads',
  version: '1',
})
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  create(
    @Body() dto: CreateLeadEventDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.leadsService.track(dto, {
      ipAddress,
      ...(userAgent ? { userAgent } : {}),
    });
  }
}
