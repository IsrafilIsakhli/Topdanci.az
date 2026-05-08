import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateStoreApplicationDto } from './dto/create-store-application.dto';
import { StoresService } from './stores.service';

@ApiTags('stores')
@Controller({
  path: 'stores',
  version: '1',
})
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  list() {
    return this.storesService.listPublicStores();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.storesService.getPublicStore(slug);
  }

  @Post('applications')
  createApplication(@Body() dto: CreateStoreApplicationDto) {
    return this.storesService.createApplication(dto);
  }
}
