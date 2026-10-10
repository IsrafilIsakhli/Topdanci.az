import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  BriefcaseBusiness,
  Building2,
  Car,
  GraduationCap,
  Headphones,
  House,
  Package,
  PawPrint,
  Shirt,
  Smartphone,
  Watch,
  WashingMachine,
  Wrench,
} from 'lucide-react';
import {
  defaultCategories as defaultCategoryTree,
  type DefaultCategoryNode,
} from '@topdanbazar/shared';
import { apiGet } from '../../lib/api-client';
import { createDemoCatalog } from './demo-data';

import type {
  ApiCategory,
  ApiDetailResponse,
  ApiListResponse,
  ApiProduct,
  ApiStore,
  CatalogPage,
  CategoryCard,
  ProductPreview,
  ProductQuery,
  StorePreview,
  StoreQuery,
} from './types';
export type {
  CatalogPage,
  CategoryCard,
  CategoryChild,
  ProductPreview,
  ProductQuery,
  ProductSort,
  StorePreview,
  StoreQuery,
  StoreSort,
} from './types';

export const heroImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=70';

const categoryImageFallback =
  'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=70';

const iconBySlug: Record<string, LucideIcon> = {
  'son-elanlar': Package,
  'qida-ve-icki': Package,
  'geyim-ayaqqabi-ve-tekstil': Shirt,
  'elektronika-ve-aksesuarlar': Headphones,
  'meiset-texnikasi': WashingMachine,
  'ev-bag-ve-mebel': House,
  'tikinti-ve-temir': Wrench,
  'avto-neqliyyat-ve-ehtiyat-hisseleri': Car,
  'gozellik-saglamliq-ve-sexsi-qulluq': Shirt,
  'usaq-mehsullari': Baby,
  'qablasdirma-ve-reklam-mehsullari': Package,
  'biznes-ve-magaza-avadanligi': BriefcaseBusiness,
  'kend-teserrufati-ve-heyvandarliq': Package,
  'xidmetler-ve-b2b-heller': BriefcaseBusiness,
  neqliyyat: Car,
  elektronika: Headphones,
  'ev-ve-bag-ucun': House,
  'ehtiyat-hisseleri-ve-aksesuarlar': Wrench,
  'dasinmaz-emlak': Building2,
  'xidmetler-ve-biznes': BriefcaseBusiness,
  'sexsi-esyalar': Shirt,
  'hobbi-ve-asude': Watch,
  telefonlar: Smartphone,
  'usaq-alemi': Baby,
  heyvanlar: PawPrint,
  'is-elanlari': BriefcaseBusiness,
  'mektebliler-ucun': GraduationCap,
};

const fallbackCategoryTree: DefaultCategoryNode[] = [
  {
    slug: 'son-elanlar',
    name: 'Son elanlar',
    icon: 'layout-list',
    children: defaultCategoryTree as DefaultCategoryNode[],
  },
];

export const categories: CategoryCard[] = buildFallbackCategories(fallbackCategoryTree);

export const { products, stores } = createDemoCatalog({
  themedImage,
  heroImage,
  categoryImageFallback,
});

export async function getCategories(query?: {
  q?: string | undefined;
  rootsOnly?: boolean | undefined;
}): Promise<CategoryCard[]> {
  const fallback = filterCategories(categories, query);
  const response = await fetchCatalog<ApiListResponse<ApiCategory>>(
    `/categories${toQueryString({ q: query?.q })}`,
  );

  if (!response) {
    return fallbackAllowed() ? fallback : [];
  }

  const source = response?.data;

  if (!source?.length) {
    return [];
  }

  const root = source.find((category) => category.slug === 'son-elanlar');
  const mapped = source.map(mapCategory);
  const visible = query?.rootsOnly
    ? mapped.filter((category) => (root ? category.parentId === root.id : !category.parentId))
    : mapped;

  return visible.length ? visible : fallback;
}

