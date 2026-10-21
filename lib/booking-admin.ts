import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { bookingTotals, isCancellableBooking, type Range } from '@/lib/booking-rules';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;
const iso = (v: unknown) => ((v as { toDate?: () => Date })?.toDate ? (v as { toDate: () => Date }).toDate().toISOString() : null);

// Admin: every booking (latest stays first) with the numbers that matter.
export async function adminBookings(max = 100) {
  const snap = await adminDb.collection('bookings').get();
  const rows = snap.docs
    .map((d) => {
      const x = d.data();
      return {
        id: d.id, propertyId: x.propertyId, propertyTitle: x.propertyTitle, propertyType: x.propertyType, username: x.username,
        start: String(x.start ?? ''), end: String(x.end ?? ''), nights: Number(x.nights) || 0, amount: Number(x.amount) || 0, guests: Number(x.guests) || undefined,
        status: x.status, createdAt: iso(x.createdAt),
      };
    })
    .sort((a, b) => b.start.localeCompare(a.start));
  const today = new Date().toISOString().slice(0, 10);
  return { totals: bookingTotals(rows, today), bookings: rows.slice(0, max) };
}

// Admin: cancel a stay. The dates go back on the calendar and the guest gets a pending refund
// (shown in the payouts panel). Safe to repeat: a booking that is already cancelled is refused.
export async function adminCancelBooking(paymentId: string) {
  if (!okId(paymentId)) return { ok: false as const, status: 400, error: 'Invalid booking' };
  const bRef = adminDb.collection('bookings').doc(paymentId);
  const pRef = adminDb.collection('payouts').doc(`refund-${paymentId}`);
  return adminDb.runTransaction(async (tx) => {
    const b = await tx.get(bRef);
    if (!b.exists) return { ok: false as const, status: 404, error: 'Booking not found' };
    const d = b.data() as Record<string, unknown>;
    if (!isCancellableBooking(d.status)) return { ok: false as const, status: 409, error: 'Booking is already cancelled' };
    const propertyId = String(d.propertyId ?? '');
    const cRef = okId(propertyId) ? adminDb.collection('booking_calendars').doc(propertyId) : null;
    const cal = cRef ? await tx.get(cRef) : null;
    if (cRef && cal && cal.exists) {
      const ranges = ((cal.data() as { ranges?: Range[] }).ranges ?? []) as Range[];
      const next = ranges.filter((r) => !(r.paymentId === paymentId && r.status === 'confirmed'));
      if (next.length !== ranges.length) tx.set(cRef, { ranges: next, updatedAt: Timestamp.now() });
    }
    tx.update(bRef, { status: 'cancelled', cancelledAt: Timestamp.now(), cancelledBy: 'admin' });
    tx.set(pRef, {
      kind: 'refund', uid: d.uid, username: d.username, amount: Number(d.amount) || 0, status: 'pending',
      paymentId, bookingId: paymentId, createdAt: Timestamp.now(),
    });
    return { ok: true as const, title: String(d.propertyTitle ?? ''), username: String(d.username ?? ''), amount: Number(d.amount) || 0 };
  });
}
