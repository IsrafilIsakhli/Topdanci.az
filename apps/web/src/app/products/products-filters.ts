import type { ReactNode } from 'react';
import type { ProductSort } from '../../lib/catalog-data';

export type ProductsSearchQuery = {
  q?: string;
  category?: string;
  city?: string;
  cursor?: string;
  sort?: string;
  priceMin?: string;
  priceMax?: string;
  minOrderMax?: string;
  verified?: string;
  stock?: string;
};

export const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'newest', label: 'Ən yenilər' },
  { value: 'popular', label: 'Populyar' },
  { value: 'price_asc', label: 'Qiymət: artan' },
  { value: 'price_desc', label: 'Qiymət: azalan' },
];

const STOCK_LABELS: Record<string, string> = {
  IN_STOCK: 'Stokda var',
  LIMITED: 'Məhdud stok',
  OUT_OF_STOCK: 'Stokda yoxdur',
};

export type ActiveFilter = {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
};

export function normalizeProductSort(value?: string): ProductSort {
  return value === 'popular' || value === 'price_asc' || value === 'price_desc' ? value : 'newest';
}

export function buildProductsHref(
  query: ProductsSearchQuery | undefined,
  sort: ProductSort,
  options?: { cursor?: string; drop?: string },
) {
  const params = new URLSearchParams();
  const set = (key: keyof ProductsSearchQuery, value: string | undefined) => {
    if (value && key !== options?.drop) {
      params.set(key, value);
    }
  };
  set('q', query?.q);
  set('category', query?.category);
  set('city', query?.city);
  set('priceMin', query?.priceMin);
  set('priceMax', query?.priceMax);
  set('minOrderMax', query?.minOrderMax);
  set('verified', query?.verified);
  set('stock', query?.stock);
  if (sort !== 'newest' && options?.drop !== 'sort') {
    params.set('sort', sort);
  }
  if (options?.cursor) {
    params.set('cursor', options.cursor);
  }
  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

export function buildActiveFilters(
  query: ProductsSearchQuery | undefined,
  sort: ProductSort,
  categories: Array<{ slug: string; name: string }>,
): ActiveFilter[] {
  if (!query) {
    return [];
  }

  const filters: ActiveFilter[] = [];
  const push = (key: keyof ProductsSearchQuery, label: string, icon?: ReactNode) => {
    filters.push({ key, label, icon, href: buildProductsHref(query, sort, { drop: key }) });
  };

  if (query.q) {
    push('q', `“${query.q}”`);
  }
  if (query.city) {
    push('city', query.city);
  }
  if (query.category) {
    const name = categories.find((category) => category.slug === query.category)?.name ?? query.category;
    push('category', name);
  }
  if (sort !== 'newest') {
    const label = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? sort;
    filters.push({ key: 'sort', label, href: buildProductsHref(query, 'newest', { drop: 'sort' }) });
  }
  if (query.priceMin) {
    push('priceMin', `Min qiymət: ${query.priceMin} AZN`);
  }
  if (query.priceMax) {
    push('priceMax', `Maks qiymət: ${query.priceMax} AZN`);
  }
  if (query.minOrderMax) {
    push('minOrderMax', `Min sifariş ≤ ${query.minOrderMax}`);
  }
  if (query.verified === 'true') {
    push('verified', 'Təsdiqlənmiş mağazalar');
  }
  if (query.stock) {
    push('stock', STOCK_LABELS[query.stock] ?? query.stock);
  }

  return filters;
}

export function toOptionalNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function normalizeStock(value?: string): 'IN_STOCK' | 'LIMITED' | 'OUT_OF_STOCK' | undefined {
  return value === 'IN_STOCK' || value === 'LIMITED' || value === 'OUT_OF_STOCK' ? value : undefined;
}
