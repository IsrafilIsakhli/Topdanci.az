import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Car,
  GraduationCap,
  Headphones,
  House,
  PawPrint,
  Package,
  Shirt,
  Smartphone,
  Store,
  Watch,
  WashingMachine,
  Wrench,
} from 'lucide-react';
import { apiGet } from './api-client';

export type CategoryCard = {
  id?: string;
  parentId?: string | null;
  slug: string;
  name: string;
  productCount: string;
  storeCount: string;
  icon: LucideIcon;
  children?: string[];
};

export type ProductPreview = {
  id?: string;
  slug: string;
  title: string;
  description?: string | null | undefined;
  store: string;
  storeSlug?: string | undefined;
  storeId?: string | undefined;
  city: string;
  category: string;
  categorySlug: string;
  price: string;
  minOrder: string;
  badge: string;
  imageUrl: string;
  imageAlt: string;
};

export type StorePreview = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  categorySlug?: string;
  productCount: string;
  city: string;
  views: string;
  coverImageUrl: string;
  description: string;
  verified: boolean;
};

type ApiListResponse<T> = {
  data: T[];
  meta?: {
    total?: number;
    nextCursor?: string | null;
  };
};

type ApiDetailResponse<T> = {
  data: T;
};

type ApiCategory = {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  children?: Array<{ id: string; slug: string; name: string }>;
  productCount: number;
  storeCount: number;
};

type ApiProduct = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price?: string | null;
  priceType?: string;
  priceLabel?: string | null;
  currency?: string | null;
  unit?: string | null;
  minOrderQuantity?: string | null;
  stockStatus?: string | null;
  category?: { slug: string; name: string } | null;
  store?: {
    id: string;
    slug: string;
    name: string;
    city?: string | null;
    district?: string | null;
    verified?: boolean;
  } | null;
  images?: Array<{
    id: string;
    cdnUrl?: string | null;
    storageKey?: string | null;
    altText?: string | null;
    variants?: unknown;
  }>;
};

type ApiStore = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoKey?: string | null;
  bannerKey?: string | null;
  city?: string | null;
  district?: string | null;
  verified: boolean;
  category?: { slug: string; name: string } | null;
  productCount: number;
};

type ProductQuery = {
  q?: string | undefined;
  category?: string | undefined;
  city?: string | undefined;
  store?: string | undefined;
  limit?: number;
};

type StoreQuery = {
  q?: string | undefined;
  category?: string | undefined;
  city?: string | undefined;
  limit?: number;
};

export const heroImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=82';

const categoryImageFallback =
  'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1400&q=82';

const productImageFallbacks = [
  'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=82',
] as const;

const iconBySlug: Record<string, LucideIcon> = {
  neqliyyat: Car,
  elektronika: Headphones,
  'ev-ve-bag-ucun': House,
  'ehtiyat-hisseleri-ve-aksesuarlar': Wrench,
  'dasinmaz-emlak': Building2,
  'xidmetler-ve-biznes': BriefcaseBusiness,
  'sexsi-esyalar': Shirt,
  'hobbi-ve-asude': Watch,
  'meiset-texnikasi': WashingMachine,
  telefonlar: Smartphone,
  'usaq-alemi': Baby,
  heyvanlar: PawPrint,
  'is-elanlari': BriefcaseBusiness,
  'mektebliler-ucun': GraduationCap,
};

