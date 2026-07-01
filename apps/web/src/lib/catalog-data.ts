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
  Package,
  PawPrint,
  Shirt,
  Smartphone,
  Store,
  Watch,
  WashingMachine,
  Wrench,
} from 'lucide-react';
import { defaultCategories as defaultCategoryTree, type DefaultCategoryNode } from '@topdanbazar/shared';
import { apiGet } from './api-client';

export type CategoryChild = {
  slug: string;
  name: string;
};

export type CategoryCard = {
  id?: string | undefined;
  parentId?: string | null | undefined;
  slug: string;
  name: string;
  productCount: string;
  storeCount: string;
  icon: LucideIcon;
  children?: string[] | undefined;
  childCategories?: CategoryChild[] | undefined;
};

export type ProductPreview = {
  id?: string | undefined;
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
  phone?: string | null | undefined;
  whatsappNumber?: string | null | undefined;
  email?: string | null | undefined;
};

export type StorePreview = {
  id?: string | undefined;
  slug: string;
  name: string;
  category: string;
  categorySlug?: string | undefined;
  productCount: string;
  city: string;
  views: string;
  coverImageUrl: string;
  description: string;
  verified: boolean;
  phone?: string | null | undefined;
  whatsappNumber?: string | null | undefined;
  email?: string | null | undefined;
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
    phone?: string | null;
    whatsappNumber?: string | null;
    email?: string | null;
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
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
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
  limit?: number | undefined;
};

