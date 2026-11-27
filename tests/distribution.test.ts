import { describe, it, expect } from 'vitest';
import { DAY_MS, computeRun, dayOf, parsePeriod, periodsOverlap, shareDays, type LedgerEvent, type Period } from '@/lib/distribution';

const t = (d: string, h = 12) => Date.parse(`${d}T${String(h).padStart(2, '0')}:00:00Z`);
const P = (a: string, b: string): Period => { const r = parsePeriod(a, b); if (!r.ok) throw new Error(r.error); return r.period; };
const ev = (uid: string, day: string, delta: number, h = 12): LedgerEvent => ({ uid, username: uid, at: t(day, h), delta });

describe('period', () => {
  it('counts both ends, so one day is a period', () => {
    expect(P('2026-01-01', '2026-01-01').days).toBe(1);
    expect(P('2026-01-01', '2026-01-31').days).toBe(31);
    expect(P('2026-02-01', '2026-02-28').days).toBe(28);
  });
  it('refuses a bad, reversed, impossible or too long period', () => {
    expect(parsePeriod('2026-1-1', '2026-01-31').ok).toBe(false);
    expect(parsePeriod('2026-02-01', '2026-01-01').ok).toBe(false);
    expect(parsePeriod('2026-02-30', '2026-03-01').ok).toBe(false);
    expect(parsePeriod('2026-01-01', '2027-03-01').ok).toBe(false);
    expect(parsePeriod(undefined, undefined).ok).toBe(false);
  });
  it('overlap is by shared days', () => {
    expect(periodsOverlap({ start: '2026-01-01', end: '2026-01-31' }, { start: '2026-01-31', end: '2026-02-10' })).toBe(true);
    expect(periodsOverlap({ start: '2026-01-01', end: '2026-01-31' }, { start: '2026-02-01', end: '2026-02-10' })).toBe(false);
  });
});

describe('share-days', () => {
  const p = P('2026-01-01', '2026-01-10'); // 10 days
  it('a holder from before the period earns every day', () => {
    const h = shareDays([ev('a', '2025-12-01', 10)], p);
    expect(h).toEqual([{ uid: 'a', username: 'a', shareDays: 100, sharesAtEnd: 10 }]);
  });
  it('a purchase counts from its own day (held at the end of that day)', () => {
    expect(shareDays([ev('a', '2026-01-04', 5)], p)[0].shareDays).toBe(5 * 7); // days 4..10
  });
  it('a sale during the period: the seller loses the day of the sale, the buyer gains it', () => {
    const e = [ev('a', '2025-12-01', 10), ev('a', '2026-01-04', -10), ev('b', '2026-01-04', 10)];
    const h = Object.fromEntries(shareDays(e, p).map((x) => [x.uid, x]));
    expect(h.a.shareDays).toBe(10 * 3); // days 1..3
    expect(h.b.shareDays).toBe(10 * 7); // days 4..10
    expect(h.a.shareDays + h.b.shareDays).toBe(100); // the 10 Shares are paid for every day exactly once
    expect(h.a.sharesAtEnd).toBe(0);
    expect(h.b.sharesAtEnd).toBe(10);
  });
  it('events after the period are ignored, events before it set the starting position', () => {
    const e = [ev('a', '2025-06-01', 4), ev('a', '2025-12-31', 2), ev('a', '2026-01-11', -6)];
    expect(shareDays(e, p)[0]).toMatchObject({ shareDays: 60, sharesAtEnd: 6 });
  });
  it('events in any order, and a holder who ends at zero before the period earns nothing', () => {
    const e = [ev('a', '2025-12-10', -3), ev('a', '2025-12-01', 3)];
    expect(shareDays(e, p)).toEqual([]);
  });
  it('bad events are skipped and the holder never goes below zero', () => {
    const e = [{ uid: '', username: 'x', at: 1, delta: 5 }, { uid: 'a', username: 'a', at: NaN, delta: 5 }, { uid: 'a', username: 'a', at: t('2025-12-01'), delta: 1.5 }, ev('a', '2025-12-02', -4)];
    expect(shareDays(e, p)).toEqual([]);
  });
  it('the day boundary is UTC midnight', () => {
    expect(dayOf(Date.parse('2026-01-04T23:59:59Z'))).toBe(dayOf(Date.parse('2026-01-04T00:00:00Z')));
    expect(dayOf(Date.parse('2026-01-05T00:00:00Z'))).toBe(dayOf(Date.parse('2026-01-04T00:00:00Z')) + 1);
    expect(DAY_MS).toBe(86400000);
  });
});

