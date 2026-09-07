import type { StoreSort } from '../../lib/catalog-data';

export type StoresSearchQuery = {
  q?: string;
  category?: string;
  city?: string;
  cursor?: string;
  sort?: string;
};

export const STORE_SORT_OPTIONS: Array<{ value: StoreSort; label: string }> = [
  { value: 'newest', label: 'Ən yenilər' },
  { value: 'popular', label: 'Ən çox baxılan' },
  { value: 'products', label: 'Ən çox məhsul' },
];

export function normalizeStoreSort(value?: string): StoreSort {
  return value === 'popular' || value === 'products' ? value : 'newest';
}

export function storeSortLabel(sort: StoreSort): string {
  return STORE_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? sort;
}

export function withoutParam(
  query: StoresSearchQuery | undefined,
  drop: 'q' | 'category' | 'city' | 'sort',
) {
  if (!query) return '/stores';
  const params = new URLSearchParams();
  if (query.q && drop !== 'q') params.set('q', query.q);
  if (query.category && drop !== 'category') params.set('category', query.category);
  if (query.city && drop !== 'city') params.set('city', query.city);
  if (query.sort && drop !== 'sort') params.set('sort', query.sort);
  const qs = params.toString();
  return qs ? `/stores?${qs}` : '/stores';
}

export function buildStoresHref(
  query: StoresSearchQuery | undefined,
  cursor: string,
  sort: StoreSort,
) {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.category) params.set('category', query.category);
  if (query?.city) params.set('city', query.city);
  if (sort !== 'newest') params.set('sort', sort);
  params.set('cursor', cursor);
  return `/stores?${params.toString()}`;
}

export function toNumber(value: string) {
  const number = parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(number) ? number : 0;
}

/** "5.4K" / "1.2M" / "340" kimi compact baxış sayını rəqəmə çevirir. */
export function viewsToNumber(views: string): number {
  const match = views.trim().toLowerCase().match(/^([\d]+(?:[.,]\d+)?)\s*(k|m)?/);
  const rawBase = match?.[1];
  if (!rawBase) return 0;
  const base = Number(rawBase.replace(',', '.'));
  if (!Number.isFinite(base)) return 0;
  const scale = match?.[2] === 'k' ? 1_000 : match?.[2] === 'm' ? 1_000_000 : 1;
  return Math.round(base * scale);
}
