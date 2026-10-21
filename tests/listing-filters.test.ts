import { describe, it, expect } from 'vitest';
import { filterListings, parseMaxPi, isFiltered, EMPTY_FILTERS, FILTER_I18N, showingText, type Filters } from '@/lib/listing-filters';

type L = { id: string; name: string; price: number; currency: string; maxGuests?: number };
const items: L[] = [
  { id: 'a', name: 'Nile Hotel Cairo', price: 100, currency: 'Pi', maxGuests: 2 },
  { id: 'b', name: 'Sea Resort Hurghada', price: 50, currency: 'Pi', maxGuests: 6 },
  { id: 'c', name: 'Desert Lodge', price: 300, currency: 'Pi' },
  { id: 'd', name: 'City Suites', price: 200, currency: 'USD', maxGuests: 4 },
];
const text = (p: L) => p.name;
const f = (patch: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...patch });
const ids = (xs: L[]) => xs.map((x) => x.id).join('');

describe('parseMaxPi', () => {
  it('reads positive numbers only', () => {
    expect(parseMaxPi('150')).toBe(150);
    expect(parseMaxPi(' 12.5 ')).toBe(12.5);
    for (const s of ['', ' ', '0', '-3', 'abc']) expect(parseMaxPi(s)).toBeNull();
  });
});

describe('filterListings', () => {
  it('returns everything for empty filters, in order', () => {
    expect(ids(filterListings(items, EMPTY_FILTERS, 2, text))).toBe('abcd');
    expect(isFiltered(EMPTY_FILTERS)).toBe(false);
  });
  it('searches name case-insensitively', () => {
    expect(ids(filterListings(items, f({ query: ' hurghada ' }), 2, text))).toBe('b');
  });
  it('hides listings that cannot take that many guests but keeps ones with no limit set', () => {
    expect(ids(filterListings(items, f({ guests: 3 }), 2, text))).toBe('bcd');
    expect(ids(filterListings(items, f({ guests: 5 }), 2, text))).toBe('bc');
  });
  it('caps the price in Pi, converting USD with the rate, and keeps unknown prices', () => {
    expect(ids(filterListings(items, f({ maxPi: 120 }), 0.5, text))).toBe('ab');
    expect(ids(filterListings(items, f({ maxPi: 120 }), 2, text))).toBe('abd');
    expect(ids(filterListings(items, f({ maxPi: 120 }), null, text))).toBe('abd');
  });
  it('sorts by price with unknown prices last', () => {
    expect(ids(filterListings(items, f({ sort: 'priceAsc' }), 2, text))).toBe('badc');
    expect(ids(filterListings(items, f({ sort: 'priceDesc' }), null, text))).toBe('cabd');
  });
  it('does not change the input array', () => {
    const copy = [...items];
    filterListings(items, f({ sort: 'priceDesc' }), 2, text);
    expect(items).toEqual(copy);
  });
});

describe('strings', () => {
  it('has every string in 7 languages', () => {
    const keys = Object.keys(FILTER_I18N.en);
    for (const l of Object.keys(FILTER_I18N)) for (const k of keys) expect((FILTER_I18N as any)[l][k], `${l}.${k}`).toBeTruthy();
    for (const l of Object.keys(FILTER_I18N)) expect(showingText(l, 2, 9)).toMatch(/2/);
  });
});
