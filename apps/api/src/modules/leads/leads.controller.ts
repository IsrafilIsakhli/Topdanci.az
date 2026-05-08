import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateLeadEventDto } from './dto/create-lead-event.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@Controller({
  path: 'leads',
  version: '1',
})
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadEventDto) {
    return this.leadsService.track(dto);
  }
}
