import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { isBookingType, type Range } from '@/lib/booking-rules';
import { nextFreeNight, occupancy, overallRate } from '@/lib/occupancy';

// Admin: occupancy of every hotel and rental over the next `days` days, busiest first.
export async function adminOccupancy(days: number) {
  const [props, cals] = await Promise.all([
    adminDb.collection('properties').limit(500).get(),
    adminDb.collection('booking_calendars').limit(500).get(),
  ]);
  const ranges = new Map<string, Range[]>();
  for (const c of cals.docs) {
    const r = (c.data() as { ranges?: Range[] }).ranges;
    ranges.set(c.id, Array.isArray(r) ? r : []);
  }
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  const rows = props.docs
    .filter((p) => isBookingType((p.data() as Record<string, unknown>).type))
    .map((p) => {
      const d = p.data() as Record<string, unknown>;
      const rs = ranges.get(p.id) ?? [];
      return { id: p.id, title: String(d.title ?? ''), type: String(d.type ?? ''), ...occupancy(rs, today, days, now), nextFree: nextFreeNight(rs, today, now) };
    })
    .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || a.title.localeCompare(b.title));
  return { days, from: today, overall: overallRate(rows), rows };
}
