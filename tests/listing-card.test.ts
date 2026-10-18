import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { countryFlag } from '@/lib/flags';
import { hasValidCoords, focusFromProperty, parseFocus, FOCUS_KEY } from '@/lib/map-focus';
import { panoramaSrc } from '@/lib/panorama';
import { CARD_I18N } from '@/lib/card-i18n';

const read = (p: string) => readFileSync(p, 'utf8');

describe('countryFlag', () => {
  it('turns a country code into its flag', () => {
    expect(countryFlag('AE')).toBe('🇦🇪');
    expect(countryFlag('eg')).toBe('🇪🇬');
  });
  it('gives nothing for anything else', () => {
    for (const bad of ['', 'UAE', 'A', '1B', null, undefined, 5]) expect(countryFlag(bad)).toBe('');
  });
});

describe('map focus', () => {
  it('accepts real places only', () => {
    expect(hasValidCoords(25.2, 55.27)).toBe(true);
    expect(hasValidCoords('30.04', '31.23')).toBe(true);
    expect(hasValidCoords(0, 0)).toBe(false);
    for (const bad of [null, undefined, '', 'x', 91, 181, NaN]) expect(hasValidCoords(bad, 10)).toBe(false);
    expect(hasValidCoords(10, undefined)).toBe(false);
  });
  it('keeps exactly the saved spot', () => {
    expect(focusFromProperty({ id: 'p1', lat: 25.2048, lng: 55.2708, title: 'Villa' })).toEqual({ id: 'p1', lat: 25.2048, lng: 55.2708, title: 'Villa' });
    expect(focusFromProperty({ id: 'p1', lat: undefined, lng: undefined })).toBeNull();
  });
  it('reads what a card saved, and ignores junk and the old 0,0 cards', () => {
    expect(parseFocus(JSON.stringify({ id: 'p1', lat: 1.5, lng: 2.5, title: 'T' }))).toEqual({ id: 'p1', lat: 1.5, lng: 2.5, title: 'T' });
    expect(parseFocus(JSON.stringify({ id: 'buy-1', lat: 0, lng: 0 }))).toBeNull();
    for (const bad of [null, '', 'not json', '5', '[]', '{}']) expect(parseFocus(bad)).toBeNull();
    expect(FOCUS_KEY).toBe('focusProperty');
  });
});

describe('panoramaSrc', () => {
  it('opens only plain web links in the 360 viewer', () => {
    expect(panoramaSrc('https://example.com/a b.jpg')).toBeNull();
    expect(panoramaSrc('https://example.com/pano.jpg')).toContain('panorama=https%3A%2F%2Fexample.com%2Fpano.jpg');
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'ftp://x/y', '', null, 5]) expect(panoramaSrc(bad)).toBeNull();
  });
});

describe('card texts', () => {
  it('every language has every text', () => {
    for (const lang of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const) {
      for (const v of Object.values(CARD_I18N[lang])) expect(v.trim().length).toBeGreaterThan(1);
    }
  });
});

describe('wiring', () => {
  it('every page that lists admin properties uses the full card', () => {
    for (const p of ['buy', 'rent', 'hotel', 'invest', 'tokenized', 'abroad']) {
      expect(read(`components/pages/${p}-page.tsx`)).toContain('<ListingCard');
    }
    expect(read('components/firestore-listings.tsx')).toContain('<ListingCard');
  });
  it('the card pays the real amount and links to the map and the 360 tour', () => {
    const c = read('components/listing-card.tsx');
    expect(c).toContain('propertyPaymentAmount');
    expect(c).toContain('FOCUS_KEY');
    expect(c).toContain('PanoramaModal');
    expect(c).not.toContain('price={1}');
  });
  it('the map reads the saved spot and always shows admin properties', () => {
    const m = read('components/pages/map-page.tsx');
    expect(m).toContain('parseFocus');
    expect(m).toContain('p.isAdmin ||');
    expect(m).toContain('PanoramaModal');
    expect(m).toContain('mapInitStarted');
  });
});
