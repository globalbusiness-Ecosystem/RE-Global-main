import { describe, it, expect, vi } from 'vitest';

let doc: { exists: boolean; data: () => Record<string, unknown> } = { exists: false, data: () => ({}) };
vi.mock('@/lib/firebase-admin', () => ({ adminDb: { collection: () => ({ doc: () => ({ get: async () => doc }) }) } }));
vi.mock('@/lib/pricing', () => ({ getPiUsdRate: async () => 2 }));

import { parseGuests, GUEST_I18N, guestsText } from '@/lib/guests';
import { resolveExpected, BookingInputError } from '@/lib/property-price';

const future = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const set = (d: Record<string, unknown>) => { doc = { exists: true, data: () => d }; };

describe('parseGuests', () => {
  it('defaults to 1 when absent', () => {
    expect(parseGuests(undefined, 4)).toEqual({ ok: true, guests: 1 });
    expect(parseGuests('', undefined)).toEqual({ ok: true, guests: 1 });
  });
  it('accepts whole numbers up to the limit', () => {
    expect(parseGuests(3, 4)).toEqual({ ok: true, guests: 3 });
    expect(parseGuests('4', 4)).toEqual({ ok: true, guests: 4 });
    expect(parseGuests(5, 4).ok).toBe(false);
    expect(parseGuests(2, 1).ok).toBe(false);
  });
  it('rejects bad values', () => {
    for (const g of [0, -1, 1.5, 'x', NaN]) expect(parseGuests(g, 4).ok).toBe(false);
  });
  it('falls back to 50 without a listing limit', () => {
    expect(parseGuests(50, undefined).ok).toBe(true);
    expect(parseGuests(51, undefined).ok).toBe(false);
    expect(parseGuests(2, 'junk').ok).toBe(true);
  });
  it('has the text in 7 languages', () => {
    expect(Object.keys(GUEST_I18N)).toHaveLength(7);
    for (const l of Object.keys(GUEST_I18N)) expect(guestsText(l, 3)).toContain('3');
  });
});

describe('resolveExpected with guests', () => {
  it('keeps the guest count in the quote and does not change the price', async () => {
    set({ type: 'hotel', price: 10, currency: 'Pi', maxGuests: 4 });
    const q = await resolveExpected('h1', { booking: { start: future(5), end: future(8), guests: 3 } });
    expect(q.amount).toBe(30);
    expect(q.booking?.guests).toBe(3);
  });
  it('defaults to 1 guest', async () => {
    set({ type: 'hotel', price: 10, currency: 'Pi', maxGuests: 4 });
    const q = await resolveExpected('h1', { booking: { start: future(5), end: future(8) } });
    expect(q.booking?.guests).toBe(1);
  });
  it('refuses more guests than the listing allows', async () => {
    set({ type: 'hotel', price: 10, currency: 'Pi', maxGuests: 2 });
    await expect(resolveExpected('h1', { booking: { start: future(5), end: future(8), guests: 3 } })).rejects.toBeInstanceOf(BookingInputError);
  });
});
