import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { RENT_PAGE_LABELS, rp } from '@/lib/rent-page-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(RENT_PAGE_LABELS) as (keyof typeof RENT_PAGE_LABELS)[];

describe('rent page labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(RENT_PAGE_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English', () => {
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(RENT_PAGE_LABELS[k][l]).not.toBe(RENT_PAGE_LABELS[k].en);
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(rp('pageTitle', bad)).toBe('Rent Properties');
    expect(rp('pageTitle', 'fr')).toBe('Louer des biens');
  });
  it('the page uses the labels and no longer shows Arabic to every non-English language', () => {
    const src = readFileSync('components/pages/rent-page.tsx', 'utf8');
    for (const k of keys) expect(src).toContain(`rp('${k}', language)`);
    expect(src).not.toContain("language === 'en' ?");
    expect(src).toContain('pickListingText(language, property.titleEn, property.titleAr)');
  });
});
