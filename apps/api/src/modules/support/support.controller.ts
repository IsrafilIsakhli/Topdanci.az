import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { SupportService } from './support.service';

@ApiTags('support')
@Public()
@Controller({
  path: 'support',
  version: '1',
})
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('reports')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  report(@Body() dto: CreateReportDto) { return this.supportService.report(dto); }

  @Post('requests')
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  createRequest(@Body() dto: CreateSupportRequestDto) {
    return this.supportService.createRequest(dto);
  }
}
