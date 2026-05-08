import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateStoreApplicationDto } from './dto/create-store-application.dto';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { StoresService } from './stores.service';

@ApiTags('stores')
@Controller({
  path: 'stores',
  version: '1',
})
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  list(@Query() query: ListStoresQueryDto) {
    return this.storesService.listPublicStores(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.storesService.getPublicStore(slug);
  }

  @Post('applications')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  createApplication(@Body() dto: CreateStoreApplicationDto) {
    return this.storesService.createApplication(dto);
  }
}
