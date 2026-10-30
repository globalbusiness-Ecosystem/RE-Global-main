import { DAY_MS, activeRanges, isBlock, parseDay, type Range } from './booking-rules';

// Occupancy of a hotel / rental over a window of days. Pure: no Firebase.
// Guest stays and payments in progress count as booked; days the admin closed are not for sale, so they are
// left out of the rate. Dates are 'YYYY-MM-DD' (UTC), a night belongs to its start day.

export const WINDOWS = [7, 30, 90] as const;
export const parseWindow = (raw: unknown): number => {
  const n = Number(raw);
  return (WINDOWS as readonly number[]).includes(n) ? n : 30;
};

const dayAt = (fromMs: number, i: number) => new Date(fromMs + i * DAY_MS).toISOString().slice(0, 10);
const covering = (live: Range[], day: string) => live.filter((r) => r.start <= day && day < r.end);

export type Occupancy = { booked: number; blocked: number; free: number; sellable: number; rate: number | null };

export function occupancy(ranges: Range[], fromDay: string, days: number, nowMs: number): Occupancy {
  const from = parseDay(fromDay);
  if (from === null || !Number.isInteger(days) || days < 1) return { booked: 0, blocked: 0, free: 0, sellable: 0, rate: null };
  const live = activeRanges(ranges, nowMs);
  let booked = 0;
  let blocked = 0;
  for (let i = 0; i < days; i++) {
    const hit = covering(live, dayAt(from, i));
    if (hit.some(isBlock)) blocked++;
    else if (hit.length) booked++;
  }
  const sellable = days - blocked;
  return { booked, blocked, free: sellable - booked, sellable, rate: sellable > 0 ? Math.round((booked / sellable) * 1000) / 10 : null };
}

// The first night from `fromDay` that nothing covers, looking up to `horizon` days ahead (null when there is none).
export function nextFreeNight(ranges: Range[], fromDay: string, nowMs: number, horizon = 365): string | null {
  const from = parseDay(fromDay);
  if (from === null) return null;
  const live = activeRanges(ranges, nowMs);
  for (let i = 0; i < horizon; i++) {
    const d = dayAt(from, i);
    if (!covering(live, d).length) return d;
  }
  return null;
}

// All listings together: booked nights over sellable nights.
export function overallRate(rows: { booked: number; sellable: number }[]): number | null {
  const sellable = rows.reduce((n, r) => n + r.sellable, 0);
  if (sellable <= 0) return null;
  return Math.round((rows.reduce((n, r) => n + r.booked, 0) / sellable) * 1000) / 10;
}

// A plain-words pricing hint from the occupancy rate. Advice for the admin only: nothing changes a price by itself.
// It needs enough sellable nights to mean something (a 7-night window with 2 nights is noise).
export const HINT_MIN_SELLABLE = 7;
export const HINT_HIGH = 85;
export const HINT_LOW = 25;
export type PriceHint = 'raise' | 'lower' | null;

export function priceHint(rate: number | null, sellable: number): PriceHint {
  if (rate === null || !Number.isFinite(rate) || sellable < HINT_MIN_SELLABLE) return null;
  if (rate >= HINT_HIGH) return 'raise';
  if (rate <= HINT_LOW) return 'lower';
  return null;
}
