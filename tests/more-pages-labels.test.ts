import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MORE_PAGE_LABELS, mpl } from '@/lib/more-pages-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(MORE_PAGE_LABELS) as (keyof typeof MORE_PAGE_LABELS)[];

describe('off-plan, favorites and property card labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(MORE_PAGE_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English', () => {
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(MORE_PAGE_LABELS[k][l]).not.toBe(MORE_PAGE_LABELS[k].en);
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(mpl('favoritesTitle', bad)).toBe('Favorites');
    expect(mpl('favoritesTitle', 'fr')).toBe('Favoris');
  });
  it.each([
    'components/pages/offplan-page.tsx',
    'components/pages/favorites-page.tsx',
    'components/property-card.tsx',
    'components/firestore-listings.tsx',
  ])('%s has no Arabic/English-only text left', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).not.toMatch(/language *(===|!==) *'en' *\?/);
    expect(src).toContain("from '@/lib/more-pages-labels'");
  });
  it('use client stays the first line of the client components', () => {
    for (const file of ['components/pages/offplan-page.tsx', 'components/pages/favorites-page.tsx', 'components/property-card.tsx', 'components/firestore-listings.tsx']) {
      const first = readFileSync(file, 'utf8').split('\n')[0];
      expect(first === "'use client';" || first === '"use client";' || first.startsWith('import')).toBe(true);
    }
  });
  it('the cards use the localized title and the right keys', () => {
    expect(readFileSync('components/property-card.tsx', 'utf8')).toContain('pickListingText(language, titleEn, titleAr)');
    expect(readFileSync('components/pages/offplan-page.tsx', 'utf8')).toContain("mpl('offplanTitle', language)");
    expect(readFileSync('components/pages/favorites-page.tsx', 'utf8')).toContain("mpl('favoritesTitle', language)");
    expect(readFileSync('components/firestore-listings.tsx', 'utf8')).toContain("mpl('featuredProperties', language)");
  });
});
