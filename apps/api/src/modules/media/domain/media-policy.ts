const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function isAllowedProductImageMimeType(mimeType: string): boolean {
  return allowedImageTypes.includes(mimeType as (typeof allowedImageTypes)[number]);
}

export function maxProductImageSizeBytes(): number {
  return 10_000_000;
}

export function productImageObjectKey(storeId: string, productId: string, fileName: string): string {
  const safeFileName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  return `stores/${storeId}/products/${productId}/${Date.now()}-${safeFileName}`;
}