type StoreQuery = {
  q?: string | undefined;
  category?: string | undefined;
  city?: string | undefined;
  limit?: number | undefined;
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

export const products: ProductPreview[] = [
  {
    slug: 'kis-qis-godekceleri-model-402',
    title: 'Kişi qış gödəkçələri Model 402',
    store: 'Baku Tekstil MMC',
    storeSlug: 'baku-tekstil-mmc',
    city: 'Bakı',
    category: 'Geyim və Tekstil',
    categorySlug: 'geyim-ayaqqabi-ve-tekstil',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 50 ədəd',
    badge: 'Yeni',
    imageUrl: productImageFallbacks[0],
    imageAlt: 'Topdansatış geyim məhsulları',
    whatsappNumber: '+994501234567',
    phone: '+994501234567',
  },
  {
    slug: 'qadin-deri-cekmeleri-stok-500-cut',
    title: 'Qadın dəri çəkmələri Stok 500 cüt',
    store: 'Shoes Import Trade',
    storeSlug: 'shoes-import-trade',
    city: 'Sumqayıt',
    category: 'Ayaqqabı',
    categorySlug: 'geyim-ayaqqabi-ve-tekstil',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 100 cüt',
    badge: 'Stokda var',
    imageUrl: productImageFallbacks[1],
    imageAlt: 'Topdansatış ayaqqabı məhsulları',
    whatsappNumber: '+994552223344',
    phone: '+994552223344',
  },
  {
    slug: 'agilli-saatlar-x-series',
    title: 'Ağıllı saatlar X-Series Minimum sifariş 50',
    store: 'TechWholesale AZ',
    storeSlug: 'techwholesale-az',
    city: 'Bakı',
    category: 'Elektronika',
    categorySlug: 'elektronika-ve-aksesuarlar',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 50 ədəd',
    badge: 'Top seller',
    imageUrl: productImageFallbacks[2],
    imageAlt: 'Topdansatış ağıllı saat məhsulları',
    whatsappNumber: '+994551112233',
    phone: '+994551112233',
  },
  {
    slug: 'akkumulyatorlu-drel-desti',
    title: 'Akkumulyatorlu drel dəsti Topdan satış',
    store: 'Mega İnşaat Supply',
    storeSlug: 'mega-insaat-supply',
    city: 'Gəncə',
    category: 'Təmir və tikinti',
    categorySlug: 'tikinti-ve-temir',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 20 ədəd',
    badge: 'Yeni partiya',
    imageUrl: productImageFallbacks[3],
    imageAlt: 'Topdansatış elektrik alətləri',
    whatsappNumber: '+994703334455',
    phone: '+994703334455',
  },
];

export const stores: StorePreview[] = [
  {
    slug: 'baku-tekstil-mmc',
    name: 'Baku Tekstil MMC',
    category: 'Geyim və Tekstil',
    categorySlug: 'geyim-ayaqqabi-ve-tekstil',
    productCount: '1,250+',
    city: 'Bakı',
    views: '12.5K',
    coverImageUrl: heroImage,
    description: 'Baku Tekstil MMC Azərbaycanda topdansatış geyim və tekstil məhsulları üzrə işləyən yoxlanılmış təchizatçılardan biridir.',
    verified: true,
    phone: '+994501234567',
    whatsappNumber: '+994501234567',
  },
  {
    slug: 'shoes-import-trade',
    name: 'Shoes Import Trade',
    category: 'Ayaqqabı və dəri məmulatları',
    categorySlug: 'geyim-ayaqqabi-ve-tekstil',
    productCount: '840+',
    city: 'Sumqayıt',
    views: '8.2K',
    coverImageUrl: categoryImageFallback,
    description: 'Shoes Import Trade topdan ayaqqabı və dəri məmulatları təklif edir.',
    verified: true,
    phone: '+994552223344',
    whatsappNumber: '+994552223344',
  },
  {
    slug: 'techwholesale-az',
    name: 'TechWholesale AZ',
    category: 'Elektronika və aksesuarlar',
    categorySlug: 'elektronika-ve-aksesuarlar',
    productCount: '3,100+',
    city: 'Bakı',
    views: '21.4K',
    coverImageUrl: categoryImageFallback,
    description: 'TechWholesale AZ elektronika və aksesuarların topdansatış təchizatı üçün biznes alıcılarla işləyir.',
    verified: true,
    phone: '+994551112233',
    whatsappNumber: '+994551112233',
  },
];

stores.push(
  {
    slug: 'absheron-food-supply',
    name: 'Absheron Food Supply',
    category: 'Qida və içki',
    categorySlug: 'qida-ve-icki',
    productCount: '4',
    city: 'Bakı',
    views: 'Yeni',
    coverImageUrl: categoryImageFallback,
    description: 'Market, restoran və kafe şəbəkələri üçün qida və içki topdan satışı.',
    verified: true,
    phone: '+994502101010',
    whatsappNumber: '+994502101010',
  },
  {
    slug: 'caspian-electro-hub',
    name: 'Caspian Electro Hub',
    category: 'Elektronika və aksesuarlar',
    categorySlug: 'elektronika-ve-aksesuarlar',
    productCount: '4',
    city: 'Bakı',
    views: 'Yeni',
    coverImageUrl: categoryImageFallback,
    description: 'Telefon aksesuarları, smart cihazlar və ofis texnikası üzrə topdan təklif.',
    verified: true,
    phone: '+994552202020',
    whatsappNumber: '+994552202020',
  },
  {
    slug: 'probuild-materials',
    name: 'ProBuild Materials',
    category: 'Tikinti və təmir',
    categorySlug: 'tikinti-ve-temir',
    productCount: '4',
    city: 'Gəncə',
    views: 'Yeni',
    coverImageUrl: heroImage,
    description: 'Tikinti briqadaları və obyektlər üçün material, boya və elektrik ləvazimatları.',
    verified: true,
    phone: '+994773404040',
    whatsappNumber: '+994773404040',
  },
  {
    slug: 'packline-print',
    name: 'PackLine Print',
    category: 'Qablaşdırma və reklam məhsulları',
    categorySlug: 'qablasdirma-ve-reklam-mehsullari',
    productCount: '4',
    city: 'Bakı',
    views: 'Yeni',
    coverImageUrl: categoryImageFallback,
    description: 'Brendli qablaşdırma, promo məhsullar və çap xidmətləri.',
    verified: true,
    phone: '+994508808080',
    whatsappNumber: '+994508808080',
  },
  {
    slug: 'agroline-b2b',
    name: 'AgroLine B2B',
    category: 'Kənd təsərrüfatı və heyvandarlıq',
    categorySlug: 'kend-teserrufati-ve-heyvandarliq',
    productCount: '4',
    city: 'Mingəçevir',
    views: 'Yeni',
    coverImageUrl: heroImage,
    description: 'Fermerlər və təsərrüfatlar üçün toxum, gübrə, yem və avadanlıq.',
    verified: true,
    phone: '+994559909090',
    whatsappNumber: '+994559909090',
  },
);

products.push(
  {
    slug: 'premium-un-50kg-paleti',
    title: 'Premium un 50 kq palet',
    store: 'Absheron Food Supply',
    storeSlug: 'absheron-food-supply',
    city: 'Bakı',
    category: 'Un, şəkər və duz',
    categorySlug: 'un-seker-ve-duz',
    price: '32 AZN',
    minOrder: 'Min: 20 paket',
    badge: 'Stokda var',
    imageUrl: productImageFallbacks[0],
    imageAlt: 'Topdan ərzaq məhsulu',
    whatsappNumber: '+994502101010',
    phone: '+994502101010',
  },
  {
    slug: 'qazli-icki-mix-24-lu-qutu',
    title: 'Qazlı içki mix 24-lü qutu',
    store: 'Absheron Food Supply',
    storeSlug: 'absheron-food-supply',
    city: 'Bakı',
    category: 'Şirələr və qazlı içkilər',
    categorySlug: 'sireler-ve-qazli-ickiler',
    price: '18.40 AZN',
    minOrder: 'Min: 30 qutu',
    badge: 'Yeni',
    imageUrl: productImageFallbacks[1],
    imageAlt: 'Topdan içki məhsulu',
    whatsappNumber: '+994502101010',
    phone: '+994502101010',
  },
  {
    slug: 'usb-c-kabel-100-ededlik-paket',
    title: 'USB-C kabel 100 ədədlik paket',
    store: 'Caspian Electro Hub',
    storeSlug: 'caspian-electro-hub',
    city: 'Bakı',
    category: 'Adapter və kabellər',
    categorySlug: 'adapter-ve-kabeller',
    price: '145 AZN',
    minOrder: 'Min: 5 paket',
    badge: 'Top seller',
    imageUrl: productImageFallbacks[2],
    imageAlt: 'Topdan elektronika aksesuarı',
    whatsappNumber: '+994552202020',
    phone: '+994552202020',
  },
  {
    slug: 'powerbank-10000mah-topdan-partiya',
    title: 'Powerbank 10000mAh topdan partiya',
    store: 'Caspian Electro Hub',
    storeSlug: 'caspian-electro-hub',
    city: 'Bakı',
    category: 'Powerbanklar',
    categorySlug: 'powerbanklar',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 50 ədəd',
    badge: 'Stokda var',
    imageUrl: productImageFallbacks[3],
    imageAlt: 'Topdan powerbank məhsulu',
    whatsappNumber: '+994552202020',
    phone: '+994552202020',
  },
  {
    slug: 'sement-m500-50kg-topdan',
    title: 'Sement M500 50 kq topdan',
    store: 'ProBuild Materials',
    storeSlug: 'probuild-materials',
    city: 'Gəncə',
    category: 'Sement və qum',
    categorySlug: 'sement-ve-qum',
    price: '9.20 AZN',
    minOrder: 'Min: 120 ədəd',
    badge: 'Stokda var',
    imageUrl: productImageFallbacks[0],
    imageAlt: 'Topdan tikinti materialı',
    whatsappNumber: '+994773404040',
    phone: '+994773404040',
  },
  {
    slug: 'karton-qutu-40x30x30-500-eded',
    title: 'Karton qutu 40x30x30 500 ədəd',
    store: 'PackLine Print',
    storeSlug: 'packline-print',
    city: 'Bakı',
    category: 'Karton qutular',
    categorySlug: 'karton-qutular',
    price: '0.72 AZN',
    minOrder: 'Min: 500 ədəd',
    badge: 'Yeni',
    imageUrl: productImageFallbacks[1],
    imageAlt: 'Topdan qablaşdırma məhsulu',
    whatsappNumber: '+994508808080',
    phone: '+994508808080',
  },
  {
    slug: 'mineral-gubre-25kg-topdan',
    title: 'Mineral gübrə 25 kq topdan',
    store: 'AgroLine B2B',
    storeSlug: 'agroline-b2b',
    city: 'Mingəçevir',
    category: 'Mineral gübrələr',
    categorySlug: 'mineral-gubreler',
    price: '17.50 AZN',
    minOrder: 'Min: 80 ədəd',
    badge: 'Stokda var',
    imageUrl: productImageFallbacks[2],
    imageAlt: 'Topdan kənd təsərrüfatı məhsulu',
    whatsappNumber: '+994559909090',
    phone: '+994559909090',
  },
);
export const stats = [
  { label: 'təsdiqlənmiş mağaza', value: '400+', icon: Store },
  { label: 'aktiv məhsul', value: '200K+', icon: Package },
  { label: 'birbaşa əlaqə', value: '24/7', icon: BriefcaseBusiness },
  { label: 'yoxlanılmış satıcı', value: '100%', icon: BadgeCheck },
];

export async function getCategories(query?: { q?: string | undefined; rootsOnly?: boolean | undefined }): Promise<CategoryCard[]> {
  const fallback = filterCategories(categories, query);
  const response = await fetchCatalog<ApiListResponse<ApiCategory>>(`/categories${toQueryString({ q: query?.q })}`);
  const source = response?.data;

  if (!source?.length) {
    return fallback;
  }

  const root = source.find((category) => category.slug === 'son-elanlar');
  const mapped = source.map(mapCategory);
  const visible = query?.rootsOnly ? mapped.filter((category) => (root ? category.parentId === root.id : !category.parentId)) : mapped;

  return visible.length ? visible : fallback;
}

export async function getCategory(slug: string): Promise<CategoryCard | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiCategory>>(`/categories/${encodeURIComponent(slug)}`);
  if (response?.data) {
    return mapCategory(response.data);
  }
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPreview[]> {
  const fallback = filterFallbackProducts(query);
  const response = await fetchCatalog<ApiListResponse<ApiProduct>>(`/products${toQueryString(query)}`);
  if (!response?.data?.length) {
    return fallback;
  }
  return response.data.map(mapProduct);
}
export async function getProduct(slug: string): Promise<ProductPreview | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiProduct>>(`/products/${encodeURIComponent(slug)}`);
  if (response?.data) {
    return mapProduct(response.data, 0);
  }
  return fallbackAllowed() ? products.find((product) => product.slug === slug) ?? null : null;
}

