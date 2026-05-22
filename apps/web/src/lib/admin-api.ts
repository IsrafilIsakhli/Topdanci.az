import { apiGet, apiPatch, apiPost } from './api-client';
import type { AuthRole, AuthSession } from './seller-api';

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

export type AdminUserRole = AuthRole;
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type AdminProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PASSIVE' | 'REJECTED' | 'DELETED';
export type AdminStoreStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
export type AdminApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AdminCategoryStatus = 'ACTIVE' | 'PASSIVE';
export type AdminReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export type AdminOverview = {
  pendingStores: number;
  pendingProducts: number;
  reports: number;
  openReports: number;
  activeStores: number;
  activeProducts: number;
  todayLeadEvents: number;
  whatsappClicksToday: number;
  recentStoreApplications: AdminStoreApplication[];
  recentPendingProducts: AdminProduct[];
  recentReports: AdminReport[];
  recentAuditLogs: AdminAuditLog[];
};

export type AdminStoreApplication = {
  id: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  companyName: string;
  taxNumber?: string | null;
  categoryId?: string | null;
  city: string;
  district?: string | null;
  description?: string | null;
  status: AdminApplicationStatus;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
};

export type AdminProduct = {
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
  status: AdminProductStatus;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  store: { id: string; slug: string; name: string; status: AdminStoreStatus };
  category?: { id: string; slug: string; name: string } | null;
  images?: AdminProductImage[];
  leadCounts?: LeadCounts;
};

export type AdminProductImage = {
  id: string;
  cdnUrl?: string | null;
  storageKey: string;
  altText?: string | null;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
  mimeType: string;
  sizeBytes: number;
  status: string;
  failureReason?: string | null;
  variants?: unknown;
};

export type AdminStore = {
  id: string;
  slug: string;
  name: string;
  legalName?: string | null;
  taxNumber?: string | null;
  description?: string | null;
  status: AdminStoreStatus;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  city: string;
  district?: string | null;
  address?: string | null;
  logoKey?: string | null;
  bannerKey?: string | null;
  verifiedAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerUser?: AdminUser | null;
  category?: { id: string; slug: string; name: string } | null;
  counts: { products: number; members: number; leadEvents: number; reports: number };
  products?: AdminProduct[];
  members?: Array<{ id: string; role: string; createdAt: string; user: AdminUser }>;
  leadCounts?: LeadCounts;
  auditLogs?: AdminAuditLog[];
};

export type AdminUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  counts?: {
    storeMembers: number;
    ownedStores: number;
    leadEvents: number;
    reports: number;
    auditLogs: number;
  };
  storeMembers?: Array<{ id: string; role: string; createdAt: string; store: Pick<AdminStore, 'id' | 'slug' | 'name' | 'status'> }>;
  ownedStores?: Array<Pick<AdminStore, 'id' | 'slug' | 'name' | 'status'>>;
  recentAuditLogs?: AdminAuditLog[];
};

export type AdminCategory = {
  id: string;
  parentId?: string | null;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  status: AdminCategoryStatus;
  counts: { products: number; stores: number; children: number };
  children?: AdminCategory[];
};

export type AdminReport = {
  id: string;
  type: string;
  message: string;
  status: AdminReportStatus;
  createdAt: string;
  updatedAt: string;
  reporter?: Pick<AdminUser, 'id' | 'email' | 'phone' | 'fullName'> | null;
  store?: Pick<AdminStore, 'id' | 'slug' | 'name'> | null;
  product?: Pick<AdminProduct, 'id' | 'slug' | 'title'> | null;
};

export type AdminAuditLog = {
  id: string;
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: unknown;
  createdAt: string;
  actor?: Pick<AdminUser, 'id' | 'email' | 'phone' | 'fullName' | 'role'> | null;
};

export type LeadCounts = {
  PRODUCT_VIEW: number;
  STORE_VIEW: number;
  WHATSAPP_CLICK: number;
  PHONE_REVEAL: number;
  EMAIL_CLICK: number;
};

export type AdminAnalytics = {
  range: '7d' | '30d' | '90d';
  totalLeads: number;
  leadCounts: LeadCounts;
  trend: Array<{ day: string; count: number }>;
  topStores: Array<{ id: string; slug?: string | null; name: string; city?: string | null; leadCount: number }>;
  topProducts: Array<{ id?: string | null; slug?: string | null; title: string; leadCount: number; store?: { id: string; name: string; slug: string } | null }>;
  cityBreakdown: Array<{ city: string; activeStores: number }>;
  categoryBreakdown: Array<{ id: string; name: string; activeProducts: number }>;
};

export type AdminSystem = {
  status: string;
  dependencies: Record<string, { ok: boolean; error?: string }>;
  metrics: {
    requests: { count: number; errors: number; averageDurationMs: number };
    worker: { queueReady: boolean; workerReady: boolean; waiting: number; active: number; failed: number };
  };
  timestamp: string;
};

export function getAdminSession() {
  return apiGet<AuthSession>('/auth/session');
}