export async function getCategory(slug: string): Promise<CategoryCard | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiCategory>>(
    `/categories/${encodeURIComponent(slug)}`,
  );
  if (response?.data) {
    return mapCategory(response.data);
  }
  return filterCategories(categories).find((category) => category.slug === slug) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPreview[]> {
  return (await getProductsPage(query)).items;
}

export async function getProductsPage(
  query: ProductQuery = {},
): Promise<CatalogPage<ProductPreview>> {
  const fallback = filterFallbackProducts({ ...query, limit: undefined });
  const response = await fetchCatalog<ApiListResponse<ApiProduct>>(
    `/products${toQueryString(query)}`,
  );
  if (!response) {
    const items = fallbackAllowed() ? fallback : [];
    return { items: items.slice(0, query.limit ?? items.length), meta: { total: items.length, nextCursor: null, isDemo: items.length > 0 } };
  }
  if (!response.data?.length) {
    return { items: [], meta: { total: response.meta?.total ?? 0, nextCursor: null } };
  }
  return {
    items: response.data.map(mapProduct),
    meta: {
      total: response.meta?.total ?? response.data.length,
      nextCursor: response.meta?.nextCursor ?? null,
    },
  };
}
export async function getProduct(slug: string): Promise<ProductPreview | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiProduct>>(
    `/products/${encodeURIComponent(slug)}`,
  );
  if (response?.data) {
    return mapProduct(response.data);
  }
  return fallbackAllowed() ? (products.find((product) => product.slug === slug) ?? null) : null;
}

export async function getStores(query: StoreQuery = {}): Promise<StorePreview[]> {
  return (await getStoresPage(query)).items;
}

export async function getStoresPage(query: StoreQuery = {}): Promise<CatalogPage<StorePreview>> {
  const fallback = filterFallbackStores({ ...query, limit: undefined });
  const response = await fetchCatalog<ApiListResponse<ApiStore>>(`/stores${toQueryString(query)}`);
  if (!response) {
    const items = fallbackAllowed() ? fallback : [];
    return {
      items: items.slice(0, query.limit ?? items.length),
      meta: {
        total: items.length, nextCursor: null, isDemo: items.length > 0,
        totalProducts: items.reduce((sum, store) => sum + Number(store.productCount), 0),
        verifiedStores: items.filter((store) => store.verified).length,
      },
    };
  }
  if (!response.data?.length) {
    return { items: [], meta: { total: response.meta?.total ?? 0, nextCursor: null } };
  }
  return {
    items: response.data.map(mapStore),
    meta: {
      total: response.meta?.total ?? response.data.length,
      nextCursor: response.meta?.nextCursor ?? null,
      ...(response.meta?.totalProducts !== undefined
        ? { totalProducts: response.meta.totalProducts }
        : {}),
      ...(response.meta?.verifiedStores !== undefined
        ? { verifiedStores: response.meta.verifiedStores }
        : {}),
      ...(response.meta?.totalViews !== undefined ? { totalViews: response.meta.totalViews } : {}),
    },
  };
}
export async function getStore(slug: string): Promise<StorePreview | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiStore>>(
    `/stores/${encodeURIComponent(slug)}`,
  );
  if (response?.data) {
    return mapStore(response.data);
  }
  return fallbackAllowed() ? (stores.find((store) => store.slug === slug) ?? null) : null;
}

async function fetchCatalog<T>(path: string): Promise<T | null> {
  if (!liveCatalogEnabled()) {
    return null;
  }

  try {
    return await apiGet<T>(path, { timeoutMs: 5000 });
  } catch {
    return null;
  }
}

/**
 * Demo kataloq yalnız NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== 'false' olduqda göstərilir.
 * Production-da canlı API üçün sənədləşdirilmiş parametr: NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false
 * (bax: docs/OPERATIONS_RUNBOOK.md və .env.example).
 */
function fallbackAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== 'false';
}

function liveCatalogEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_CATALOG === 'true';
}

function buildFallbackCategories(nodes: DefaultCategoryNode[], parentId?: string): CategoryCard[] {
  return nodes.flatMap((node) => {
    const category: CategoryCard = {
      id: node.slug,
      ...(parentId ? { parentId } : {}),
      slug: node.slug,
      name: node.name,
      productCount: '0',
      storeCount: '0',
      icon: resolveCategoryIcon(node.slug, node.icon),
      children: node.children?.map((child) => child.name) ?? [],
    };

    return [category, ...buildFallbackCategories(node.children ?? [], node.slug)];
  });
}

function mapCategory(category: ApiCategory): CategoryCard {
  return {
    id: category.id,
    parentId: category.parentId,
    slug: category.slug,
    name: category.name,
    productCount: formatCompactCount(category.productCount),
    storeCount: formatCompactCount(category.storeCount),
    icon: resolveCategoryIcon(category.slug, category.icon),
    children: category.children?.map((child) => child.name) ?? [],
    childCategories:
      category.children?.map((child) => ({ slug: child.slug, name: child.name })) ?? [],
  };
}

function mapProduct(product: ApiProduct): ProductPreview {
  const category = product.category ?? { slug: 'products', name: 'Məhsullar' };
  const store = product.store ?? {
    id: undefined,
    slug: 'store',
    name: 'TopdanBazar mağazası',
    city: 'Bakı',
    phone: undefined,
    whatsappNumber: undefined,
    email: undefined,
  };

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    store: store.name,
    storeSlug: store.slug,
    storeId: store.id,
    city: store.city ?? 'Azərbaycan',
    category: category.name,
    categorySlug: category.slug,
    price: normalizePriceLabel(product),
    minOrder: normalizeMinOrder(product),
    minOrderQuantity: product.minOrderQuantity,
    stockStatus: product.stockStatus,
    badge: normalizeStockBadge(product.stockStatus),
    imageUrl: resolveProductImage(product),
    imageAlt: product.images?.[0]?.altText ?? `${product.title} məhsul şəkli`,
    phone: store.phone,
    whatsappNumber: store.whatsappNumber,
    email: store.email,
  };
}

function mapStore(store: ApiStore): StorePreview {
  const category = store.category ?? { slug: 'stores', name: 'Topdansatış mağazası' };

  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    category: category.name,
    categorySlug: category.slug,
    productCount: formatCompactCount(store.productCount),
    city: store.city ?? 'Azərbaycan',
    views: store.viewCount ? formatCompactCount(store.viewCount) : 'Yeni',
    coverImageUrl: resolveStoreImage(store),
    description:
      store.description ??
      'Bu mağaza topdansatış məhsullarını alıcılarla birbaşa əlaqə modeli ilə təqdim edir.',
    verified: store.verified,
    phone: store.phone,
    whatsappNumber: store.whatsappNumber,
    email: store.email,
  };
}

function resolveCategoryIcon(slug: string, icon?: string | null): LucideIcon {
  const normalized = icon?.toLowerCase() ?? slug;
  if (
    normalized.includes('car') ||
    normalized.includes('truck') ||
    normalized.includes('transport')
  )
    return Car;
  if (normalized.includes('phone') || normalized.includes('smart')) return Smartphone;
  if (normalized.includes('home') || normalized.includes('house')) return House;
  if (normalized.includes('tool') || normalized.includes('wrench')) return Wrench;
  if (normalized.includes('building')) return Building2;
  if (normalized.includes('briefcase')) return BriefcaseBusiness;
  if (normalized.includes('shirt')) return Shirt;
  if (normalized.includes('headphone') || normalized.includes('audio')) return Headphones;
  if (normalized.includes('washing')) return WashingMachine;
  if (normalized.includes('baby')) return Baby;
  return iconBySlug[slug] ?? Package;
}

