import { Injectable, NotFoundException } from '@nestjs/common';
import { ListProductsQueryDto } from './dto/list-products-query.dto';

const publicProducts = [
  {
    slug: 'kis-qis-godekceleri-model-402',
    title: 'Kis qis godekceleri Model 402',
    storeName: 'Baku Tekstil MMC',
    city: 'Baki',
    category: 'Geyim',
    priceType: 'NEGOTIABLE',
    minOrderQuantity: 50,
  },
  {
    slug: 'qadin-dari-cakmalari-stok-500-cut',
    title: 'Qadin dari cakmalari Stok 500 cut',
    storeName: 'Shoes Import Trade',
    city: 'Sumqayit',
    category: 'Ayaqqabi',
    priceType: 'NEGOTIABLE',
    minOrderQuantity: 100,
  },
  {
    slug: 'agilli-saatlar-x-series',
    title: 'Agilli saatlar X-Series',
    storeName: 'TechWholesale AZ',
    city: 'Baki',
    category: 'Elektronika',
    priceType: 'NEGOTIABLE',
    minOrderQuantity: 50,
  },
];

@Injectable()
export class ProductsService {
  listPublicProducts(query: ListProductsQueryDto) {
    const normalizedQuery = query.q?.toLocaleLowerCase('az-AZ');
    const data = normalizedQuery
      ? publicProducts.filter((product) => product.title.toLocaleLowerCase('az-AZ').includes(normalizedQuery))
      : publicProducts;

    return {
      data,
      meta: {
        total: data.length,
        nextCursor: null,
      },
    };
  }

  getPublicProduct(slug: string) {
    const product = publicProducts.find((item) => item.slug === slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { data: product };
  }
}
