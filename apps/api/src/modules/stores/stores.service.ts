import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreApplicationDto } from './dto/create-store-application.dto';

const publicStores = [
  {
    slug: 'baku-tekstil-mmc',
    name: 'Baku Tekstil MMC',
    category: 'Geyim va Tekstil',
    city: 'Baki',
    productCount: 1250,
    verified: true,
  },
  {
    slug: 'shoes-import-trade',
    name: 'Shoes Import Trade',
    category: 'Ayaqqabi',
    city: 'Sumqayit',
    productCount: 840,
    verified: true,
  },
  {
    slug: 'techwholesale-az',
    name: 'TechWholesale AZ',
    category: 'Elektronika',
    city: 'Baki',
    productCount: 3100,
    verified: true,
  },
];

@Injectable()
export class StoresService {
  listPublicStores() {
    return {
      data: publicStores,
      meta: {
        total: publicStores.length,
      },
    };
  }

  getPublicStore(slug: string) {
    const store = publicStores.find((item) => item.slug === slug);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return { data: store };
  }

  createApplication(dto: CreateStoreApplicationDto) {
    return {
      data: {
        id: 'application_preview',
        status: 'PENDING',
        ...dto,
      },
    };
  }
}
