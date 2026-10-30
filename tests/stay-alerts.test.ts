import { describe, it, expect } from 'vitest';
import { CHECKIN_SOON_DAYS, REPLY_WINDOW_DAYS, REVIEW_WINDOW_DAYS, stayAlerts, type StayBooking } from '@/lib/stay-alerts';

const TODAY = '2026-10-30';
const b = (over: Partial<StayBooking>): StayBooking => ({ id: 'b1', propertyTitle: 'Nile Hotel', start: '2026-11-10', end: '2026-11-12', status: 'confirmed', ...over });
const ids = (rows: StayBooking[]) => stayAlerts(rows, TODAY).map((a) => a.id);

describe('stayAlerts', () => {
  it('gives nothing for no bookings or a bad date', () => {
    expect(stayAlerts([], TODAY)).toEqual([]);
    expect(stayAlerts([b({})], 'nope')).toEqual([]);
    expect(stayAlerts([b({ start: 'x' })], TODAY)).toEqual([]);
  });
  it('warns about a check-in today, tomorrow or within 3 days, not later', () => {
    expect(ids([b({ start: '2026-10-30', end: '2026-11-01' })])).toEqual(['stay-soon-b1']);
    expect(stayAlerts([b({ start: '2026-10-31' })], TODAY)[0].titleAr).toContain('بكرة');
    expect(stayAlerts([b({ start: '2026-10-30' })], TODAY)[0].titleEn).toBe('Check-in today');
    expect(ids([b({ start: '2026-11-02' })])).toEqual(['stay-soon-b1']);
    expect(stayAlerts([b({ start: '2026-11-02' })], TODAY)[0].titleEn).toBe(`Check-in in ${CHECKIN_SOON_DAYS} days`);
    expect(ids([b({ start: '2026-11-03' })])).toEqual([]);
  });
  it('asks to rate a finished stay for two weeks, once', () => {
    const done = b({ start: '2026-10-20', end: '2026-10-25' });
    expect(ids([done])).toEqual(['stay-rate-b1']);
    expect(ids([{ ...done, reviewed: true }])).toEqual([]);
    expect(ids([b({ start: '2026-10-01', end: '2026-10-30' })])).toEqual(['stay-rate-b1']);
    expect(ids([b({ start: '2026-10-01', end: `2026-10-${30 - REVIEW_WINDOW_DAYS - 1}` })])).toEqual([]);
  });
  it('tells the guest about a host reply for a while', () => {
    const replied = b({ start: '2026-10-20', end: '2026-10-25', reviewed: true, hostReply: 'Welcome back' });
    expect(ids([replied])).toEqual(['stay-reply-b1']);
    expect(ids([{ ...replied, hostReply: '  ' }])).toEqual([]);
    expect(ids([{ ...replied, end: '2026-07-01', start: '2026-06-28' }])).toEqual([]);
    expect(REPLY_WINDOW_DAYS).toBeGreaterThan(REVIEW_WINDOW_DAYS);
  });
  it('flags a booking under review, and ignores cancelled ones', () => {
    expect(ids([b({ status: 'review' })])).toEqual(['stay-review-b1']);
    expect(ids([b({ status: 'cancelled', start: '2026-10-30' })])).toEqual([]);
  });
  it('lists the most recent first with stable ids', () => {
    const rows = [b({ id: 'old', start: '2026-10-15', end: '2026-10-20' }), b({ id: 'new', start: '2026-10-20', end: '2026-10-28' })];
    expect(ids(rows)).toEqual(['stay-rate-new', 'stay-rate-old']);
  });
  it('writes Arabic and English text for every alert', () => {
    const all = stayAlerts([b({ start: '2026-10-30' }), b({ id: 'x', start: '2026-10-20', end: '2026-10-25' }), b({ id: 'y', status: 'review' }), b({ id: 'z', start: '2026-10-10', end: '2026-10-20', reviewed: true, hostReply: 'ok' })], TODAY);
    expect(all.length).toBe(4);
    for (const a of all) for (const k of ['titleEn', 'titleAr', 'descriptionEn', 'descriptionAr'] as const) expect(a[k].length).toBeGreaterThan(3);
  });
});
