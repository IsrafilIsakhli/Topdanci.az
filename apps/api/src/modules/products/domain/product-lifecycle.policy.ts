import type { ProductStatus } from '@prisma/client';

export function canPublishProduct(status: ProductStatus): boolean {
  return status === 'DRAFT' || status === 'PENDING_REVIEW' || status === 'PASSIVE';
}

export function requiresModeratorReview(status: ProductStatus): boolean {
  return status === 'PENDING_REVIEW';
}
