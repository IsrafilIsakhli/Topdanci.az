import { Injectable } from '@nestjs/common';

const publicCategories = [
  { slug: 'geyim', name: 'Geyim', productCount: 45000, storeCount: 120 },
  { slug: 'ayaqqabi', name: 'Ayaqqabi', productCount: 22000, storeCount: 85 },
  { slug: 'aksesuar', name: 'Aksesuar', productCount: 15000, storeCount: 60 },
  { slug: 'kosmetika', name: 'Kosmetika', productCount: 30000, storeCount: 95 },
  { slug: 'elektronika', name: 'Elektronika', productCount: 18000, storeCount: 50 },
  { slug: 'ev-mehsullari', name: 'Ev mehsullari', productCount: 25000, storeCount: 70 },
  { slug: 'insaat-materiallari', name: 'Insaat materiallari', productCount: 12000, storeCount: 40 },
  { slug: 'qida-mehsullari', name: 'Qida mehsullari', productCount: 40000, storeCount: 110 },
];

@Injectable()
export class CategoriesService {
  listPublicCategories() {
    return {
      data: publicCategories,
      meta: {
        total: publicCategories.length,
      },
    };
  }
}
