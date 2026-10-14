import { describe, it, expect } from 'vitest';
import { decideReservation, decideSale, isExclusiveType } from '@/lib/property-lifecycle';

const now = 1_000_000;
describe('decideReservation', () => {
  it('lets anyone pay for non-exclusive types', () => {
    expect(decideReservation({ type: 'rent', status: 'sold' }, null, 'u1', now)).toEqual({ ok: true });
    expect(decideReservation({ type: 'invest' }, { uid: 'u2', expiresAtMs: now + 999 }, 'u1', now)).toEqual({ ok: true });
  });
  it('refuses sold exclusive properties', () => {
    expect(decideReservation({ type: 'buy', status: 'sold' }, null, 'u1', now)).toEqual({ ok: false, code: 'sold' });
  });
  it('refuses while another buyer holds it, but not after expiry or for the holder', () => {
    expect(decideReservation({ type: 'buy', status: 'available' }, { uid: 'u2', expiresAtMs: now + 1 }, 'u1', now)).toEqual({ ok: false, code: 'reserved' });
    expect(decideReservation({ type: 'buy', status: 'available' }, { uid: 'u2', expiresAtMs: now - 1 }, 'u1', now)).toEqual({ ok: true });
    expect(decideReservation({ type: 'offplan', status: 'under_construction' }, { uid: 'u1', expiresAtMs: now + 1 }, 'u1', now)).toEqual({ ok: true });
  });
});

describe('decideSale', () => {
  it('marks the first sale, accepts retries, flags a second payer', () => {
    expect(decideSale({ status: 'available' }, 'p1')).toBe('mark');
    expect(decideSale({ status: 'sold', soldPaymentId: 'p1' }, 'p1')).toBe('already');
    expect(decideSale({ status: 'sold', soldPaymentId: 'p1' }, 'p2')).toBe('conflict');
    expect(decideSale({ status: 'sold' }, 'p2')).toBe('conflict');
  });
  it('knows which types are exclusive', () => {
    expect(isExclusiveType('buy')).toBe(true);
    expect(isExclusiveType('abroad')).toBe(true);
    expect(isExclusiveType('rent')).toBe(false);
    expect(isExclusiveType(undefined)).toBe(false);
  });
});
