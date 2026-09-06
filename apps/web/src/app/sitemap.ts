import type { MetadataRoute } from 'next';
import { getProductsPage, getStoresPage } from '../lib/catalog-data';
import { absoluteUrl } from '../lib/site-url';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, stores] = await Promise.all([
    getProductsPage({ limit: 100 }),
    getStoresPage({ limit: 100 }),
  ]);
  const now = new Date();
  const staticRoutes = ['', '/products', '/stores', '/open-store', '/contact'].map((path) => ({
    url: absoluteUrl(path || '/'),
    lastModified: now,
    changeFrequency: path ? ('daily' as const) : ('hourly' as const),
    priority: path ? 0.8 : 1,
  }));

  return [
    ...staticRoutes,
    ...products.items.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...stores.items.map((store) => ({
      url: absoluteUrl(`/stores/${store.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
