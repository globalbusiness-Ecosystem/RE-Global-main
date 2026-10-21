import { describe, it, expect } from 'vitest';
import { validateBlock, decideBlock, decideBooking, isBlock, type Range } from '@/lib/booking-rules';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

const NOW = Date.parse('2026-10-14T12:00:00Z');
const blk = (start: string, end: string): Range => ({ start, end, paymentId: 'block-1', uid: 'admin', username: 'admin', status: 'confirmed', block: true });
const stay = (start: string, end: string, status: 'hold' | 'confirmed' = 'confirmed'): Range => ({ start, end, paymentId: 'p1', uid: 'u1', status, expiresAtMs: NOW + 1000 });

describe('validateBlock', () => {
  it('accepts a valid range and cleans the note', () => {
    expect(validateBlock({ start: '2026-10-20', end: '2026-10-25', note: '  Painting\n' }, NOW)).toEqual({ ok: true, start: '2026-10-20', end: '2026-10-25', nights: 5, note: 'Painting' });
    expect(validateBlock({ start: '2026-10-14', end: '2026-10-15' }, NOW)).toMatchObject({ ok: true, note: '' });
  });
  it('limits the note length', () => {
    const r = validateBlock({ start: '2026-10-20', end: '2026-10-21', note: 'x'.repeat(500) }, NOW);
    expect(r.ok && r.note.length).toBe(120);
  });
  it('rejects bad input', () => {
    expect(validateBlock({}, NOW).ok).toBe(false);
    expect(validateBlock({ start: '2026-10-10', end: '2026-10-12' }, NOW).ok).toBe(false);
    expect(validateBlock({ start: '2026-10-20', end: '2026-10-20' }, NOW).ok).toBe(false);
    expect(validateBlock({ start: '2026-10-25', end: '2026-10-20' }, NOW).ok).toBe(false);
    expect(validateBlock({ start: '2026-10-20', end: '2028-10-20' }, NOW).ok).toBe(false);
  });
});

describe('decideBlock', () => {
  it('allows free dates and keeps the existing ranges', () => {
    const r = decideBlock([stay('2026-10-20', '2026-10-22')], { start: '2026-10-22', end: '2026-10-25' }, NOW);
    expect(r.ok && r.ranges).toHaveLength(1);
  });
  it('refuses dates that a stay, a hold or another block already use', () => {
    expect(decideBlock([stay('2026-10-20', '2026-10-24')], { start: '2026-10-22', end: '2026-10-26' }, NOW).ok).toBe(false);
    expect(decideBlock([stay('2026-10-20', '2026-10-24', 'hold')], { start: '2026-10-23', end: '2026-10-26' }, NOW).ok).toBe(false);
    expect(decideBlock([blk('2026-10-20', '2026-10-24')], { start: '2026-10-21', end: '2026-10-22' }, NOW).ok).toBe(false);
  });
  it('ignores expired holds', () => {
    const old: Range = { ...stay('2026-10-20', '2026-10-24', 'hold'), expiresAtMs: NOW - 1 };
    expect(decideBlock([old], { start: '2026-10-21', end: '2026-10-22' }, NOW).ok).toBe(true);
  });
});

describe('a closed date range stops guests from booking', () => {
  it('blocks a booking on closed nights but not on the check-out day', () => {
    const ranges = [blk('2026-10-20', '2026-10-25')];
    expect(decideBooking(ranges, { start: '2026-10-22', end: '2026-10-24', paymentId: 'pay', uid: 'u9' }, NOW).ok).toBe(false);
    expect(decideBooking(ranges, { start: '2026-10-25', end: '2026-10-27', paymentId: 'pay', uid: 'u9' }, NOW).ok).toBe(true);
  });
  it('recognises blocks', () => {
    expect(isBlock(blk('2026-10-20', '2026-10-25'))).toBe(true);
    expect(isBlock(stay('2026-10-20', '2026-10-25'))).toBe(false);
  });
});

describe('audit log text', () => {
  it('has labels and summaries', () => {
    expect(auditLabel('booking.block')).not.toBe('booking.block');
    expect(auditLabel('booking.unblock')).not.toBe('booking.unblock');
    expect(auditSummary('booking.block', { title: 'Nile Hotel', start: '2026-10-20', end: '2026-10-25', note: 'Paint' })).toBe('Nile Hotel · 2026-10-20 → 2026-10-25 · Paint');
  });
});
