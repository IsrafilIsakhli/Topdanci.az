import type { StoreStatus } from '@prisma/client';

export function canStorePublishProducts(status: StoreStatus): boolean {
  return status === 'ACTIVE';
}

export function isStoreVisiblePublicly(status: StoreStatus): boolean {
  return status === 'ACTIVE';
}