export const categories: CategoryCard[] = [
  {
    slug: 'neqliyyat',
    name: 'Nəqliyyat',
    productCount: '28K+',
    storeCount: '210',
    icon: Car,
    children: [
      'Ehtiyat hissələri və aksesuarlar',
      'Avtomobillər',
      'Tikinti texnikası',
      'Motosikletlər və mopedlər',
      'Yük maşınları və qoşqular',
      'Qeydiyyat nişanları',
      'Aqrotexnika',
      'Su nəqliyyatı',
      'Avtobuslar',
    ],
  },
  {
    slug: 'elektronika',
    name: 'Elektronika',
    productCount: '50K+',
    storeCount: '150',
    icon: Headphones,
    children: [
      'Telefonlar',
      'Audio və video',
      'Noutbuklar və netbuklar',
      'Komponentlər və monitorlar',
      'Kompüter aksesuarları',
      'Oyunlar, pultlar və proqramlar',
      'Televizorlar və aksesuarlar',
      'Şəbəkə və server avadanlığı',
      'Nömrələr və SIM-kartlar',
      'Ofis avadanlığı və istehlak materialları',
      'Fototexnika',
      'Planşet və elektron kitablar',
      'Smart saat və qolbaqlar',
      'Masaüstü kompüterlər',
    ],
  },
  {
    slug: 'ev-ve-bag-ucun',
    name: 'Ev və bağ üçün',
    productCount: '46K+',
    storeCount: '180',
    icon: House,
    children: [
      'Məişət texnikası',
      'Mebellər',
      'Təmir və tikinti',
      'Qab-qacaq və mətbəx ləvazimatları',
      'Dekor və interyer',
      'Bağ və bostan',
      'Ev və bağ üçün işıqlandırma',
      'Ev tekstili',
      'Bitkilər',
      'Xalçalar və aksesuarlar',
      'Ev təsərrüfatı malları',
      'Ərzaq',
    ],
  },
  {
    slug: 'ehtiyat-hisseleri-ve-aksesuarlar',
    name: 'Ehtiyat hissələri və aksesuarlar',
    productCount: '18K+',
    storeCount: '95',
    icon: Wrench,
  },
  {
    slug: 'dasinmaz-emlak',
    name: 'Daşınmaz əmlak',
    productCount: '12K+',
    storeCount: '80',
    icon: Building2,
    children: ['Mənzillər', 'Həyət evləri, bağ evləri', 'Torpaq', 'Obyektlər və ofislər', 'Qarajlar', 'Xaricdə əmlak'],
  },
  {
    slug: 'xidmetler-ve-biznes',
    name: 'Xidmətlər və biznes',
    productCount: '34K+',
    storeCount: '260',
    icon: BriefcaseBusiness,
    children: [
      'Biznes üçün avadanlıq',
      'Təhlükəsizlik sistemləri',
      'Təmir və tikinti',
      'Texnika təmiri',
      'Nəqliyyat vasitələrinin icarəsi',
      'Avadanlığın icarəsi',
      'Reklam, dizayn və poliqrafiya',
      'Logistika',
      'Təlim, hazırlıq kursları',
      'IT, internet, telekom',
      'Digər',
    ],
  },
  {
    slug: 'sexsi-esyalar',
    name: 'Şəxsi əşyalar',
    productCount: '38K+',
    storeCount: '170',
    icon: Shirt,
    children: [
      'Geyim və ayaqqabılar',
      'Sağlamlıq və gözəllik',
      'Saat və zinət əşyaları',
      'Aksesuarlar',
      'Tütün qızdırıcıları və aksesuarları',
      'İtmiş əşyalar',
    ],
  },
  {
    slug: 'hobbi-ve-asude',
    name: 'Hobbi və asudə',
    productCount: '16K+',
    storeCount: '90',
    icon: Watch,
    children: [
      'İdman və asudə',
      'Velosipedlər',
      'Kolleksiyalar',
      'Musiqi alətləri',
      'Kitab və jurnallar',
      'Kempinq, ovçuluq və balıqçılıq',
    ],
  },
  { slug: 'meiset-texnikasi', name: 'Məişət texnikası', productCount: '22K+', storeCount: '120', icon: WashingMachine },
  { slug: 'telefonlar', name: 'Telefonlar', productCount: '30K+', storeCount: '140', icon: Smartphone },
  { slug: 'usaq-alemi', name: 'Uşaq aləmi', productCount: '20K+', storeCount: '110', icon: Baby },
  { slug: 'heyvanlar', name: 'Heyvanlar', productCount: '11K+', storeCount: '70', icon: PawPrint },
  { slug: 'is-elanlari', name: 'İş elanları', productCount: '9K+', storeCount: '60', icon: BriefcaseBusiness },
  { slug: 'mektebliler-ucun', name: 'Məktəblilər üçün', productCount: '7K+', storeCount: '45', icon: GraduationCap },
];

