import { describe, it, expect } from 'vitest';
import { PROPERTY_DETAILS_LABELS, pd, pickListingText } from '@/lib/property-details-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(PROPERTY_DETAILS_LABELS) as (keyof typeof PROPERTY_DETAILS_LABELS)[];

describe('property details labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(PROPERTY_DETAILS_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English', () => {
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(PROPERTY_DETAILS_LABELS[k][l]).not.toBe(PROPERTY_DETAILS_LABELS[k].en);
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(pd('buyNow', bad)).toBe('Buy Now');
    expect(pd('buyNow', 'fr')).toBe('Acheter maintenant');
  });
  it('listing text: Arabic readers get Arabic, everyone else English, with a fallback to the other one', () => {
    expect(pickListingText('ar', 'Villa', 'فيلا')).toBe('فيلا');
    for (const l of ['en', 'fr', 'es', 'pt', 'ur', 'zh']) expect(pickListingText(l, 'Villa', 'فيلا')).toBe('Villa');
    expect(pickListingText('fr', '', 'فيلا')).toBe('فيلا');
    expect(pickListingText('ar', 'Villa', '')).toBe('Villa');
    expect(pickListingText('en', undefined, undefined)).toBe('');
  });
});
