import { apiDelete, apiGet, apiPatch, apiPost } from './api-client';

export type AuthRole = 'BUYER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';

export type AuthUser = {
  id: string;
  role: AuthRole;
  status: string;
  email?: string;
  phone?: string;
};

export type AuthSession =
  | { data: { authenticated: false } }
  | { data: { authenticated: true; user: AuthUser } };

export type LoginResponse = {
  authenticated: true;
  user: AuthUser;
};

export type SellerStore = {
  id: string;
  slug: string;
  name: string;
  legalName?: string | null;
  taxNumber?: string | null;
  description?: string | null;
  status: string;
  logoKey?: string | null;
  bannerKey?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  city: string;
  district?: string | null;
  address?: string | null;
  workingHours?: Record<string, unknown> | null;
  verified: boolean;
  productCount: number;
  category?: { id: string; slug: string; name: string } | null;
};

export type SellerProduct = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price?: string | null;
  priceType: 'FIXED' | 'NEGOTIABLE';
  priceLabel: string;
  currency: string;
  unit: string;
  minOrderQuantity?: string | null;
  stockStatus: string;
  status: ProductStatus;
  reviewNote?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  store: { id: string; slug: string; name: string };
  category?: { id: string; slug: string; name: string } | null;
  images: Array<{ id: string; cdnUrl?: string | null; status: string; sortOrder: number }>;
};

export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PASSIVE' | 'REJECTED' | 'DELETED';

export type SellerLead = {
  id: string;
  type: 'WHATSAPP_CLICK' | 'PHONE_REVEAL' | 'EMAIL_CLICK' | 'STORE_VIEW' | 'PRODUCT_VIEW';
  source?: string | null;
  createdAt: string;
  store: { id: string; slug: string; name: string };
  product?: { id: string; slug: string; title: string } | null;
};

export type SellerOverview = {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  draftProducts: number;
  whatsappClicksToday: number;
  storeViewsToday: number;
  stores: SellerStore[];
  recentLeads: SellerLead[];
  topProducts: Array<{
    id: string | null;
    title: string;
    slug: string | null;
    status: ProductStatus | null;
    leadCount: number;
    image?: { id: string; cdnUrl?: string | null; status: string; sortOrder: number } | null;
  }>;
};

export type SellerAnalytics = {
  range: '7d' | '30d' | '90d';
  totalLeads: number;
  leadCounts: {
    productViews: number;
    storeViews: number;
    whatsappClicks: number;
    phoneReveals: number;
    emailClicks: number;
  };
  productCounts: {
    draft: number;
    pendingReview: number;
    active: number;
    passive: number;
    rejected: number;
    deleted: number;
  };
};

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
};

export type ProductPayload = {
  storeId: string;
  categoryId?: string;
  title: string;
  description?: string;
  price?: number;
  priceType?: 'FIXED' | 'NEGOTIABLE';
  currency?: string;
  unit?: string;
  minOrderQuantity?: number;
  stockStatus?: string;
};

type ListResponse<T> = {
  data: T[];
  meta?: {
    total?: number;
    nextCursor?: string | null;
  };
};

type DetailResponse<T> = {
  data: T;
};

export function getSession() {
  return apiGet<AuthSession>('/auth/session');
}

export function login(identifier: string, password: string) {
  return apiPost<LoginResponse>('/auth/login', { identifier, password });
}

export function logout(allDevices = false) {
  return apiPost<{ data: { authenticated: false; revokedSessions?: number } }>(
    allDevices ? '/auth/logout-all' : '/auth/logout',
    {},
  );
}

export function getSellerOverview() {
  return apiGet<DetailResponse<SellerOverview>>('/seller/overview');
}

export function getSellerStores() {
  return apiGet<ListResponse<SellerStore>>('/seller/stores');
}

export function getSellerStore(id: string) {
  return apiGet<DetailResponse<SellerStore>>(`/seller/stores/${encodeURIComponent(id)}`);
}

export function updateSellerStore(id: string, payload: Partial<SellerStore>) {
  return apiPatch<DetailResponse<SellerStore>>(`/seller/stores/${encodeURIComponent(id)}`, payload);
}

export function getSellerProducts(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<SellerProduct>>(`/seller/products${toQueryString(params)}`);
}

export function getSellerProduct(id: string) {
  return apiGet<DetailResponse<SellerProduct>>(`/seller/products/${encodeURIComponent(id)}`);
}

export function createSellerProduct(payload: ProductPayload) {
  return apiPost<DetailResponse<SellerProduct>>('/seller/products', payload);
}

export function updateSellerProduct(id: string, payload: Partial<ProductPayload>) {
  const { storeId: _storeId, ...patch } = payload;
  return apiPatch<DetailResponse<SellerProduct>>(`/seller/products/${encodeURIComponent(id)}`, patch);
}

export function submitSellerProduct(id: string) {
  return apiPost<DetailResponse<SellerProduct>>(`/seller/products/${encodeURIComponent(id)}/submit-review`, {});
}

export function deleteSellerProduct(id: string) {
  return apiDelete<DetailResponse<{ id: string; status: ProductStatus }>>(`/seller/products/${encodeURIComponent(id)}`);
}

export function getSellerAnalytics(range: '7d' | '30d' | '90d' = '30d') {
  return apiGet<DetailResponse<SellerAnalytics>>(`/seller/analytics?range=${range}`);
}

export function getSellerLeads(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<SellerLead>>(`/seller/leads${toQueryString(params)}`);
}

export function getCategoryOptions() {
  return apiGet<ListResponse<CategoryOption>>('/categories');
}

export async function uploadProductImage(productId: string, file: File) {
  const upload = await apiPost<
    DetailResponse<{
      imageId: string;
      uploadUrl: string;
      headers: Record<string, string>;
      contentType: string;
      status: string;
    }>
  >('/media/upload-url', {
    productId,
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });

  await fetch(upload.data.uploadUrl, {
    method: 'PUT',
    headers: upload.data.headers,
    body: file,
  });

  return apiPost<DetailResponse<{ imageId: string; status: string }>>(
    `/media/product-images/${encodeURIComponent(upload.data.imageId)}/complete`,
    {},
  );
}

function toQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}