export const products: ProductPreview[] = [
  {
    slug: 'kis-qis-godekceleri-model-402',
    title: 'Kişi qış gödəkçələri Model 402',
    store: 'Baku Tekstil MMC',
    storeSlug: 'baku-tekstil-mmc',
    city: 'Bakı',
    category: 'Geyim və Tekstil',
    categorySlug: 'sexsi-esyalar',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 50 ədəd',
    badge: 'Yeni',
    imageUrl: productImageFallbacks[0],
    imageAlt: 'Topdansatış geyim məhsulları',
  },
  {
    slug: 'qadin-deri-cekmeleri-stok-500-cut',
    title: 'Qadın dəri çəkmələri Stok 500 cüt',
    store: 'Shoes Import Trade',
    storeSlug: 'shoes-import-trade',
    city: 'Sumqayıt',
    category: 'Ayaqqabı',
    categorySlug: 'sexsi-esyalar',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 100 cüt',
    badge: 'Stokda var',
    imageUrl: productImageFallbacks[1],
    imageAlt: 'Topdansatış ayaqqabı məhsulları',
  },
  {
    slug: 'agilli-saatlar-x-series',
    title: 'Ağıllı saatlar X-Series Minimum sifariş 50',
    store: 'TechWholesale AZ',
    storeSlug: 'techwholesale-az',
    city: 'Bakı',
    category: 'Elektronika',
    categorySlug: 'elektronika',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 50 ədəd',
    badge: 'Top seller',
    imageUrl: productImageFallbacks[2],
    imageAlt: 'Topdansatış ağıllı saat məhsulları',
  },
  {
    slug: 'akkumulyatorlu-drel-desti',
    title: 'Akkumulyatorlu drel dəsti Topdan satış',
    store: 'Mega İnşaat Supply',
    storeSlug: 'mega-insaat-supply',
    city: 'Gəncə',
    category: 'İnşaat materialları',
    categorySlug: 'ev-ve-bag-ucun',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 20 ədəd',
    badge: 'Yeni partiya',
    imageUrl: productImageFallbacks[3],
    imageAlt: 'Topdansatış elektrik alətləri',
  },
];

export const stores: StorePreview[] = [
  {
    slug: 'baku-tekstil-mmc',
    name: 'Baku Tekstil MMC',
    category: 'Geyim və Tekstil',
    categorySlug: 'sexsi-esyalar',
    productCount: '1,250+',
    city: 'Bakı',
    views: '12.5K',
    coverImageUrl: heroImage,
    description:
      'Baku Tekstil MMC Azərbaycanda topdansatış geyim və tekstil məhsulları üzrə işləyən yoxlanılmış təchizatçılardan biridir. Mağaza alıcılarla birbaşa WhatsApp və telefon üzərindən əlaqə saxlayır.',
    verified: true,
  },
  {
    slug: 'shoes-import-trade',
    name: 'Shoes Import Trade',
    category: 'Ayaqqabı və dəri məmulatları',
    categorySlug: 'sexsi-esyalar',
    productCount: '840+',
    city: 'Sumqayıt',
    views: '8.2K',
    coverImageUrl: categoryImageFallback,
    description:
      'Shoes Import Trade topdan ayaqqabı və dəri məmulatları təklif edir. Satıcı ilə qiymət, minimum sifariş və çatdırılma şərtləri platformadan kənar razılaşdırılır.',
    verified: true,
  },
  {
    slug: 'techwholesale-az',
    name: 'TechWholesale AZ',
    category: 'Elektronika və aksesuarlar',
    categorySlug: 'elektronika',
    productCount: '3,100+',
    city: 'Bakı',
    views: '21.4K',
    coverImageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2200&q=82',
    description:
      'TechWholesale AZ elektronika və aksesuarların topdansatış təchizatı üçün biznes alıcılarla işləyir. Məhsul sorğuları birbaşa mağaza nümayəndəsinə yönləndirilir.',
    verified: true,
  },
];

export const stats = [
  { label: 'təsdiqlənmiş mağaza', value: '400+', icon: Store },
  { label: 'aktiv məhsul', value: '200K+', icon: Package },
  { label: 'birbaşa əlaqə', value: '24/7', icon: BriefcaseBusiness },
  { label: 'yoxlanılmış satıcı', value: '100%', icon: BadgeCheck },
];

export async function getCategories(query?: { q?: string | undefined; rootsOnly?: boolean }): Promise<CategoryCard[]> {
  const response = await fetchCatalog<ApiListResponse<ApiCategory>>(`/categories${toQueryString({ q: query?.q })}`);
  const mapped = response?.data.map(mapCategory) ?? categories;
  return query?.rootsOnly ? mapped.filter((category) => !category.parentId) : mapped;
}

export async function getCategory(slug: string): Promise<CategoryCard | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiCategory>>(`/categories/${encodeURIComponent(slug)}`);
  if (response?.data) {
    return mapCategory(response.data);
  }
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPreview[]> {
  const response = await fetchCatalog<ApiListResponse<ApiProduct>>(`/products${toQueryString(query)}`);
  if (!response?.data) {
    return filterFallbackProducts(query);
  }
  return response.data.map(mapProduct);
}