export function getAdminOverview() {
  return apiGet<DetailResponse<AdminOverview>>('/admin/overview');
}

export function getStoreApplications(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<AdminStoreApplication>>(`/admin/store-applications${toQueryString(params)}`);
}

export function getStoreApplication(id: string) {
  return apiGet<DetailResponse<AdminStoreApplication>>(`/admin/store-applications/${encodeURIComponent(id)}`);
}

export function approveStoreApplication(id: string, payload: { storeSlug?: string; reviewNote?: string }) {
  return apiPost<DetailResponse<{ setup: { token: string; url: string; expiresAt: string }; store: Pick<AdminStore, 'id' | 'slug' | 'name'> }>>(
    `/admin/store-applications/${encodeURIComponent(id)}/approve`,
    payload,
  );
}

export function rejectStoreApplication(id: string, reviewNote: string) {
  return apiPost<DetailResponse<AdminStoreApplication>>(`/admin/store-applications/${encodeURIComponent(id)}/reject`, {
    reviewNote,
  });
}

export function getAdminProducts(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<AdminProduct>>(`/admin/products${toQueryString(params)}`);
}

export function getAdminProduct(id: string) {
  return apiGet<DetailResponse<AdminProduct>>(`/admin/products/${encodeURIComponent(id)}`);
}

export function approveAdminProduct(id: string) {
  return apiPost<DetailResponse<AdminProduct>>(`/admin/products/${encodeURIComponent(id)}/approve`, {});
}

export function rejectAdminProduct(id: string, reviewNote: string) {
  return apiPost<DetailResponse<AdminProduct>>(`/admin/products/${encodeURIComponent(id)}/reject`, { reviewNote });
}

export function suspendAdminProduct(id: string, reviewNote?: string) {
  return apiPost<DetailResponse<AdminProduct>>(`/admin/products/${encodeURIComponent(id)}/suspend`, {
    ...(reviewNote ? { reviewNote } : {}),
  });
}

export function getAdminStores(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<AdminStore>>(`/admin/stores${toQueryString(params)}`);
}

export function getAdminStore(id: string) {
  return apiGet<DetailResponse<AdminStore>>(`/admin/stores/${encodeURIComponent(id)}`);
}

export function suspendAdminStore(id: string, reviewNote?: string) {
  return apiPost<DetailResponse<AdminStore>>(`/admin/stores/${encodeURIComponent(id)}/suspend`, {
    ...(reviewNote ? { reviewNote } : {}),
  });
}

export function reactivateAdminStore(id: string) {
  return apiPost<DetailResponse<AdminStore>>(`/admin/stores/${encodeURIComponent(id)}/reactivate`, {});
}

export function getAdminUsers(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<AdminUser>>(`/admin/users${toQueryString(params)}`);
}

export function getAdminUser(id: string) {
  return apiGet<DetailResponse<AdminUser>>(`/admin/users/${encodeURIComponent(id)}`);
}

export function updateAdminUserRole(id: string, role: AdminUserRole) {
  return apiPatch<DetailResponse<AdminUser>>(`/admin/users/${encodeURIComponent(id)}/role`, { role });
}

export function updateAdminUserStatus(id: string, status: AdminUserStatus) {
  return apiPatch<DetailResponse<AdminUser>>(`/admin/users/${encodeURIComponent(id)}/status`, { status });
}

export function getAdminCategoryTree() {
  return apiGet<ListResponse<AdminCategory>>('/admin/categories/tree');
}

export function createAdminCategory(payload: { name: string; slug?: string; parentId?: string; description?: string; icon?: string; sortOrder?: number }) {
  return apiPost<DetailResponse<AdminCategory>>('/admin/categories', payload);
}

export function updateAdminCategory(id: string, payload: Partial<AdminCategory>) {
  return apiPatch<DetailResponse<AdminCategory>>(`/admin/categories/${encodeURIComponent(id)}`, payload);
}

export function deactivateAdminCategory(id: string) {
  return apiPost<DetailResponse<AdminCategory>>(`/admin/categories/${encodeURIComponent(id)}/deactivate`, {});
}

export function reactivateAdminCategory(id: string) {
  return apiPost<DetailResponse<AdminCategory>>(`/admin/categories/${encodeURIComponent(id)}/reactivate`, {});
}

export function getAdminReports(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<AdminReport>>(`/admin/reports${toQueryString(params)}`);
}

export function updateAdminReportStatus(id: string, action: 'in-review' | 'resolve' | 'reject') {
  return apiPost<DetailResponse<AdminReport>>(`/admin/reports/${encodeURIComponent(id)}/${action}`, {});
}

export function getAdminAuditLogs(params: Record<string, string | undefined> = {}) {
  return apiGet<ListResponse<AdminAuditLog>>(`/admin/audit-logs${toQueryString(params)}`);
}

export function getAdminAnalytics(range: '7d' | '30d' | '90d' = '30d') {
  return apiGet<DetailResponse<AdminAnalytics>>(`/admin/analytics?range=${range}`);
}

export function getAdminSystem() {
  return apiGet<DetailResponse<AdminSystem>>('/admin/system');
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
