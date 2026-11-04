import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LISTING_PAGE_LABELS, lpl } from '@/lib/listing-pages-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(LISTING_PAGE_LABELS) as (keyof typeof LISTING_PAGE_LABELS)[];

describe('listing pages labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(LISTING_PAGE_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English', () => {
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(LISTING_PAGE_LABELS[k][l]).not.toBe(LISTING_PAGE_LABELS[k].en);
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(lpl('hotelTitle', bad)).toBe('Hotel Resorts');
    expect(lpl('hotelTitle', 'fr')).toBe('Hôtels et resorts');
  });
  it.each(['hotel', 'invest', 'tokenized', 'abroad'])('the %s page has no Arabic/English-only text left', (name) => {
    const src = readFileSync(`components/pages/${name}-page.tsx`, 'utf8');
    expect(src).not.toContain("language === 'en' ?");
    expect(src).toContain("from '@/lib/listing-pages-labels'");
    expect(src).toContain('pickListingText(language, property.titleEn, property.titleAr)');
    expect(src).toContain("rp('loading', language)");
  });
  it('each page uses its own title', () => {
    const want: Record<string, string> = { hotel: 'hotelTitle', invest: 'investTitle', tokenized: 'tokenizedTitle', abroad: 'abroadTitle' };
    for (const [name, key] of Object.entries(want)) {
      expect(readFileSync(`components/pages/${name}-page.tsx`, 'utf8')).toContain(`lpl('${key}', language)`);
    }
  });
});
