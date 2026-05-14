import { describe, expect, it } from 'vitest';
import {
  isAllowedProductImageMimeType,
  maxProductImageSizeBytes,
  productImageObjectKey,
} from './media-policy';

describe('media-policy', () => {
  it('allows only production-safe image mime types', () => {
    expect(isAllowedProductImageMimeType('image/jpeg')).toBe(true);
    expect(isAllowedProductImageMimeType('image/png')).toBe(true);
    expect(isAllowedProductImageMimeType('image/webp')).toBe(true);
    expect(isAllowedProductImageMimeType('image/svg+xml')).toBe(false);
    expect(isAllowedProductImageMimeType('application/pdf')).toBe(false);
  });

  it('keeps product image uploads below the configured hard limit', () => {
    expect(maxProductImageSizeBytes()).toBe(10_000_000);
  });

  it('creates scoped object keys and sanitizes file names', () => {
    expect(productImageObjectKey('store-1', 'product-1', 'My Image (Final).PNG')).toMatch(
      /^stores\/store-1\/products\/product-1\/\d+-my-image-final-.png$/,
    );
  });
});
