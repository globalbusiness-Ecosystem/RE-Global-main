import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractTitles, pickMarketTitle } from '@/lib/market-titles';

describe('market property titles', () => {
  const data = { title: 'Villa', titleAr: 'فيلا', translations: { fr: { title: ' Villa de luxe ' }, zh: { title: '豪华别墅' }, es: { title: '  ' }, pt: { description: 'x' } } };
  it('collects the translated titles, trims them and skips empty ones', () => {
    expect(extractTitles(data)).toEqual({ fr: 'Villa de luxe', zh: '豪华别墅', ar: 'فيلا' });
  });
  it('a translated Arabic title wins over the plain Arabic field', () => {
    expect(extractTitles({ titleAr: 'قديم', translations: { ar: { title: 'جديد' } } }).ar).toBe('جديد');
  });
  it('copes with missing or odd data', () => {
    expect(extractTitles(undefined)).toEqual({});
    expect(extractTitles({ translations: 'x', titleAr: 5 })).toEqual({});
    expect(extractTitles({ translations: { __proto__: { fr: { title: 'x' } } } })).toEqual({});
    expect(extractTitles({ translations: { fr: { title: 'x'.repeat(500) } } }).fr.length).toBe(200);
  });
  const titles = { p1: { fr: 'Villa de luxe', ar: 'فيلا' } };
  it('shows the title in the reader language, else the stored one', () => {
    expect(pickMarketTitle(titles, 'p1', 'fr', 'Villa')).toBe('Villa de luxe');
    expect(pickMarketTitle(titles, 'p1', 'ar', 'Villa')).toBe('فيلا');
    expect(pickMarketTitle(titles, 'p1', 'zh', 'Villa')).toBe('Villa');
    expect(pickMarketTitle(titles, 'p2', 'fr', 'Villa')).toBe('Villa');
    expect(pickMarketTitle(undefined, 'p1', 'fr', 'Villa')).toBe('Villa');
  });
  it('is safe against hostile language codes and ids', () => {
    for (const l of ['__proto__', 'constructor', 'toString', undefined]) expect(pickMarketTitle(titles, 'p1', l as string | undefined, 'Villa')).toBe('Villa');
    for (const id of ['__proto__', 'constructor']) expect(pickMarketTitle(titles, id, 'fr', 'Villa')).toBe('Villa');
  });
  it('the routes send the titles and the page uses them', () => {
    expect(readFileSync('app/api/market/listings/route.ts', 'utf8')).toContain('loadMarketTitles(listings.map');
    expect(readFileSync('app/api/market/me/route.ts', 'utf8')).toContain('loadMarketTitles(');
    const page = readFileSync('app/market/page.tsx', 'utf8');
    expect(page.match(/tt\(/g)?.length).toBeGreaterThanOrEqual(4);
    expect(page).not.toContain('<PropertyHead title={l.propertyTitle}');
  });
});
