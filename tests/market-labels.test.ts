import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MARKET_LABELS, mk } from '@/lib/market-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(MARKET_LABELS) as (keyof typeof MARKET_LABELS)[];
const placeholders = (t: string) => (t.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('shares market labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(MARKET_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English', () => {
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(MARKET_LABELS[k][l]).not.toBe(MARKET_LABELS[k].en);
  });
  it('placeholders match English and get filled', () => {
    for (const k of keys) for (const l of LANGS) expect(placeholders(MARKET_LABELS[k][l])).toBe(placeholders(MARKET_LABELS[k].en));
    for (const l of LANGS) {
      const t = mk('totalLine', l, { total: 10, fee: 0.2, proceeds: 9.8 });
      expect(t).toContain('10');
      expect(t).toContain('0.2');
      expect(t).toContain('9.8');
      expect(t).not.toMatch(/\{\w+\}/);
    }
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(mk('back', bad)).toBe('Back');
    expect(mk('back', 'fr')).toBe('Retour');
  });
  it('the page has no Arabic/English-only text left, reads right-to-left for Arabic and Urdu, and still sells through the same API', () => {
    const src = readFileSync('app/market/page.tsx', 'utf8');
    for (const k of keys) expect(src).toContain(`mk('${k}', language`);
    expect(src).not.toMatch(/\bar \?/);
    expect(src).toContain("language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'");
    expect(src).toContain("'/api/market/listings'");
  });
});