describe('the run', () => {
  const p = P('2026-01-01', '2026-01-10');
  const hold = (uid: string, sd: number, s = 0) => ({ uid, username: uid, shareDays: sd, sharesAtEnd: s });

  it('pays pro rata to share-days and leaves the unsold part unallocated', () => {
    // 100 Shares in the property, 10 days: 1000 share-days in all. a holds 20 Shares all period, b holds 30.
    const r = computeRun({ gross: 1000, feePct: 0, totalShares: 100, period: p, holders: [hold('a', 200, 20), hold('b', 300, 30)] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.run.rows.map((x) => [x.uid, x.amount])).toEqual([['a', 200], ['b', 300]]);
    expect(r.run.allocated).toBe(500);
    expect(r.run.unallocated).toBe(500);
  });
  it('takes the platform fee first', () => {
    const r = computeRun({ gross: 1000, feePct: 10, totalShares: 100, period: p, holders: [hold('a', 1000, 100)] });
    expect(r.ok && r.run.fee).toBe(100);
    expect(r.ok && r.run.net).toBe(900);
    expect(r.ok && r.run.rows[0].amount).toBe(900);
    expect(r.ok && r.run.unallocated).toBe(0);
  });
  it('never pays more than the net amount, whatever the split (dust stays unallocated)', () => {
    for (const n of [3, 7, 11, 13, 97]) {
      const holders = Array.from({ length: n }, (_, i) => hold(`u${i}`, 1 + i, 1));
      const total = holders.reduce((a, h) => a + h.shareDays, 0);
      const r = computeRun({ gross: 100.0001, feePct: 3.33, totalShares: Math.ceil(total / 10), period: p, holders });
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      const paid = r.run.rows.reduce((a, x) => a + Math.round(x.amount * 1e4), 0);
      expect(paid).toBeLessThanOrEqual(Math.round(r.run.net * 1e4));
      expect(Math.round(r.run.allocated * 1e4)).toBe(paid);
      expect(Math.round((r.run.allocated + r.run.unallocated) * 1e4)).toBe(Math.round(r.run.net * 1e4));
      for (const x of r.run.rows) expect(x.amount).toBeGreaterThan(0);
    }
  });
  it('a third each of 100 leaves the 1 unit of dust unallocated', () => {
    const r = computeRun({ gross: 100, feePct: 0, totalShares: 3, period: P('2026-01-01', '2026-01-01'), holders: [hold('a', 1), hold('b', 1), hold('c', 1)] });
    expect(r.ok && r.run.rows.map((x) => x.amount)).toEqual([33.3333, 33.3333, 33.3333]);
    expect(r.ok && r.run.unallocated).toBe(0.0001);
  });
  it('refuses a ledger with more Shares than the property has', () => {
    const r = computeRun({ gross: 100, feePct: 0, totalShares: 10, period: p, holders: [hold('a', 101)] });
    expect(r.ok).toBe(false);
  });
  it('refuses bad amounts, fees and share counts', () => {
    const ok = { feePct: 0, totalShares: 10, period: p, holders: [] };
    expect(computeRun({ ...ok, gross: 0 }).ok).toBe(false);
    expect(computeRun({ ...ok, gross: -5 }).ok).toBe(false);
    expect(computeRun({ ...ok, gross: 'abc' }).ok).toBe(false);
    expect(computeRun({ ...ok, gross: 100, feePct: 60 }).ok).toBe(false);
    expect(computeRun({ ...ok, gross: 100, feePct: -1 }).ok).toBe(false);
    expect(computeRun({ ...ok, gross: 100, totalShares: 0 }).ok).toBe(false);
    expect(computeRun({ ...ok, gross: 100 }).ok).toBe(true);
  });
  it('the same inputs always give the same rows', () => {
    const i = { gross: 123.4567, feePct: 2.5, totalShares: 75000, period: p, holders: [hold('a', 180, 18), hold('b', 99999, 9999)] };
    expect(JSON.stringify(computeRun(i))).toBe(JSON.stringify(computeRun(i)));
  });
  it('end to end: a sale in the middle of the period splits one Share holder day by day', () => {
    const e = [ev('a', '2025-12-01', 10), ev('a', '2026-01-06', -10), ev('b', '2026-01-06', 10)];
    const holders = shareDays(e, p);
    const r = computeRun({ gross: 100, feePct: 0, totalShares: 10, period: p, holders });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const m = Object.fromEntries(r.run.rows.map((x) => [x.uid, x.amount]));
      expect(m).toEqual({ a: 50, b: 50 });
      expect(r.run.unallocated).toBe(0);
    }
  });
});
