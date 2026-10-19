import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SEO_LANGS, SEO_I18N, seoLang, isRtl, countryName, seoAlternates } from '@/lib/seo-i18n';
import { toPublicListing, listingTexts, listingJsonLd } from '@/lib/public-listings';

const raw = {
  title: 'Villa', titleAr: 'فيلا', price: 1000, currency: 'USD', location: 'Dubai', country: 'AE', type: 'buy', bedrooms: 3, area: 200,
  lat: 25.2, lng: 55.27,
  translations: { fr: { title: 'Villa FR', location: 'Dubaï', description: 'Belle villa' }, zh: { title: '别墅' }, xx: { title: 'nope' }, es: 'bad' },
};

describe('seo languages', () => {
  it('accepts the 7 app languages and falls back to English', () => {
    for (const l of SEO_LANGS) expect(seoLang(l)).toBe(l);
    for (const bad of ['xx', '', null, undefined, 5, 'AR']) expect(seoLang(bad)).toBe('en');
    expect(isRtl('ar') && isRtl('ur') && !isRtl('en') && !isRtl('zh')).toBe(true);
  });
  it('every language has every text', () => {
    for (const l of SEO_LANGS) {
      const s = SEO_I18N[l];
      for (const k of ['bed', 'bath', 'sold', 'openApp', 'viewOnMap', 'noListings'] as const) expect(s[k].trim().length).toBeGreaterThan(1);
      expect(s.propertiesIn('X')).toContain('X');
      expect(s.browse('X')).toContain('X');
    }
  });
  it('lists every language for search engines, plus x-default', () => {
    const a = seoAlternates('/p/1');
    expect(Object.keys(a).sort()).toEqual([...SEO_LANGS, 'x-default'].sort());
    expect(a.en).toBe('/p/1');
    expect(a.fr).toBe('/p/1?lang=fr');
    expect(a['x-default']).toBe('/p/1');
  });
  it('names a country in the page language', () => {
    expect(countryName('AE', 'en', 'United Arab Emirates')).toBe('United Arab Emirates');
    expect(countryName('EG', 'fr', 'Egypt')).toMatch(/gypte/);
    expect(countryName('EG', 'zh', 'Egypt').length).toBeGreaterThan(0);
  });
});

describe('listing in every language', () => {
  const l = toPublicListing('a', raw)!;
  it('keeps only real translations of supported languages', () => {
    expect(Object.keys(l.translations).sort()).toEqual(['fr', 'zh']);
    expect(l.lat).toBe(25.2);
    expect(toPublicListing('b', { ...raw, lat: 0, lng: 0 })!.lat).toBeUndefined();
    expect(toPublicListing('c', { ...raw, translations: 'x' })!.translations).toEqual({});
  });
  it('uses the translation, and the English text when there is none', () => {
    expect(listingTexts(l, 'fr').title).toBe('Villa FR');
    expect(listingTexts(l, 'fr').place).toContain('Dubaï');
    expect(listingTexts(l, 'fr').body).toBe('Belle villa');
    expect(listingTexts(l, 'zh').title).toBe('别墅');
    expect(listingTexts(l, 'zh').place).toContain('Dubai');
    expect(listingTexts(l, 'es').title).toBe('Villa');
    expect(listingTexts(l, 'ar').title).toBe('فيلا');
  });
  it('writes the facts labels in the page language, with 0-9 digits', () => {
    expect(listingTexts(l, 'en').facts).toBe('3 bed · 200 m²');
    expect(listingTexts(l, 'ar').facts).toContain('غرف');
    expect(listingTexts(l, 'ur').facts).toMatch(/^3 /);
  });
  it('puts the exact coordinates and the language in the structured data', () => {
    const ld = listingJsonLd(l, 'https://e.com', 'fr') as any;
    expect(ld.inLanguage).toBe('fr');
    expect(ld.contentLocation['@type']).toBe('Place');
    expect(ld.contentLocation.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 25.2, longitude: 55.27 });
    expect(ld.contentLocation.address.addressCountry).toBe('AE');
    const noGeo = listingJsonLd(toPublicListing('z', { ...raw, lat: undefined, lng: undefined })!, 'https://e.com', 'en') as any;
    expect(noGeo.contentLocation['@type']).toBe('Country');
  });
});

describe('wiring', () => {
  it('the public pages offer every language and tell search engines about them', () => {
    const p = readFileSync('app/p/[id]/page.tsx', 'utf8');
    const c = readFileSync('app/country/[code]/page.tsx', 'utf8');
    for (const f of [p, c]) { expect(f).toContain('<SeoLangSwitch'); expect(f).toContain('seoAlternates'); }
  });
});
