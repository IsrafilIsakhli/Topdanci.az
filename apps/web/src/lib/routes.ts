export const routes = {
  home: '/',
  categories: '/products',
  products: '/products',
  stores: '/stores',
  login: '/login',
  openStore: '/open-store',
  seller: '/seller',
  admin: '/admin',
} as const;

export function productRoute(slug: string): string {
  return `/products/${slug}`;
}

export function storeRoute(slug: string): string {
  return `/stores/${slug}`;
}

export function categoryRoute(slug: string): string {
  return `/products?category=${encodeURIComponent(slug)}`;
}
