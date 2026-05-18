import { describe, expect, it } from 'vitest';
import {
  isAllowedProductImageMimeType,
  isFileNameAllowedForMimeType,
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

  it('requires image extensions to match MIME types', () => {
    expect(isFileNameAllowedForMimeType('photo.jpg', 'image/jpeg')).toBe(true);
    expect(isFileNameAllowedForMimeType('photo.jpeg', 'image/jpeg')).toBe(true);
    expect(isFileNameAllowedForMimeType('photo.png', 'image/png')).toBe(true);
    expect(isFileNameAllowedForMimeType('photo.webp', 'image/webp')).toBe(true);
    expect(isFileNameAllowedForMimeType('photo.jpg', 'image/png')).toBe(false);
    expect(isFileNameAllowedForMimeType('photo.svg', 'image/svg+xml')).toBe(false);
    expect(isFileNameAllowedForMimeType('photo', 'image/jpeg')).toBe(false);
  });
});
