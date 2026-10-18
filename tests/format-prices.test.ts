import { describe, it, expect } from 'vitest';
import { formatPropertyPrice, usdHint } from '@/lib/price-format';

describe('listing prices follow the visitor language', () => {
  it('keeps the old English output and adapts the separators elsewhere', () => {
    expect(formatPropertyPrice({ price: 1234.5, currency: 'PI' })).toBe('1,234.5 π');
    expect(formatPropertyPrice({ price: 1234.5, currency: 'PI' }, 'es')).toBe('1.234,5 π');
    expect(formatPropertyPrice({ price: 99, currency: 'USD' }, 'en')).toBe('$99');
    expect(formatPropertyPrice({ price: 99, currency: 'OUSD' }, 'en')).toBe('99 OUSD');
  });
  it('never turns a bad price into NaN', () => {
    expect(formatPropertyPrice({ price: 'abc', currency: 'PI' })).toBe('abc π');
  });
  it('writes the dollar hint with the language separators', () => {
    expect(usdHint({ price: 1000, currency: 'PI' }, 1.5, 'es')).toBe('≈ $1.500');
    expect(usdHint({ price: 1000, currency: 'PI' }, 1.5)).toBe('≈ $1,500');
  });
});
