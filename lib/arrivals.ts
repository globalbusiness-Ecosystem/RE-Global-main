import { DAY_MS, parseDay } from './booking-rules';

// Who arrives and who leaves, day by day. Pure: no Firebase. Only confirmed stays are passed in.
// A guest arrives on `start` and leaves on `end` (the check-out day), both 'YYYY-MM-DD'.

export type StayRow = { id: string; propertyTitle: string; username: string; start: string; end: string; nights: number; guests?: number; note?: string; amount: number };
export type ArrivalDay = { day: string; arrivals: StayRow[]; departures: StayRow[] };

export const ARRIVAL_WINDOWS = [3, 7, 14] as const;
export const parseArrivalWindow = (raw: unknown): number => {
  const n = Number(raw);
  return (ARRIVAL_WINDOWS as readonly number[]).includes(n) ? n : 7;
};

const byTitle = (a: StayRow, b: StayRow) => a.propertyTitle.localeCompare(b.propertyTitle) || a.username.localeCompare(b.username);

// The days from `fromDay` on (`days` of them) that have at least one arrival or departure, in date order.
export function groupArrivals(rows: StayRow[], fromDay: string, days: number): ArrivalDay[] {
  const from = parseDay(fromDay);
  if (from === null || !Number.isInteger(days) || days < 1) return [];
  const out: ArrivalDay[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(from + i * DAY_MS).toISOString().slice(0, 10);
    const arrivals = rows.filter((r) => r.start === day).sort(byTitle);
    const departures = rows.filter((r) => r.end === day).sort(byTitle);
    if (arrivals.length || departures.length) out.push({ day, arrivals, departures });
  }
  return out;
}

export const arrivalTotals = (groups: ArrivalDay[]) => ({
  arrivals: groups.reduce((n, g) => n + g.arrivals.length, 0),
  departures: groups.reduce((n, g) => n + g.departures.length, 0),
  guests: groups.reduce((n, g) => n + g.arrivals.reduce((m, r) => m + (r.guests ?? 1), 0), 0),
});
