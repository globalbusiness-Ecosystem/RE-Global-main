import { describe, it, expect } from 'vitest';
import { parseDay, validateBooking, bookingTotal, overlaps, decideBooking, activeRanges, type Range } from '@/lib/booking-rules';

const NOW = Date.parse('2026-10-14T12:00:00Z');
const hold = (start: string, end: string, uid = 'u1', paymentId = 'p1', expiresAtMs = NOW + 1000): Range => ({ start, end, uid, paymentId, status: 'hold', expiresAtMs });
const conf = (start: string, end: string, uid = 'u1', paymentId = 'p1'): Range => ({ start, end, uid, paymentId, status: 'confirmed' });

describe('parseDay', () => {
  it('accepts real dates only', () => {
    expect(parseDay('2026-10-14')).not.toBeNull();
    expect(parseDay('2026-02-30')).toBeNull();
    expect(parseDay('14/10/2026')).toBeNull();
    expect(parseDay(5)).toBeNull();
  });
});

describe('validateBooking', () => {
  it('counts nights and enforces limits per type', () => {
    expect(validateBooking('hotel', { start: '2026-10-20', end: '2026-10-23' }, NOW)).toMatchObject({ ok: true, nights: 3 });
    expect(validateBooking('hotel', { start: '2026-10-20', end: '2026-10-20' }, NOW).ok).toBe(false);
    expect(validateBooking('hotel', { start: '2026-10-20', end: '2027-01-20' }, NOW).ok).toBe(false);
    expect(validateBooking('rent', { start: '2026-11-01', end: '2026-11-10' }, NOW).ok).toBe(false);
    expect(validateBooking('rent', { start: '2026-11-01', end: '2026-12-01' }, NOW)).toMatchObject({ ok: true, nights: 30 });
  });
  it('rejects past starts unless allowed, tolerates yesterday', () => {
    expect(validateBooking('hotel', { start: '2026-10-01', end: '2026-10-03' }, NOW).ok).toBe(false);
    expect(validateBooking('hotel', { start: '2026-10-01', end: '2026-10-03' }, NOW, { allowPast: true }).ok).toBe(true);
    expect(validateBooking('hotel', { start: '2026-10-13', end: '2026-10-15' }, NOW).ok).toBe(true);
  });
  it('rejects junk and unknown types', () => {
    expect(validateBooking('hotel', null, NOW).ok).toBe(false);
    expect(validateBooking('buy', { start: '2026-10-20', end: '2026-10-23' }, NOW).ok).toBe(false);
  });
});

describe('bookingTotal', () => {
  it('hotel is per night, rent is pro rata per 30 nights, rounded up', () => {
    expect(bookingTotal('hotel', 10, 3)).toBe(30);
    expect(bookingTotal('rent', 300, 30)).toBe(300);
    expect(bookingTotal('rent', 100, 45)).toBe(150);
    expect(bookingTotal('rent', 100, 31)).toBe(103.34);
    expect(bookingTotal('hotel', 0, 3)).toBeNull();
    expect(bookingTotal('hotel', 10, 0)).toBeNull();
  });
});

describe('overlaps and decideBooking', () => {
  it('same-day checkout / check-in does not collide', () => {
    expect(overlaps({ start: '2026-10-20', end: '2026-10-23' }, { start: '2026-10-23', end: '2026-10-25' })).toBe(false);
    expect(overlaps({ start: '2026-10-20', end: '2026-10-23' }, { start: '2026-10-22', end: '2026-10-25' })).toBe(true);
  });
  const req = { start: '2026-10-21', end: '2026-10-24', paymentId: 'pX', uid: 'u2' };
  it('refuses dates taken by a confirmed stay or a live hold of someone else', () => {
    expect(decideBooking([conf('2026-10-20', '2026-10-22')], req, NOW).ok).toBe(false);
    expect(decideBooking([hold('2026-10-20', '2026-10-22')], req, NOW).ok).toBe(false);
  });
  it('ignores expired holds, own holds, own payment and ended stays', () => {
    expect(decideBooking([hold('2026-10-20', '2026-10-22', 'u1', 'p1', NOW - 1)], req, NOW).ok).toBe(true);
    expect(decideBooking([hold('2026-10-20', '2026-10-22', 'u2', 'pOld')], req, NOW).ok).toBe(true);
    expect(decideBooking([conf('2026-10-20', '2026-10-22', 'u1', 'pX')], req, NOW).ok).toBe(true);
    expect(decideBooking([conf('2026-09-01', '2026-09-05')], req, NOW).ok).toBe(true);
  });
  it('prunes expired and finished ranges', () => {
    const r = activeRanges([hold('2026-10-20', '2026-10-22', 'u', 'a', NOW - 1), conf('2026-09-01', '2026-09-05'), conf('2026-10-20', '2026-10-22')], NOW);
    expect(r).toHaveLength(1);
  });
});
