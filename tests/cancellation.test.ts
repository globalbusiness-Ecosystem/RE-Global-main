import { describe, it, expect, vi, beforeEach } from 'vitest';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
const ref = (name: string, id: string) => ({ name, id });
const fake = {
  collection: (name: string) => ({
    doc: (id: string) => ({ ...ref(name, id), get: async () => ({ exists: !!store[name]?.[id], data: () => store[name]?.[id] }) }),
  }),
  runTransaction: async (fn: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      get: async (r: { name: string; id: string }) => ({ exists: !!store[r.name]?.[r.id], data: () => store[r.name]?.[r.id] }),
      update: (r: { name: string; id: string }, d: Doc) => { store[r.name][r.id] = { ...store[r.name][r.id], ...d }; },
      set: (r: { name: string; id: string }, d: Doc) => { store[r.name] ??= {}; store[r.name][r.id] = d; },
    };
    return fn(tx);
  },
};
vi.mock('@/lib/firebase-admin', () => ({ adminDb: { collection: (n: string) => fake.collection(n), runTransaction: (f: (tx: unknown) => Promise<unknown>) => fake.runTransaction(f) } }));

import { DEFAULT_POLICY, parsePolicy, policyOf, refundQuote, policyText, refundText, CANCEL_I18N } from '@/lib/cancellation';
import { guestCancelBooking, guestCancelQuote, getCancellationPolicy } from '@/lib/booking-cancel';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const P = DEFAULT_POLICY; // 7 / 2 / 50

describe('parsePolicy', () => {
  it('accepts valid policies, also from strings', () => {
    expect(parsePolicy({ freeDays: 7, partialDays: 2, partialPct: 50 })).toEqual(P);
    expect(parsePolicy({ freeDays: '14', partialDays: '3', partialPct: '25' })).toEqual({ freeDays: 14, partialDays: 3, partialPct: 25 });
    expect(parsePolicy({ freeDays: 3, partialDays: 3, partialPct: 0 })).toEqual({ freeDays: 3, partialDays: 3, partialPct: 0 });
  });
  it('rejects invalid ones', () => {
    for (const bad of [null, {}, { freeDays: 0, partialDays: 0, partialPct: 0 }, { freeDays: 91, partialDays: 0, partialPct: 0 }, { freeDays: 7, partialDays: 8, partialPct: 10 }, { freeDays: 7, partialDays: 2, partialPct: 100 }, { freeDays: 7, partialDays: 2, partialPct: -1 }, { freeDays: 7.5, partialDays: 2, partialPct: 10 }, { freeDays: 7, partialDays: '', partialPct: 10 }]) {
      expect(parsePolicy(bad)).toBeNull();
    }
    expect(policyOf({ freeDays: 'x' })).toEqual(P);
  });
});

describe('refundQuote', () => {
  const b = (start: string, over: Record<string, unknown> = {}) => ({ status: 'confirmed', start, amount: 100, ...over });
  const today = '2026-10-10';
  it('refunds in full early enough', () => {
    expect(refundQuote(P, b('2026-10-17'), today)).toEqual({ allowed: true, days: 7, pct: 100, refund: 100 });
    expect(refundQuote(P, b('2026-12-01'), today)).toMatchObject({ pct: 100, refund: 100 });
  });
  it('refunds partly in the middle window and nothing late', () => {
    expect(refundQuote(P, b('2026-10-16'), today)).toMatchObject({ days: 6, pct: 50, refund: 50 });
    expect(refundQuote(P, b('2026-10-12'), today)).toMatchObject({ days: 2, pct: 50, refund: 50 });
    expect(refundQuote(P, b('2026-10-11'), today)).toMatchObject({ allowed: true, days: 1, pct: 0, refund: 0 });
  });
  it('has no partial tier when the percent is 0', () => {
    expect(refundQuote({ freeDays: 7, partialDays: 2, partialPct: 0 }, b('2026-10-14'), today).pct).toBe(0);
  });
  it('never rounds up in cents', () => {
    expect(refundQuote(P, b('2026-10-16', { amount: 0.99 }), today).refund).toBe(0.49);
    expect(refundQuote(P, b('2026-10-16', { amount: 33.33 }), today).refund).toBe(16.66);
  });
  it('refuses started, cancelled, review and broken bookings', () => {
    expect(refundQuote(P, b('2026-10-10'), today)).toMatchObject({ allowed: false, reason: 'started' });
    expect(refundQuote(P, b('2026-10-05'), today)).toMatchObject({ allowed: false, reason: 'started' });
    expect(refundQuote(P, b('2026-10-20', { status: 'cancelled' }), today)).toMatchObject({ allowed: false, reason: 'status' });
    expect(refundQuote(P, b('2026-10-20', { status: 'review' }), today).allowed).toBe(false);
    expect(refundQuote(P, b('nope'), today).allowed).toBe(false);
  });
});