function resolveProductImage(product: ApiProduct): string {
  const firstImage = product.images?.[0];
  const variantUrl = getVariantUrl(firstImage?.variants);
  const rawUrl = firstImage?.cdnUrl ?? variantUrl;
  const resolvedUrl = resolveMediaUrl(rawUrl ?? firstImage?.storageKey);
  if (resolvedUrl) {
    return resolvedUrl;
  }
  return '/product-placeholder.svg';
}

/**
 * Kateqoriya açar sözlərinə görə mövzuya uyğun stock şəkil qaytarır —
 * şəkli olmayan məhsullar başqa kateqoriyanın şəklini göstərmir.
 */
function themedImage(): string {
  return '/product-placeholder.svg';
}

function resolveStoreImage(store: ApiStore): string {
  const candidate = store.bannerKey ?? store.logoKey;
  const resolvedUrl = resolveMediaUrl(candidate);
  if (resolvedUrl) {
    return resolvedUrl;
  }
  return '/store-placeholder.svg';
}

function resolveMediaUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  if (value.startsWith('http')) {
    return value;
  }

  const cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/+$/, '');
  return cdnBaseUrl ? `${cdnBaseUrl}/${value.replace(/^\/+/, '')}` : null;
}

function getVariantUrl(variants: unknown): string | null {
  if (!variants || typeof variants !== 'object') {
    return null;
  }

  const values = Object.values(variants as Record<string, unknown>);
  const direct = values.find(
    (value): value is string => typeof value === 'string' && value.startsWith('http'),
  );
  if (direct) {
    return direct;
  }

  for (const value of values) {
    if (value && typeof value === 'object') {
      const nested = Object.values(value as Record<string, unknown>).find(
        (nestedValue): nestedValue is string =>
          typeof nestedValue === 'string' && nestedValue.startsWith('http'),
      );
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function normalizePriceLabel(product: ApiProduct): string {
  if (product.priceLabel) {
    return product.priceLabel;
  }
  if (product.price) {
    return `${stripDecimalZero(product.price)} ${product.currency ?? 'AZN'}`;
  }
  return 'Razılaşma yolu ilə';
}

function normalizeMinOrder(product: ApiProduct): string {
  if (!product.minOrderQuantity) {
    return 'Min. razılaşma ilə';
  }
  const unit = product.unit ? unitLabel(product.unit) : 'ədəd';
  return `Min: ${stripDecimalZero(product.minOrderQuantity)} ${unit}`;
}

function unitLabel(unit: string): string {
  const labels: Record<string, string> = {
    PIECE: 'ədəd',
    BOX: 'qutu',
    KG: 'kq',
    TON: 'ton',
    METER: 'metr',
    PACKAGE: 'paket',
  };
  return labels[unit] ?? unit.toLowerCase();
}

function normalizeStockBadge(stockStatus?: string | null): string {
  switch (stockStatus) {
    case 'LOW_STOCK':
      return 'Az stok';
    case 'OUT_OF_STOCK':
      return 'Stokda yoxdur';
    case 'IN_STOCK':
      return 'Stokda var';
    default:
      return 'Yeni';
  }
}

function stripDecimalZero(value: string): string {
  return value.replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

function formatCompactCount(count: number): string {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}K+`;
  }
  return new Intl.NumberFormat('az-AZ').format(count);
}

function toQueryString(query: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  const value = params.toString();
  return value ? `?${value}` : '';
}

function filterCategories(
  source: CategoryCard[],
  query?: { q?: string | undefined; rootsOnly?: boolean | undefined },
): CategoryCard[] {
  const normalized = query?.q?.toLowerCase();
  const counted = applyFallbackCategoryCounts(source);
  return counted.filter((category) => {
    const matchesRoot = query?.rootsOnly ? category.parentId === 'son-elanlar' : true;
    const matchesSearch = normalized ? category.name.toLowerCase().includes(normalized) : true;
    return matchesRoot && matchesSearch;
  });
}

/**
 * Fallback kateqoriyalarında məhsul sayını mock kataloqdan hesablayır.
 * Say validdən yuxarı (valideyn kateqoriyalar) doğru yığılır.
 */
function applyFallbackCategoryCounts(source: CategoryCard[]): CategoryCard[] {
  const parentBySlug = new Map(source.map((category) => [category.slug, category.parentId]));
  const counts = new Map<string, number>();

  for (const product of products) {
    let slug: string | undefined = product.categorySlug;
    const visited = new Set<string>();
    while (slug && !visited.has(slug)) {
      visited.add(slug);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
      slug = parentBySlug.get(slug) ?? undefined;
    }
  }

  return source.map((category) => {
    const count = counts.get(category.slug) ?? 0;
    return count ? { ...category, productCount: formatCompactCount(count) } : category;
  });
}

function filterFallbackProducts(query: ProductQuery): ProductPreview[] {
  const filtered = products.filter((product) => {
    const matchesCategory = query.category ? product.categorySlug === query.category : true;
    const matchesStore = query.store ? product.storeSlug === query.store : true;
    const matchesCity = query.city ? product.city.toLowerCase() === query.city.toLowerCase() : true;
    const matchesSearch = query.q
      ? `${product.title} ${product.store} ${product.category}`
          .toLowerCase()
          .includes(query.q.toLowerCase())
      : true;
    const price = numericPrice(product.price);
    const minOrder = Number(
      product.minOrderQuantity ?? product.minOrder.match(/[\d.,]+/)?.[0]?.replace(',', '.') ?? 0,
    );
    const matchesPriceMin = query.priceMin !== undefined ? price >= query.priceMin : true;
    const matchesPriceMax = query.priceMax !== undefined ? price <= query.priceMax : true;
    const matchesMinOrder = query.minOrderMax !== undefined ? minOrder <= query.minOrderMax : true;
    const matchesStock = query.stock ? product.stockStatus === query.stock : true;
    return (
      matchesCategory &&
      matchesStore &&
      matchesCity &&
      matchesSearch &&
      matchesPriceMin &&
      matchesPriceMax &&
      matchesMinOrder &&
      matchesStock
    );
  });

  if (query.sort === 'price_asc' || query.sort === 'price_desc') {
    filtered.sort((left, right) => {
      const direction = query.sort === 'price_asc' ? 1 : -1;
      return (numericPrice(left.price) - numericPrice(right.price)) * direction;
    });
  }

  return filtered.slice(0, query.limit ?? filtered.length);
}

function filterFallbackStores(query: StoreQuery): StorePreview[] {
  const filtered = stores.filter((store) => {
    const matchesCategory = query.category ? store.categorySlug === query.category : true;
    const matchesCity = query.city ? store.city.toLowerCase() === query.city.toLowerCase() : true;
    const matchesSearch = query.q
      ? `${store.name} ${store.category}`.toLowerCase().includes(query.q.toLowerCase())
      : true;
    return matchesCategory && matchesCity && matchesSearch;
  });

  if (query.sort === 'products') {
    filtered.sort(
      (left, right) => compactNumber(right.productCount) - compactNumber(left.productCount),
    );
  } else if (query.sort === 'popular') {
    filtered.sort((left, right) => compactNumber(right.views) - compactNumber(left.views));
  }

  return filtered.slice(0, query.limit ?? filtered.length);
}

function numericPrice(value: string): number {
  const parsed = Number(value.replace(/[^\d.,]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function compactNumber(value: string): number {
  const normalized = value.trim().toUpperCase();
  const parsed = Number.parseFloat(normalized.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(parsed)) return 0;
  if (normalized.includes('K')) return parsed * 1_000;
  if (normalized.includes('M')) return parsed * 1_000_000;
  return parsed;
}
