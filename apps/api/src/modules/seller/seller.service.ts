import { Injectable } from '@nestjs/common';

@Injectable()
export class SellerService {
  overview() {
    return {
      data: {
        totalProducts: 0,
        activeProducts: 0,
        pendingProducts: 0,
        whatsappClicksToday: 0,
        storeViewsToday: 0,
      },
    };
  }
}
