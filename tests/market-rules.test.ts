import { describe, it, expect } from 'vitest';
import { listingTotal, feeSplit, parseListingInput, ownedShares, availableToList, decideBuy, decideSettle, validateResalePayment } from '@/lib/market-rules';

describe('money', () => {
  it('totals round up and the fee is 2% rounded up', () => {
    expect(listingTotal(3, 10)).toBe(30);
    expect(listingTotal(3, 0.333)).toBe(1);
    expect(listingTotal(0, 10)).toBeNull();
    expect(listingTotal(2, 0)).toBeNull();
    expect(feeSplit(100)).toEqual({ fee: 2, proceeds: 98 });
    expect(feeSplit(10.5)).toEqual({ fee: 0.21, proceeds: 10.29 });
    expect(feeSplit(0.01)).toEqual({ fee: 0.01, proceeds: 0 });
  });
  it('fee plus proceeds always equals the total', () => {
    for (const t of [0.01, 1.37, 33.34, 999.99]) {
      const { fee, proceeds } = feeSplit(t);
      expect(Math.round((fee + proceeds) * 100)).toBe(Math.round(t * 100));
    }
  });
});

describe('parseListingInput', () => {
  it('accepts whole shares within what is available and a positive price', () => {
    expect(parseListingInput({ shares: '5', pricePerShare: '2.555' }, 10)).toEqual({ ok: true, shares: 5, pricePerShare: 2.56 });
    expect(parseListingInput({ shares: 11, pricePerShare: 1 }, 10).ok).toBe(false);
    expect(parseListingInput({ shares: 0, pricePerShare: 1 }, 10).ok).toBe(false);
    expect(parseListingInput({ shares: 1.5, pricePerShare: 1 }, 10).ok).toBe(false);
    expect(parseListingInput({ shares: 1, pricePerShare: 0 }, 10).ok).toBe(false);
    expect(parseListingInput({ shares: 1, pricePerShare: 0.001 }, 10).ok).toBe(false);
    expect(parseListingInput({ shares: 1, pricePerShare: 'abc' }, 10).ok).toBe(false);
  });
});

describe('positions', () => {
  it('owned = bought + received - sold, never negative', () => {
    expect(ownedShares(10, 5, 3)).toBe(12);
    expect(ownedShares(0, 0, 3)).toBe(0);
    expect(availableToList(12, 5)).toBe(7);
    expect(availableToList(2, 5)).toBe(0);
  });
});

describe('decideBuy / decideSettle', () => {
  const NOW = 1000;
  it('only open listings, not your own, not someone else\'s live reservation', () => {
    expect(decideBuy({ status: 'open', sellerUid: 's' }, 'b', NOW)).toEqual({ ok: true });
    expect(decideBuy({ status: 'sold', sellerUid: 's' }, 'b', NOW)).toEqual({ ok: false, code: 'gone' });
    expect(decideBuy({ status: 'cancelled', sellerUid: 's' }, 'b', NOW)).toEqual({ ok: false, code: 'gone' });
    expect(decideBuy({ status: 'open', sellerUid: 'b' }, 'b', NOW)).toEqual({ ok: false, code: 'own' });
    expect(decideBuy({ status: 'open', sellerUid: 's', reservedBy: 'x', reservedUntilMs: NOW + 5 }, 'b', NOW)).toEqual({ ok: false, code: 'reserved' });
    expect(decideBuy({ status: 'open', sellerUid: 's', reservedBy: 'x', reservedUntilMs: NOW - 5 }, 'b', NOW)).toEqual({ ok: true });
    expect(decideBuy({ status: 'open', sellerUid: 's', reservedBy: 'b', reservedUntilMs: NOW + 5 }, 'b', NOW)).toEqual({ ok: true });
  });
  it('settles once per payment', () => {
    expect(decideSettle({ status: 'open' }, 'p1')).toBe('mark');
    expect(decideSettle({ status: 'sold', soldPaymentId: 'p1' }, 'p1')).toBe('already');
    expect(decideSettle({ status: 'sold', soldPaymentId: 'p2' }, 'p1')).toBe('conflict');
    expect(decideSettle({ status: 'cancelled' }, 'p1')).toBe('conflict');
  });
});

describe('validateResalePayment', () => {
  const base = {
    user_uid: 'b', amount: 30,
    metadata: { transactionType: 'resale', listingId: 'L1' },
    status: { developer_approved: true, transaction_verified: true, developer_completed: true },
    transaction: { txid: 'tx1' },
  };
  const exp = { uid: 'b', txid: 'tx1', listingId: 'L1', expectedAmount: 30 };
  it('accepts an exact, completed payment', () => {
    expect(validateResalePayment(base, exp).ok).toBe(true);
  });
  it('rejects other users, wrong amount, wrong listing, wrong txid and unfinished payments', () => {
    expect(validateResalePayment({ ...base, user_uid: 'z' }, exp).ok).toBe(false);
    expect(validateResalePayment({ ...base, amount: 29.99 }, exp).ok).toBe(false);
    expect(validateResalePayment(base, { ...exp, listingId: 'L2' }).ok).toBe(false);
    expect(validateResalePayment(base, { ...exp, txid: 'other' }).ok).toBe(false);
    expect(validateResalePayment({ ...base, status: { developer_approved: true } }, exp).ok).toBe(false);
    expect(validateResalePayment({ ...base, metadata: { transactionType: 'buy', listingId: 'L1' } }, exp).ok).toBe(false);
  });
});

