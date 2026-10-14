import { describe, it, expect } from 'vitest';
import { toPublicListing, listingTexts, listingJsonLd, countryFromSlug, seoLang } from '@/lib/public-listings';

const raw = { title: 'Villa', titleAr: 'فيلا', price: 1000, currency: 'USD', location: 'Dubai', country: 'AE', type: 'buy', bedrooms: 3, status: 'sold', images: ['https://x/y.jpg'] };

describe('public listings', () => {
  it('hides hidden or untitled documents', () => {
    expect(toPublicListing('a', { ...raw, hidden: true })).toBeNull();
    expect(toPublicListing('a', { price: 1 })).toBeNull();
    expect(toPublicListing('a', undefined)).toBeNull();
  });
  it('maps fields, sold flag and first image', () => {
    const l = toPublicListing('a', raw)!;
    expect(l.sold).toBe(true);
    expect(l.image).toBe('https://x/y.jpg');
    expect(toPublicListing('b', { ...raw, type: 'rent' })!.sold).toBe(false);
    expect(toPublicListing('c', { ...raw, country: 'ZZ' })!.country).toBe('');
  });
  it('builds localized texts', () => {
    const l = toPublicListing('a', raw)!;
    expect(listingTexts(l, 'ar').title).toBe('فيلا');
    expect(listingTexts(l, 'en').description).toContain('$1,000');
    expect(listingTexts(l, 'en').place).toContain('United Arab Emirates');
  });
  it('emits schema.org JSON-LD with availability', () => {
    const ld = listingJsonLd(toPublicListing('a', raw)!, 'https://e.com', 'en');
    expect(ld['@type']).toBe('RealEstateListing');
    expect(ld.url).toBe('https://e.com/p/a');
    expect(ld.offers.availability).toBe('https://schema.org/SoldOut');
  });
  it('validates country slugs and language', () => {
    expect(countryFromSlug('ae')).toBe('AE');
    expect(countryFromSlug('zz')).toBeNull();
    expect(seoLang('ar')).toBe('ar');
    expect(seoLang('x')).toBe('en');
  });
});
