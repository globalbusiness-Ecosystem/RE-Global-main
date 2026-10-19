import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { listingGaps, hasCriticalGap, countIncomplete, GAP_LABELS, CRITICAL_GAPS } from '@/lib/listing-quality';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';

const tr = (t: string) => ({ title: t });
const full = {
  image: 'https://x/a.jpg', price: 100, lat: 25.2, lng: 55.27, country: 'AE', description: 'Nice',
  translations: { ar: tr('a'), fr: tr('b'), es: tr('c'), pt: tr('d'), ur: tr('e'), zh: tr('f') },
};

describe('listingGaps', () => {
  it('finds nothing in a complete listing', () => {
    expect(listingGaps(full)).toEqual([]);
  });
  it('finds each missing piece', () => {
    expect(listingGaps({ ...full, image: '' })).toEqual(['image']);
    expect(listingGaps({ ...full, image: '', images: ['https://x/b.jpg'] })).toEqual([]);
    expect(listingGaps({ ...full, price: 0 })).toEqual(['price']);
    expect(listingGaps({ ...full, price: 'abc' })).toEqual(['price']);
    expect(listingGaps({ ...full, lat: undefined, lng: undefined })).toEqual(['coords']);
    expect(listingGaps({ ...full, lat: 0, lng: 0 })).toEqual(['coords']);
    expect(listingGaps({ ...full, country: '' })).toEqual(['country']);
    expect(listingGaps({ ...full, description: '  ' })).toEqual(['description']);
    expect(listingGaps({ ...full, translations: { ar: tr('a') } })).toEqual(['translations']);
    expect(listingGaps({ ...full, translations: undefined })).toEqual(['translations']);
  });
  it('copes with junk', () => {
    expect(listingGaps(null)).toEqual([]);
    expect(listingGaps(undefined)).toEqual([]);
    expect(listingGaps({ images: 'x', translations: 'x' } as never)).toContain('image');
  });
  it('has a label for every gap, and only photo, price and map spot are critical', () => {
    for (const g of ['image', 'price', 'coords', 'country', 'description', 'translations'] as const) expect(GAP_LABELS[g].length).toBeGreaterThan(2);
    expect([...CRITICAL_GAPS].sort()).toEqual(['coords', 'image', 'price']);
    expect(hasCriticalGap(['country', 'translations'])).toBe(false);
    expect(hasCriticalGap(['coords'])).toBe(true);
  });
});

describe('countIncomplete', () => {
  it('counts visible listings with a critical gap only', () => {
    const list = [full, { ...full, lat: undefined }, { ...full, price: 0, hidden: true }, { ...full, country: '' }];
    expect(countIncomplete(list)).toBe(1);
    expect(countIncomplete([])).toBe(0);
  });
});

describe('attention panel', () => {
  const ok: AttentionInput = {
    env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true },
    usdProperties: 0, piRateSet: false, pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 },
  };
  it('warns about incomplete listings and points to the properties tab', () => {
    const items = buildAttention({ ...ok, incompleteListings: 3 });
    expect(items.map((x) => x.id)).toEqual(['incomplete-listings']);
    expect(items[0]).toMatchObject({ level: 'warn', tab: 'properties' });
    expect(items[0].text).toContain('3');
    expect(buildAttention({ ...ok, incompleteListings: 0 })).toEqual([]);
  });
});

describe('wiring', () => {
  it('the dashboard counts them and the properties tab can filter them', () => {
    expect(readFileSync('lib/admin-attention.ts', 'utf8')).toContain('countIncomplete');
    const t = readFileSync('components/admin/properties-tab.tsx', 'utf8');
    expect(t).toContain("view === 'incomplete'");
    expect(t).toContain('listingGaps');
  });
});
