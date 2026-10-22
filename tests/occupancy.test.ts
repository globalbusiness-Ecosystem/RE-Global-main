import { describe, it, expect, vi, beforeEach } from 'vitest';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      limit: () => ({ get: async () => ({ docs: Object.entries(store[name] ?? {}).map(([id, d]) => ({ id, data: () => d })) }) }),
    }),
  },
}));

import { occupancy, nextFreeNight, overallRate, parseWindow } from '@/lib/occupancy';
import { adminOccupancy } from '@/lib/occupancy-admin';
import type { Range } from '@/lib/booking-rules';

const NOW = Date.parse('2026-10-14T12:00:00Z');
const stay = (start: string, end: string, status: 'hold' | 'confirmed' = 'confirmed', extra: Partial<Range> = {}): Range => ({ start, end, paymentId: 'p', uid: 'u', status, expiresAtMs: NOW + 1000, ...extra });
const blk = (start: string, end: string): Range => stay(start, end, 'confirmed', { block: true });

describe('parseWindow', () => {
  it('accepts 7, 30 and 90, anything else is 30', () => {
    expect(parseWindow('7')).toBe(7);
    expect(parseWindow(90)).toBe(90);
    expect(parseWindow('15')).toBe(30);
    expect(parseWindow(undefined)).toBe(30);
  });
});

describe('occupancy', () => {
  it('counts booked nights inside the window only', () => {
    // nights Oct 14..20 (7 days); the stay covers Oct 16,17,18 (check-out day 19 is free)
    expect(occupancy([stay('2026-10-16', '2026-10-19')], '2026-10-14', 7, NOW)).toEqual({ booked: 3, blocked: 0, free: 4, sellable: 7, rate: 42.9 });
    // a stay that starts before the window counts only its nights inside it
    expect(occupancy([stay('2026-10-10', '2026-10-16')], '2026-10-14', 7, NOW).booked).toBe(2);
    expect(occupancy([stay('2026-12-01', '2026-12-05')], '2026-10-14', 7, NOW).booked).toBe(0);
  });
  it('leaves closed days out of the rate', () => {
    const o = occupancy([blk('2026-10-14', '2026-10-18'), stay('2026-10-18', '2026-10-20')], '2026-10-14', 7, NOW);
    expect(o).toEqual({ booked: 2, blocked: 4, free: 1, sellable: 3, rate: 66.7 });
  });
  it('counts payments in progress but not expired ones', () => {
    expect(occupancy([stay('2026-10-14', '2026-10-16', 'hold')], '2026-10-14', 7, NOW).booked).toBe(2);
    expect(occupancy([stay('2026-10-14', '2026-10-16', 'hold', { expiresAtMs: NOW - 1 })], '2026-10-14', 7, NOW).booked).toBe(0);
  });
  it('has no rate when every day is closed, and survives bad input', () => {
    expect(occupancy([blk('2026-10-14', '2026-10-21')], '2026-10-14', 7, NOW).rate).toBeNull();
    expect(occupancy([], 'bad', 7, NOW).rate).toBeNull();
    expect(occupancy([], '2026-10-14', 0, NOW).sellable).toBe(0);
    expect(occupancy([], '2026-10-14', 7, NOW)).toEqual({ booked: 0, blocked: 0, free: 7, sellable: 7, rate: 0 });
  });
});

describe('nextFreeNight / overallRate', () => {
  it('finds the first night nothing covers', () => {
    expect(nextFreeNight([], '2026-10-14', NOW)).toBe('2026-10-14');
    expect(nextFreeNight([stay('2026-10-14', '2026-10-17'), blk('2026-10-17', '2026-10-20')], '2026-10-14', NOW)).toBe('2026-10-20');
    expect(nextFreeNight([stay('2026-10-14', '2026-10-30')], '2026-10-14', NOW, 5)).toBeNull();
    expect(nextFreeNight([], 'bad', NOW)).toBeNull();
  });
  it('combines listings by sellable nights, not by averaging rates', () => {
    expect(overallRate([{ booked: 7, sellable: 7 }, { booked: 0, sellable: 21 }])).toBe(25);
    expect(overallRate([{ booked: 0, sellable: 0 }])).toBeNull();
    expect(overallRate([])).toBeNull();
  });
});

describe('adminOccupancy', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    const today = new Date().toISOString().slice(0, 10);
    const plus = (n: number) => new Date(Date.parse(`${today}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
    store.properties = {
      busy: { title: 'Busy Hotel', type: 'hotel' },
      quiet: { title: 'Quiet Flat', type: 'rent' },
      sale: { title: 'Villa', type: 'buy' },
    };
    store.booking_calendars = {
      busy: { ranges: [{ start: plus(0), end: plus(5), paymentId: 'a', uid: 'u', status: 'confirmed' }] },
    };
  });
  it('lists hotels and rentals only, busiest first, with the first free night', async () => {
    const r = await adminOccupancy(7);
    expect(r.rows.map((x) => x.id)).toEqual(['busy', 'quiet']);
    expect(r.rows[0]).toMatchObject({ booked: 5, free: 2, rate: 71.4 });
    expect(r.rows[1]).toMatchObject({ booked: 0, rate: 0 });
    expect(r.rows[0].nextFree).toBe(r.rows[0].nextFree && new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10));
    expect(r.overall).toBe(35.7);
  });
});
