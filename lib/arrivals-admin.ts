import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { arrivalTotals, groupArrivals, type StayRow } from '@/lib/arrivals';

// Admin: arrivals and departures of confirmed stays over the next `days` days.
export async function adminArrivals(days: number) {
  const snap = await adminDb.collection('bookings').where('status', '==', 'confirmed').limit(2000).get();
  const rows: StayRow[] = snap.docs.map((d) => {
    const x = d.data() as Record<string, unknown>;
    return {
      id: d.id, propertyTitle: String(x.propertyTitle ?? ''), username: String(x.username ?? ''), start: String(x.start ?? ''), end: String(x.end ?? ''),
      nights: Number(x.nights) || 0, ...(Number(x.guests) > 0 ? { guests: Number(x.guests) } : {}), amount: Number(x.amount) || 0, ...(x.guestNote ? { note: String(x.guestNote) } : {}),
    };
  });
  const today = new Date().toISOString().slice(0, 10);
  const groups = groupArrivals(rows, today, days);
  return { from: today, days, groups, totals: arrivalTotals(groups) };
}
