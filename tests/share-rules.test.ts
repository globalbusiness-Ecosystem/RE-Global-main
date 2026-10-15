import { describe, it, expect } from 'vitest';
import { totalSharesOf, remainingShares, parseShares, sharesTotal, ownershipPercent, decideShares, type ShareHold } from '@/lib/share-rules';

const NOW = 1_000_000;
const hold = (paymentId: string, uid: string, count: number, expiresAtMs = NOW + 1000): ShareHold => ({ paymentId, uid, count, expiresAtMs });

describe('totalSharesOf / remainingShares', () => {
  it('only invest and tokenized listings with a valid share count are sold by shares', () => {
    expect(totalSharesOf({ type: 'invest', totalShares: 100 })).toBe(100);
    expect(totalSharesOf({ type: 'tokenized', totalShares: '50' })).toBe(50);
    expect(totalSharesOf({ type: 'buy', totalShares: 100 })).toBeNull();
    expect(totalSharesOf({ type: 'invest' })).toBeNull();
    expect(totalSharesOf({ type: 'invest', totalShares: 2.5 })).toBeNull();
    expect(totalSharesOf(null)).toBeNull();
  });
  it('remaining never goes below zero', () => {
    expect(remainingShares({ totalShares: 100, sharesSold: 30 })).toBe(70);
    expect(remainingShares({ totalShares: 100, sharesSold: 130 })).toBe(0);
    expect(remainingShares({})).toBe(0);
  });
});

describe('parseShares / sharesTotal', () => {
  it('accepts whole numbers within the listing', () => {
    expect(parseShares(5, 100)).toEqual({ ok: true, count: 5 });
    expect(parseShares('5', 100)).toEqual({ ok: true, count: 5 });
    expect(parseShares(0, 100).ok).toBe(false);
    expect(parseShares(1.5, 100).ok).toBe(false);
    expect(parseShares(101, 100).ok).toBe(false);
    expect(parseShares('', 100).ok).toBe(false);
  });
  it('prices shares pro rata, rounded up', () => {
    expect(sharesTotal(1000, 100, 5)).toBe(50);
    expect(sharesTotal(100, 3, 1)).toBe(33.34);
    expect(sharesTotal(100, 3, 3)).toBe(100);
    expect(sharesTotal(0, 100, 5)).toBeNull();
    expect(sharesTotal(1000, 100, 101)).toBeNull();
  });
  it('computes the ownership percent', () => {
    expect(ownershipPercent(5, 100)).toBe(5);
    expect(ownershipPercent(1, 3)).toBe(33.33);
  });
});

describe('decideShares', () => {
  const base = { totalShares: 100, sold: 60, holds: [] as ShareHold[] };
  const req = { paymentId: 'pX', uid: 'u2', count: 30 };
  it('allows up to what is left and refuses more', () => {
    expect(decideShares(base, req, NOW)).toMatchObject({ ok: true, available: 40 });
    expect(decideShares(base, { ...req, count: 41 }, NOW)).toMatchObject({ ok: false, available: 40 });
  });
  it("counts other people's live holds, ignores expired ones", () => {
    const live = { ...base, holds: [hold('a', 'u1', 20)] };
    expect(decideShares(live, req, NOW)).toMatchObject({ ok: false, available: 20 });
    const expired = { ...base, holds: [hold('a', 'u1', 20, NOW - 1)] };
    expect(decideShares(expired, req, NOW).ok).toBe(true);
  });
  it('ignores the same payment and the same user\'s other holds', () => {
    const s = { ...base, holds: [hold('pX', 'u2', 40), hold('old', 'u2', 40)] };
    expect(decideShares(s, req, NOW)).toMatchObject({ ok: true, available: 40 });
  });
});

import { holdingTotals, canCancelHolding } from '@/lib/share-rules';

describe('admin share purchases', () => {
  it('totals count only confirmed purchases and flag review ones', () => {
    expect(holdingTotals([
      { status: 'confirmed', shares: 10, amount: 12.5 },
      { status: 'confirmed', shares: 5, amount: 6.25 },
      { status: 'review', shares: 3, amount: 99 },
      { status: 'cancelled', shares: 7, amount: 50 },
    ])).toEqual({ confirmed: 2, shares: 15, volume: 18.75, review: 1 });
  });
  it('a review purchase can always be cancelled and returns no shares', () => {
    expect(canCancelHolding('review', 3, 0)).toEqual({ ok: true, returnsShares: false });
  });
  it('a confirmed purchase can be cancelled only while the buyer still holds the shares', () => {
    expect(canCancelHolding('confirmed', 10, 10)).toEqual({ ok: true, returnsShares: true });
    expect(canCancelHolding('confirmed', 10, 4).ok).toBe(false);
    expect(canCancelHolding('cancelled', 10, 10).ok).toBe(false);
  });
});
