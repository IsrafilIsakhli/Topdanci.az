import { describe, expect, it } from 'vitest';
import { createDemoCatalog } from './demo-data';

describe('demo catalog', () => {
  it('keeps product and store fixtures connected to their images', () => {
    const { products, stores } = createDemoCatalog({
      themedImage: (categorySlug, index) => `/${categorySlug}/${index}`,
      heroImage: '/hero',
      categoryImageFallback: '/category',
    });

    expect(products[0]).toMatchObject({
      slug: 'kis-qis-godekceleri-model-402',
      storeSlug: 'baku-tekstil-mmc',
      imageUrl: '/geyim-ayaqqabi-ve-tekstil/0',
    });
    expect(stores[0]).toMatchObject({ slug: 'baku-tekstil-mmc', coverImageUrl: '/store-placeholder.svg' });
    expect(Number(stores[0]?.productCount)).toBe(products.filter((product) => product.storeSlug === stores[0]?.slug).length);
    expect(products.some((product) => product.badge === 'Top satıcı')).toBe(true);
  });
});
