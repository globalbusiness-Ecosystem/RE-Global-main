import { describe, it, expect } from 'vitest';
import { localeFor, formatNumber, formatCompact, formatMoney, formatDate, formatDateTime } from '@/lib/format';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

describe('global formatting', () => {
  it('always uses 0-9 digits, in every supported language', () => {
    for (const l of LANGS) {
      expect(localeFor(l)).toContain('-u-nu-latn');
      expect(formatNumber(1234567.891, l)).toMatch(/^[0-9\s.,]+$/);
      expect(formatDate('2026-10-18T12:00:00Z', l, 'UTC')).toMatch(/18/);
      expect(formatDate('2026-10-18T12:00:00Z', l, 'UTC')).toMatch(/2026/);
    }
  });

  it('groups thousands the way each language expects', () => {
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(formatNumber(1234.5, 'fr').replace(/\s/g, ' ')).toBe('1 234,5');
    expect(formatNumber(1234.5, 'es')).toBe('1.234,5');
    expect(formatNumber(1234.5, 'pt').replace(/\s/g, ' ')).toBe('1 234,5');
  });

  it('falls back to English for an unknown language and never prints NaN', () => {
    expect(localeFor('xx')).toBe('en-US-u-nu-latn');
    expect(localeFor(undefined)).toBe('en-US-u-nu-latn');
    expect(formatNumber('abc', 'en')).toBe('—');
    expect(formatNumber(null, 'en')).toBe('—');
    expect(formatNumber(undefined, 'ar')).toBe('—');
    expect(formatCompact(NaN, 'en')).toBe('—');
  });

  it('shows prices with the right mark', () => {
    expect(formatMoney(1500, 'PI', 'en')).toBe('1,500 π');
    expect(formatMoney(1500, undefined, 'en')).toBe('1,500 π');
    expect(formatMoney(1500, 'usd', 'en')).toBe('$1,500');
    expect(formatMoney(1500, 'USDT', 'en')).toBe('$1,500');
    expect(formatMoney(1500, 'OUSD', 'en')).toBe('1,500 OUSD');
    expect(formatMoney(1500, 'egp', 'en')).toBe('1,500 EGP');
  });

  it('rounds long decimals and compacts big numbers', () => {
    expect(formatNumber(1.23456, 'en')).toBe('1.23');
    expect(formatNumber(1.23456, 'en', 4)).toBe('1.2346');
    expect(formatCompact(1500000, 'en')).toBe('1.5M');
  });

  it('handles bad dates without throwing', () => {
    expect(formatDate('not a date', 'en')).toBe('');
    expect(formatDate(null, 'en')).toBe('');
    expect(formatDateTime(undefined, 'ar')).toBe('');
    expect(formatDateTime(Date.UTC(2026, 9, 18, 12, 30), 'en', 'UTC')).toContain('12:30');
  });
});
