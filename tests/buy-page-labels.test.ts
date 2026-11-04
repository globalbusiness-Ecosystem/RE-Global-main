import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BUY_PAGE_LABELS, bp } from '@/lib/buy-page-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(BUY_PAGE_LABELS) as (keyof typeof BUY_PAGE_LABELS)[];
const placeholders = (t: string) => (t.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('buy page labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(BUY_PAGE_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English', () => {
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(BUY_PAGE_LABELS[k][l]).not.toBe(BUY_PAGE_LABELS[k].en);
  });
  it('placeholders match English and get filled', () => {
    for (const k of keys) for (const l of LANGS) expect(placeholders(BUY_PAGE_LABELS[k][l])).toBe(placeholders(BUY_PAGE_LABELS[k].en));
    for (const l of LANGS) {
      const t = bp('youPay', l, { pi: '12.5' });
      expect(t).toContain('12.5');
      expect(t).not.toMatch(/\{\w+\}/);
    }
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(bp('sold', bad)).toBe('This property has been sold');
    expect(bp('sold', 'fr')).toBe('Ce bien a été vendu');
  });
  it('the page uses the labels and no longer shows Arabic to every non-English language', () => {
    const src = readFileSync('components/pages/buy-page.tsx', 'utf8');
    for (const k of keys) expect(src).toContain(`bp('${k}', language`);
    expect(src).not.toContain("language === 'en' ?");
    expect(src).toContain('pickListingText(language, property.titleEn, property.titleAr)');
  });
});
