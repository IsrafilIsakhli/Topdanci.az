import type { AdminReportStatus } from './admin-api';
import type { ProductStatus } from './seller-api';

/**
 * Status, rol və şikayət növləri üçün vahid Azərbaycan dilində etiket mərkəzi.
 * Admin paneli, seller paneli və bütün filtrlər yalnız buradan oxuyur ki,
 * eyni dəyər müxtəlif səhifələrdə fərqli yazılmasın.
 */

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktiv',
  APPROVED: 'Təsdiqlənmiş',
  RESOLVED: 'Həll olunub',
  OK: 'Sağlam',
  OPEN: 'Açıq',
  IN_STOCK: 'Stokda var',
  LIMITED: 'Məhdud stok',
  OUT_OF_STOCK: 'Stokda yoxdur',
  READY: 'Hazır',
  PENDING: 'Gözləyir',
  PENDING_REVIEW: 'Yoxlamada',
  IN_REVIEW: 'Baxılır',
  REJECTED: 'Rədd edilib',
  SUSPENDED: 'Dayandırılıb',
  DELETED: 'Silinib',
  FAILED: 'Xəta',
  DRAFT: 'Qaralama',
  PASSIVE: 'Passiv',
  UNKNOWN: 'Naməlum',
  BUYER: 'Alıcı',
  SELLER: 'Satıcı',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super admin',
  User: 'İstifadəçi',
  RefreshSession: 'Giriş sessiyası',
  Store: 'Mağaza',
  Product: 'Məhsul',
  Category: 'Kateqoriya',
  Report: 'Şikayət',
  SupportTicket: 'Dəstək müraciəti',
  TICKET_CREATED: 'Dəstək müraciəti açıldı',
  TICKET_REPLIED: 'Dəstək müraciətinə cavab yazıldı',
  TICKET_UPDATED: 'Dəstək müraciəti yeniləndi',
  AUTH_LOGIN: 'Hesaba giriş',
  AUTH_LOGOUT: 'Hesabdan çıxış',
  AUTH_REFRESH: 'Sessiya yeniləndi',
  AUTH_PASSWORD_CHANGE: 'Şifrə dəyişdirildi',
};

/** Naməlum dəyər üçün xam status olduğu kimi qaytarılır. */
export function statusLabel(status?: string | null): string {
  if (!status) return STATUS_LABELS.UNKNOWN ?? 'Naməlum';
  return STATUS_LABELS[status] ?? status;
}

/** Məhsul statusları — həm seller paneli, həm admin cədvəlləri üçün. */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Qaralama',
  PENDING_REVIEW: 'Yoxlamada',
  ACTIVE: 'Aktiv',
  PASSIVE: 'Passiv',
  REJECTED: 'Rədd edilib',
  DELETED: 'Silinib',
};

export const PRODUCT_STATUS_TONES: Record<ProductStatus, string> = {
  DRAFT: 'is-draft',
  PENDING_REVIEW: 'is-pending',
  ACTIVE: 'is-active',
  PASSIVE: 'is-passive',
  REJECTED: 'is-rejected',
  DELETED: 'is-rejected',
};

export function productStatusLabel(status?: string | null): string {
  return (status ? PRODUCT_STATUS_LABELS[status as ProductStatus] : undefined) ?? 'Naməlum';
}

export function productStatusTone(status?: string | null): string {
  return (status ? PRODUCT_STATUS_TONES[status as ProductStatus] : undefined) ?? 'is-draft';
}

/** Şikayət filtri — dəyərlər API enum-u, etiketlər istifadəçi üçün. */
export const REPORT_STATUS_OPTIONS: Array<{ value: AdminReportStatus | ''; label: string }> = [
  { value: '', label: 'Bütün statuslar' },
  { value: 'OPEN', label: 'Açıq' },
  { value: 'IN_REVIEW', label: 'Baxılır' },
  { value: 'RESOLVED', label: 'Həll olunub' },
  { value: 'REJECTED', label: 'Rədd edilib' },
];

/** API-də Report.type sərbəst string-dir; məlum dəyərlər burada tərcümə olunur. */
export const REPORT_TYPE_LABELS: Record<string, string> = {
  SUPPORT_REQUEST: 'Dəstək müraciəti',
  SUSPICIOUS_PRODUCT: 'Şübhəli məhsul elanı',
  PRODUCT: 'Məhsul şikayəti',
  STORE: 'Mağaza şikayəti',
};

export function reportTypeLabel(type?: string | null): string {
  if (!type) return 'Digər';
  return REPORT_TYPE_LABELS[type] ?? type;
}
