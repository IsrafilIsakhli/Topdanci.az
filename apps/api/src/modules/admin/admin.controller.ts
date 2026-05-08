import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller({
  path: 'admin',
  version: '1',
})
export class AdminController {
  @Get('overview')
  overview() {
    return {
      data: {
        pendingStores: 0,
        pendingProducts: 0,
        reports: 0,
      },
    };
  }
}
