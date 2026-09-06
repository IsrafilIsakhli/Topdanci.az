const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
const allowedExtensionsByMimeType: Record<(typeof allowedImageTypes)[number], string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};

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

export function storeAssetObjectKey(storeId: string, kind: 'logo' | 'banner', fileName: string): string {
  const safeFileName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  return `stores/${storeId}/assets/${kind}/${Date.now()}-${safeFileName}`;
}

export function isFileNameAllowedForMimeType(fileName: string, mimeType: string): boolean {
  if (!isAllowedProductImageMimeType(mimeType)) {
    return false;
  }

  const normalizedFileName = fileName.toLowerCase();
  const extension = normalizedFileName.split('.').pop();

  if (!extension || extension === normalizedFileName) {
    return false;
  }

  return allowedExtensionsByMimeType[mimeType as (typeof allowedImageTypes)[number]].includes(extension);
}
