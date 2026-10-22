import { describe, it, expect, vi, beforeEach } from 'vitest';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      where: (field: string, _op: string, value: unknown) => ({
        limit: () => ({
          get: async () => ({ docs: Object.entries(store[name] ?? {}).filter(([, d]) => d[field] === value).map(([id, d]) => ({ id, data: () => d })) }),
        }),
      }),
    }),
  },
}));

import { groupArrivals, arrivalTotals, parseArrivalWindow, type StayRow } from '@/lib/arrivals';
import { adminArrivals } from '@/lib/arrivals-admin';

const row = (id: string, start: string, end: string, extra: Partial<StayRow> = {}): StayRow => ({ id, propertyTitle: 'Nile Hotel', username: id, start, end, nights: 2, amount: 50, ...extra });

describe('parseArrivalWindow', () => {
  it('accepts 3, 7 and 14, anything else is 7', () => {
    expect(parseArrivalWindow('3')).toBe(3);
    expect(parseArrivalWindow(14)).toBe(14);
    expect(parseArrivalWindow('30')).toBe(7);
    expect(parseArrivalWindow(undefined)).toBe(7);
  });
});

describe('groupArrivals', () => {
  const rows = [
    row('a', '2026-10-14', '2026-10-16'),
    row('b', '2026-10-14', '2026-10-15', { propertyTitle: 'Alpha Flat' }),
    row('c', '2026-10-10', '2026-10-14'),
    row('d', '2026-10-30', '2026-11-02'),
  ];
  it('lists arrivals and departures of each day, in date order, sorted by property', () => {
    const g = groupArrivals(rows, '2026-10-14', 7);
    expect(g.map((x) => x.day)).toEqual(['2026-10-14', '2026-10-15', '2026-10-16']);
    expect(g[0].arrivals.map((r) => r.id)).toEqual(['b', 'a']);
    expect(g[0].departures.map((r) => r.id)).toEqual(['c']);
    expect(g[1].departures.map((r) => r.id)).toEqual(['b']);
    expect(g[2].departures.map((r) => r.id)).toEqual(['a']);
  });
  it('leaves out days with nothing and stays outside the window', () => {
    expect(groupArrivals(rows, '2026-10-14', 3).map((x) => x.day)).toEqual(['2026-10-14', '2026-10-15', '2026-10-16']);
    expect(groupArrivals(rows, '2026-10-17', 7)).toEqual([]);
    expect(groupArrivals(rows, 'bad', 7)).toEqual([]);
    expect(groupArrivals(rows, '2026-10-14', 0)).toEqual([]);
  });
  it('counts totals and the guests who arrive (1 when unknown)', () => {
    const g = groupArrivals([row('a', '2026-10-14', '2026-10-16', { guests: 3 }), row('b', '2026-10-14', '2026-10-15')], '2026-10-14', 7);
    expect(arrivalTotals(g)).toEqual({ arrivals: 2, departures: 2, guests: 4 });
  });
});

describe('adminArrivals', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    const today = new Date().toISOString().slice(0, 10);
    const plus = (n: number) => new Date(Date.parse(`${today}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
    store.bookings = {
      in1: { status: 'confirmed', username: 'sara', propertyTitle: 'Nile Hotel', start: today, end: plus(2), nights: 2, guests: 2, amount: 60, guestNote: 'Late check-in' },
      out1: { status: 'confirmed', username: 'omar', propertyTitle: 'Nile Hotel', start: plus(-3), end: today, nights: 3, amount: 90 },
      later: { status: 'confirmed', username: 'ali', propertyTitle: 'Nile Hotel', start: plus(40), end: plus(42), nights: 2, amount: 60 },
      gone: { status: 'cancelled', username: 'zed', propertyTitle: 'Nile Hotel', start: today, end: plus(1), nights: 1, amount: 30 },
    };
  });
  it('shows confirmed stays only, with the guest request', async () => {
    const r = await adminArrivals(7);
    expect(r.groups[0].arrivals.map((x) => x.id)).toEqual(['in1']);
    expect(r.groups[0].arrivals[0]).toMatchObject({ guests: 2, note: 'Late check-in' });
    expect(r.groups[0].departures.map((x) => x.id)).toEqual(['out1']);
    expect(JSON.stringify(r)).not.toContain('zed');
    expect(JSON.stringify(r)).not.toContain('ali');
    expect(r.totals).toEqual({ arrivals: 1, departures: 2, guests: 2 });
  });
});
