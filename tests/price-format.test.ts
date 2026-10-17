import { describe, it, expect } from 'vitest';

import { usdHint } from '@/lib/price-format';

describe('usdHint', () => {
  it('shows a dollar estimate for Pi prices', () => {
    expect(usdHint({ price: 1000, currency: 'PI' }, 0.5)).toBe('≈ $500');
    expect(usdHint({ price: 10, currency: 'pi' }, 0.123)).toBe('≈ $1.23');
    expect(usdHint({ price: 1234567, currency: undefined }, 0.31)).toBe('≈ $382,716');
  });
  it('stays silent without a rate, for dollar listings and for bad prices', () => {
    expect(usdHint({ price: 1000, currency: 'PI' }, null)).toBeNull();
    expect(usdHint({ price: 1000, currency: 'PI' }, 0)).toBeNull();
    expect(usdHint({ price: 1000, currency: 'USD' }, 0.5)).toBeNull();
    expect(usdHint({ price: 'abc', currency: 'PI' }, 0.5)).toBeNull();
    expect(usdHint({ price: -5, currency: 'PI' }, 0.5)).toBeNull();
  });
});
