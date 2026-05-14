import { describe, expect, it } from 'vitest';
import { isStrongPassword } from './password-policy';

describe('password-policy', () => {
  it('requires a minimum production-safe password shape', () => {
    expect(isStrongPassword('Seller12345!')).toBe(true);
    expect(isStrongPassword('short1A')).toBe(false);
    expect(isStrongPassword('seller12345')).toBe(false);
    expect(isStrongPassword('SELLER12345')).toBe(false);
    expect(isStrongPassword('SellerOnly')).toBe(false);
  });
});
