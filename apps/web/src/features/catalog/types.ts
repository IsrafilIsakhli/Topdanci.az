import type { LucideIcon } from 'lucide-react';

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
  priceTiers?: Array<{ qty: string; price: string }> | undefined;
  minOrder: string;
  minOrderQuantity?: string | null | undefined;
  stockStatus?: string | null | undefined;
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

export type ApiListResponse<T> = {
  data: T[];
  meta?: {
    total?: number;
    nextCursor?: string | null;
    totalProducts?: number;
    verifiedStores?: number;
    totalViews?: number;
  };
};

export type ApiDetailResponse<T> = {
  data: T;
};

export type ApiCategory = {
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

export type ApiProduct = {
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

export type ApiStore = {
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
  viewCount?: number;
};

export type ProductSort = 'newest' | 'popular' | 'price_asc' | 'price_desc';
export type StoreSort = 'newest' | 'popular' | 'products';

export type ProductQuery = {
  q?: string | undefined;
  category?: string | undefined;
  city?: string | undefined;
  store?: string | undefined;
  limit?: number | undefined;
  cursor?: string | undefined;
  sort?: ProductSort | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  minOrderMax?: number | undefined;
  verified?: boolean | undefined;
  stock?: 'IN_STOCK' | 'LIMITED' | 'OUT_OF_STOCK' | undefined;
};

export type StoreQuery = {
  q?: string | undefined;
  category?: string | undefined;
  city?: string | undefined;
  limit?: number | undefined;
  cursor?: string | undefined;
  sort?: StoreSort | undefined;
};

export type CatalogPage<T> = {
  items: T[];
  meta: {
    isDemo?: boolean;
    total: number;
    nextCursor: string | null;
    totalProducts?: number;
    verifiedStores?: number;
    totalViews?: number;
  };
};