describe('texts', () => {
  it('describes the policy', () => {
    expect(policyText('en', P)).toBe('Free cancellation up to 7 days before check-in. 50% refund up to 2 days before check-in. No refund after that.');
    expect(policyText('en', { freeDays: 3, partialDays: 1, partialPct: 0 })).toBe('Free cancellation up to 3 days before check-in. No refund after that.');
  });
  it('tells the guest what they get back', () => {
    expect(refundText('en', { pct: 100, refund: 80 }, '80.00')).toContain('full refund of 80.00');
    expect(refundText('en', { pct: 50, refund: 40 }, '40.00')).toContain('40.00 π back (50%)');
    expect(refundText('en', { pct: 0, refund: 0 }, '0.00')).toContain('no longer refundable');
  });
  it('every language has every string', () => {
    const keys = Object.keys(CANCEL_I18N.en);
    for (const [lang, t] of Object.entries(CANCEL_I18N)) for (const k of keys) expect((t as unknown as Record<string, string>)[k], `${lang}.${k}`).toBeTruthy();
  });
  it('audit log', () => {
    expect(auditLabel('booking.policy')).not.toBe('booking.policy');
    expect(auditSummary('booking.policy', { from: '7/2/50', to: '14/3/25' })).toBe('7/2/50 ← 14/3/25');
  });
});

describe('guest cancels a booking', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    store.bookings = {
      early: { uid: 'u1', username: 'sara', status: 'confirmed', start: day(10), end: day(13), amount: 90, propertyId: 'h1' },
      mid: { uid: 'u1', username: 'sara', status: 'confirmed', start: day(4), end: day(6), amount: 60, propertyId: 'h1' },
      late: { uid: 'u1', username: 'sara', status: 'confirmed', start: day(1), end: day(3), amount: 60, propertyId: 'h1' },
      started: { uid: 'u1', username: 'sara', status: 'confirmed', start: day(0), end: day(2), amount: 60, propertyId: 'h1' },
    };
    store.booking_calendars = { h1: { ranges: [
      { start: day(10), end: day(13), paymentId: 'early', uid: 'u1', status: 'confirmed' },
      { start: day(20), end: day(22), paymentId: 'other', uid: 'u9', status: 'confirmed' },
    ] } };
  });
  it('uses the default policy when none is saved, and the saved one when there is', async () => {
    expect(await getCancellationPolicy()).toEqual(P);
    store.settings = { cancellation: { freeDays: 30, partialDays: 10, partialPct: 20 } };
    expect(await getCancellationPolicy()).toEqual({ freeDays: 30, partialDays: 10, partialPct: 20 });
  });
  it('shows the quote to the owner only', async () => {
    expect(await guestCancelQuote('u1', 'early')).toMatchObject({ ok: true, allowed: true, pct: 100, refund: 90 });
    expect(await guestCancelQuote('u2', 'early')).toMatchObject({ ok: false, status: 404 });
    expect(await guestCancelQuote('u1', 'a/b')).toMatchObject({ ok: false, status: 400 });
  });
  it('full refund: frees the dates and queues the payout', async () => {
    const r = await guestCancelBooking('u1', 'early');
    expect(r).toMatchObject({ ok: true, refund: 90, pct: 100 });
    expect(store.bookings.early).toMatchObject({ status: 'cancelled', cancelledBy: 'guest', refundAmount: 90, refundPct: 100 });
    expect(store.payouts['refund-early']).toMatchObject({ kind: 'refund', uid: 'u1', amount: 90, status: 'pending' });
    const ranges = (store.booking_calendars.h1 as { ranges: { paymentId: string }[] }).ranges;
    expect(ranges.map((x) => x.paymentId)).toEqual(['other']);
  });
  it('partial refund and no-refund cancellations', async () => {
    expect(await guestCancelBooking('u1', 'mid')).toMatchObject({ ok: true, refund: 30, pct: 50 });
    expect(store.payouts['refund-mid'].amount).toBe(30);
    expect(await guestCancelBooking('u1', 'late')).toMatchObject({ ok: true, refund: 0, pct: 0 });
    expect(store.payouts?.['refund-late']).toBeUndefined();
    expect(store.bookings.late.status).toBe('cancelled');
  });
  it('refuses someone else, a started stay and a second cancellation', async () => {
    expect(await guestCancelBooking('u2', 'early')).toMatchObject({ ok: false, status: 404 });
    expect(await guestCancelBooking('u1', 'started')).toMatchObject({ ok: false, status: 409 });
    expect(await guestCancelBooking('u1', 'missing')).toMatchObject({ ok: false, status: 404 });
    expect((await guestCancelBooking('u1', 'early')).ok).toBe(true);
    expect(await guestCancelBooking('u1', 'early')).toMatchObject({ ok: false, status: 409 });
    expect(store.payouts['refund-early'].amount).toBe(90);
  });
});