export async function getStores(query: StoreQuery = {}): Promise<StorePreview[]> {
  const fallback = filterFallbackStores(query);
  const response = await fetchCatalog<ApiListResponse<ApiStore>>(`/stores${toQueryString(query)}`);
  if (!response?.data?.length) {
    return fallback;
  }
  return response.data.map(mapStore);
}
export async function getStore(slug: string): Promise<StorePreview | null> {
  const response = await fetchCatalog<ApiDetailResponse<ApiStore>>(`/stores/${encodeURIComponent(slug)}`);
  if (response?.data) {
    return mapStore(response.data);
  }
  return fallbackAllowed() ? stores.find((store) => store.slug === slug) ?? null : null;
}

async function fetchCatalog<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path, { timeoutMs: 5000 });
  } catch {
    return null;
  }
}

function fallbackAllowed(): boolean {
  return true;
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
    childCategories: category.children?.map((child) => ({ slug: child.slug, name: child.name })) ?? [],
  };
}

function mapProduct(product: ApiProduct, index: number): ProductPreview {
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
    badge: normalizeStockBadge(product.stockStatus),
    imageUrl: resolveProductImage(product, index),
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
    views: 'Yeni',
    coverImageUrl: resolveStoreImage(store),
    description: store.description ?? 'Bu mağaza topdansatış məhsullarını alıcılarla birbaşa əlaqə modeli ilə təqdim edir.',
    verified: store.verified,
    phone: store.phone,
    whatsappNumber: store.whatsappNumber,
    email: store.email,
  };
}

function resolveCategoryIcon(slug: string, icon?: string | null): LucideIcon {
  const normalized = icon?.toLowerCase() ?? slug;
  if (normalized.includes('car') || normalized.includes('truck') || normalized.includes('transport')) return Car;
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

function filterCategories(source: CategoryCard[], query?: { q?: string | undefined; rootsOnly?: boolean | undefined }): CategoryCard[] {
  const normalized = query?.q?.toLowerCase();
  return source.filter((category) => {
    const matchesRoot = query?.rootsOnly ? category.parentId === 'son-elanlar' : true;
    const matchesSearch = normalized ? category.name.toLowerCase().includes(normalized) : true;
    return matchesRoot && matchesSearch;
  });
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

