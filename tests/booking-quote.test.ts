import { describe, it, expect, vi } from 'vitest';

let doc: { exists: boolean; data: () => Record<string, unknown> } = { exists: false, data: () => ({}) };
vi.mock('@/lib/firebase-admin', () => ({ adminDb: { collection: () => ({ doc: () => ({ get: async () => doc }) }) } }));
vi.mock('@/lib/pricing', () => ({ getPiUsdRate: async () => 2 }));

import { resolveExpected, BookingInputError } from '@/lib/property-price';

const set = (d: Record<string, unknown> | null) => { doc = d ? { exists: true, data: () => d } : { exists: false, data: () => ({}) }; };
const future = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

describe('resolveExpected', () => {
  it('prices a hotel stay per night', async () => {
    set({ type: 'hotel', price: 10, currency: 'Pi' });
    const q = await resolveExpected('h1', { booking: { start: future(5), end: future(8) } });
    expect(q.amount).toBe(30);
    expect(q.booking?.nights).toBe(3);
  });
  it('prices rent pro rata and converts USD with the admin rate', async () => {
    set({ type: 'rent', price: 600, currency: 'USD' });
    const q = await resolveExpected('r1', { booking: { start: future(5), end: future(35) } });
    expect(q.amount).toBe(300);
  });
  it('rejects missing or bad dates for dated listings', async () => {
    set({ type: 'hotel', price: 10, currency: 'Pi' });
    await expect(resolveExpected('h1', {})).rejects.toBeInstanceOf(BookingInputError);
    await expect(resolveExpected('h1', { booking: { start: future(8), end: future(5) } })).rejects.toBeInstanceOf(BookingInputError);
  });
  it('leaves other listings and demo ids unchanged', async () => {
    set({ type: 'buy', price: 250, currency: 'Pi' });
    expect(await resolveExpected('b1', {})).toEqual({ amount: 250 });
    set(null);
    expect(await resolveExpected('demo', {})).toEqual({ amount: null });
  });
});

describe('resolveExpected with shares', () => {
  it('prices the chosen shares of a share-based listing', async () => {
    set({ type: 'invest', price: 1000, currency: 'Pi', totalShares: 100 });
    const q = await resolveExpected('i1', { shares: 5 });
    expect(q.amount).toBe(50);
    expect(q.shares).toEqual({ count: 5, totalShares: 100, type: 'invest' });
  });
  it('uses payAmountPi as the value of the whole asset', async () => {
    set({ type: 'tokenized', price: 999999, currency: 'Pi', payAmountPi: 200, totalShares: 40 });
    expect((await resolveExpected('t1', { shares: 10 })).amount).toBe(50);
  });
  it('rejects a missing or oversized share count', async () => {
    set({ type: 'invest', price: 1000, currency: 'Pi', totalShares: 100 });
    await expect(resolveExpected('i1', {})).rejects.toBeInstanceOf(BookingInputError);
    await expect(resolveExpected('i1', { shares: 101 })).rejects.toBeInstanceOf(BookingInputError);
  });
  it('keeps the old whole-price behaviour without totalShares', async () => {
    set({ type: 'invest', price: 300, currency: 'Pi' });
    expect(await resolveExpected('i2', {})).toEqual({ amount: 300 });
  });
});