import { parseFeePct, feePctOf, RESALE_FEE_PCT } from '@/lib/market-rules';
import { generateContractText } from '@/lib/contract-signing';

describe('fee percent setting', () => {
  it('accepts 0..20 with two decimals and rejects the rest', () => {
    expect(parseFeePct(0)).toBe(0);
    expect(parseFeePct('2.5')).toBe(2.5);
    expect(parseFeePct(1.239)).toBe(1.24);
    expect(parseFeePct(20)).toBe(20);
    for (const bad of [-1, 20.01, 'abc', '', null, undefined, NaN]) expect(parseFeePct(bad)).toBeNull();
  });
  it('falls back to the default when nothing valid is stored', () => {
    expect(feePctOf(undefined)).toBe(RESALE_FEE_PCT);
    expect(feePctOf(null)).toBe(RESALE_FEE_PCT);
    expect(feePctOf(5)).toBe(5);
    expect(feePctOf(0)).toBe(0);
    expect(feeSplit(100, 5)).toEqual({ fee: 5, proceeds: 95 });
    expect(feeSplit(100, 0)).toEqual({ fee: 0, proceeds: 100 });
  });
});

describe('contract details', () => {
  const base = { contractId: 'c', propertyId: 'p', propertyTitle: 'T', buyerUsername: 'u', sellerUsername: 'RE', type: 'hotel', amount: 5, currency: 'Pi', paymentId: 'pay', txid: 'tx' };
  it('writes dates and shares into the subject, and nothing extra for a plain sale', () => {
    const plain = generateContractText(base);
    expect(plain).not.toContain('Stay:');
    expect(plain).not.toContain('Shares:');
    const stay = generateContractText({ ...base, booking: { start: '2026-11-01', end: '2026-11-04', nights: 3 } });
    expect(stay).toContain('Stay: 2026-11-01 to 2026-11-04 (3 nights');
    const sh = generateContractText({ ...base, shares: { count: 25, totalShares: 200 } });
    expect(sh).toContain('Shares: 25 of 200 (12.5% of the property)');
    expect(generateContractText({ ...base, booking: { start: 'a', end: 'b', nights: 1 } })).toContain('(1 night;');
  });
});

import { generateResaleContractText } from '@/lib/contract-signing';

describe('resale contract', () => {
  const base = { contractId: 'c', propertyId: 'p', propertyTitle: 'Villa', sellerUsername: 'sam', buyerUsername: 'bob', shares: 25, totalShares: 200, pricePerShare: 4, amount: 100, fee: 2, proceeds: 98, currency: 'Pi', paymentId: 'pay', txid: 'tx' };
  it('names both parties, the shares, the price and the fee', () => {
    const t = generateResaleContractText(base);
    expect(t).toContain('Party A (Seller): @sam');
    expect(t).toContain('Party B (Buyer): @bob');
    expect(t).toContain('Shares sold: 25 of 200 (12.5% of the property)');
    expect(t).toContain('Price per share: 4 Pi');
    expect(t).toContain('Total price: 100 Pi');
    expect(t).toContain('Platform fee: 2 Pi (the Seller receives 98 Pi)');
  });
  it('still reads well when the property has no share total, and adds the country clause', () => {
    const t = generateResaleContractText({ ...base, totalShares: null, legal: { statusLine: 'S', governingLaw: 'Egyptian law', extraClause: 'Extra.' } });
    expect(t).toContain('Shares sold: 25\n');
    expect(t).toContain('Egyptian law');
    expect(t).toContain('6. Additional terms. Extra.');
  });
});

import { marketTotals } from '@/lib/market-rules';

describe('admin market totals', () => {
  it('counts only confirmed sales in volume and fees, and flags review ones', () => {
    const t = marketTotals([
      { status: 'confirmed', amount: 100, fee: 2 },
      { status: 'confirmed', amount: 10.5, fee: 0.21 },
      { status: 'review', amount: 50, fee: 0 },
    ], 3);
    expect(t).toEqual({ open: 3, sold: 2, review: 1, volume: 110.5, fees: 2.21 });
    expect(marketTotals([], 0)).toEqual({ open: 0, sold: 0, review: 0, volume: 0, fees: 0 });
  });
});

import { pendingOwed } from '@/lib/market-rules';

describe('what a user is owed', () => {
  it('adds up only the payouts not paid yet, without float drift', () => {
    expect(pendingOwed([
      { status: 'pending', amount: 0.1 },
      { status: 'pending', amount: 0.2 },
      { status: 'paid', amount: 50 },
    ])).toBe(0.3);
    expect(pendingOwed([])).toBe(0);
  });
});

import { pendingFirst } from '@/lib/market-rules';

describe('pending payouts first', () => {
  it('puts unpaid ones on top, newest first inside each group', () => {
    const rows = [
      { id: 'a', status: 'paid', createdAt: '2026-10-03' },
      { id: 'b', status: 'pending', createdAt: '2026-10-01' },
      { id: 'c', status: 'pending', createdAt: '2026-10-02' },
      { id: 'd', status: 'paid', createdAt: '2026-10-04' },
    ];
    expect(pendingFirst(rows).map((r) => r.id)).toEqual(['c', 'b', 'd', 'a']);
    expect(rows[0].id).toBe('a');
  });
});
