export const USER_ROLES = ['BUYER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'DELETED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const STORE_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'] as const;
export type StoreStatus = (typeof STORE_STATUSES)[number];

export const STORE_ROLES = ['OWNER', 'MANAGER', 'STAFF'] as const;
export type StoreRole = (typeof STORE_ROLES)[number];

export const PRODUCT_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'ACTIVE',
  'PASSIVE',
  'REJECTED',
  'DELETED',
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRICE_TYPES = ['FIXED', 'NEGOTIABLE'] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const PRODUCT_UNITS = ['PIECE', 'BOX', 'KG', 'TON', 'METER', 'PACKAGE'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const LEAD_TYPES = [
  'WHATSAPP_CLICK',
  'PHONE_REVEAL',
  'EMAIL_CLICK',
  'STORE_VIEW',
  'PRODUCT_VIEW',
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