export async function getProduct(slug: string): Promise<ProductPreview | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiProduct>>(`/products/${encodeURIComponent(slug)}`);
  if (response?.data) {
    return mapProduct(response.data);
  }
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getStores(query: StoreQuery = {}): Promise<StorePreview[]> {
  const response = await fetchCatalog<ApiListResponse<ApiStore>>(`/stores${toQueryString(query)}`);
  if (!response?.data) {
    return filterFallbackStores(query);
  }
  return response.data.map(mapStore);
}

export async function getStore(slug: string): Promise<StorePreview | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiStore>>(`/stores/${encodeURIComponent(slug)}`);
  if (response?.data) {
    return mapStore(response.data);
  }
  return stores.find((store) => store.slug === slug) ?? null;
}

async function fetchCatalog<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path, { timeoutMs: 5000 });
  } catch {
    return null;
  }
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
  };
}

function mapProduct(product: ApiProduct, index = 0): ProductPreview {
  const category = product.category ?? { slug: 'products', name: 'Məhsullar' };
  const store = product.store ?? { id: undefined, slug: 'store', name: 'TopdanBazar mağazası', city: 'Bakı' };
  const imageUrl = resolveProductImage(product, index);

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
    badge: normalizeStockBadge(product.stockStatus),
    imageUrl,
    imageAlt: product.images?.[0]?.altText ?? `${product.title} məhsul şəkli`,
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
    views: 'Yeni',
    coverImageUrl: resolveStoreImage(store),
    description: store.description ?? 'Bu mağaza topdansatış məhsullarını alıcılarla birbaşa əlaqə modeli ilə təqdim edir.',
    verified: store.verified,
  };
}

function resolveCategoryIcon(slug: string, icon?: string | null): LucideIcon {
  const normalized = icon?.toLowerCase() ?? slug;
  if (normalized.includes('car') || normalized.includes('transport')) return Car;
  if (normalized.includes('phone') || normalized.includes('smart')) return Smartphone;
  if (normalized.includes('home') || normalized.includes('house')) return House;
  if (normalized.includes('tool') || normalized.includes('wrench')) return Wrench;
  if (normalized.includes('store')) return Store;
  return iconBySlug[slug] ?? Package;
}

function resolveProductImage(product: ApiProduct, index: number): string {
  const firstImage = product.images?.[0];
  const variantUrl = getVariantUrl(firstImage?.variants);
  const rawUrl = firstImage?.cdnUrl ?? variantUrl;
  if (rawUrl?.startsWith('http')) {
    return rawUrl;
  }
  return productImageFallbacks[index % productImageFallbacks.length] ?? heroImage;
}

function resolveStoreImage(store: ApiStore): string {
  const candidate = store.bannerKey ?? store.logoKey;
  if (candidate?.startsWith('http')) {
    return candidate;
  }
  return store.category?.slug === 'elektronika' ? categoryImageFallback : heroImage;
}

function getVariantUrl(variants: unknown): string | null {
  if (!variants || typeof variants !== 'object') {
    return null;
  }
  const values = Object.values(variants as Record<string, unknown>);
  const direct = values.find((value): value is string => typeof value === 'string' && value.startsWith('http'));
  if (direct) {
    return direct;
  }
  for (const value of values) {
    if (value && typeof value === 'object') {
      const nested = Object.values(value as Record<string, unknown>).find(
        (nestedValue): nestedValue is string => typeof nestedValue === 'string' && nestedValue.startsWith('http'),
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
  const unit = product.unit?.toLowerCase() ?? 'ədəd';
  return `Min: ${stripDecimalZero(product.minOrderQuantity)} ${unit}`;
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

function toQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  const value = params.toString();
  return value ? `?${value}` : '';
}

function filterFallbackProducts(query: ProductQuery): ProductPreview[] {
  return products.filter((product) => {
    const matchesCategory = query.category ? product.categorySlug === query.category : true;
    const matchesStore = query.store ? product.storeSlug === query.store : true;
    const matchesCity = query.city ? product.city.toLowerCase() === query.city.toLowerCase() : true;
    const matchesSearch = query.q
      ? `${product.title} ${product.store} ${product.category}`.toLowerCase().includes(query.q.toLowerCase())
      : true;
    return matchesCategory && matchesStore && matchesCity && matchesSearch;
  });
}

function filterFallbackStores(query: StoreQuery): StorePreview[] {
  return stores.filter((store) => {
    const matchesCategory = query.category ? store.categorySlug === query.category : true;
    const matchesCity = query.city ? store.city.toLowerCase() === query.city.toLowerCase() : true;
    const matchesSearch = query.q ? `${store.name} ${store.category}`.toLowerCase().includes(query.q.toLowerCase()) : true;
    return matchesCategory && matchesCity && matchesSearch;
  });
}
