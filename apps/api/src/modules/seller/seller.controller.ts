import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SellerService } from './seller.service';

@ApiTags('seller')
@Controller({
  path: 'seller',
  version: '1',
})
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('overview')
  overview() {
    return this.sellerService.overview();
  }
}
