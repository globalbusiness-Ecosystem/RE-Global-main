import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_POLICY, policyOf, refundQuote, type CancellationPolicy } from '@/lib/cancellation';
import type { Range } from '@/lib/booking-rules';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;
const todayUtc = () => new Date().toISOString().slice(0, 10);

// The policy the admin set (settings/cancellation), or the default. Never throws.
export async function getCancellationPolicy(): Promise<CancellationPolicy> {
  try {
    const s = await adminDb.collection('settings').doc('cancellation').get();
    return policyOf(s.exists ? s.data() : undefined);
  } catch {
    return DEFAULT_POLICY;
  }
}

// What the guest would get back if they cancelled now (shown before they confirm).
export async function guestCancelQuote(uid: string, bookingId: unknown) {
  if (!okId(bookingId)) return { ok: false as const, status: 400, error: 'Invalid booking' };
  const [b, policy] = await Promise.all([adminDb.collection('bookings').doc(bookingId).get(), getCancellationPolicy()]);
  const d = b.exists ? (b.data() as Record<string, unknown>) : null;
  if (!d || d.uid !== uid) return { ok: false as const, status: 404, error: 'Booking not found' };
  return { ok: true as const, ...refundQuote(policy, { status: d.status, start: String(d.start ?? ''), amount: Number(d.amount) || 0 }, todayUtc()) };
}

// The guest cancels their own stay: the dates go back on the calendar and the refund the policy allows is queued
// as a pending payout (paid by the admin). Repeating the call is safe: a cancelled booking is refused.
export async function guestCancelBooking(uid: string, bookingId: unknown) {
  if (!okId(bookingId)) return { ok: false as const, status: 400, error: 'Invalid booking' };
  const policy = await getCancellationPolicy();
  const bRef = adminDb.collection('bookings').doc(bookingId);
  const pRef = adminDb.collection('payouts').doc(`refund-${bookingId}`);
  return adminDb.runTransaction(async (tx) => {
    const b = await tx.get(bRef);
    const d = b.exists ? (b.data() as Record<string, unknown>) : null;
    if (!d || d.uid !== uid) return { ok: false as const, status: 404, error: 'Booking not found' };
    const q = refundQuote(policy, { status: d.status, start: String(d.start ?? ''), amount: Number(d.amount) || 0 }, todayUtc());
    if (!q.allowed) {
      return { ok: false as const, status: 409, error: q.reason === 'started' ? 'This stay has already started' : 'This booking cannot be cancelled here' };
    }
    const propertyId = String(d.propertyId ?? '');
    const cRef = okId(propertyId) ? adminDb.collection('booking_calendars').doc(propertyId) : null;
    const cal = cRef ? await tx.get(cRef) : null;
    if (cRef && cal && cal.exists) {
      const ranges = ((cal.data() as { ranges?: Range[] }).ranges ?? []) as Range[];
      const next = ranges.filter((r) => !(r.paymentId === bookingId && r.status === 'confirmed'));
      if (next.length !== ranges.length) tx.set(cRef, { ranges: next, updatedAt: Timestamp.now() });
    }
    tx.update(bRef, { status: 'cancelled', cancelledAt: Timestamp.now(), cancelledBy: 'guest', refundAmount: q.refund, refundPct: q.pct });
    if (q.refund > 0) {
      tx.set(pRef, { kind: 'refund', uid: d.uid, username: d.username, amount: q.refund, status: 'pending', paymentId: bookingId, bookingId, createdAt: Timestamp.now() });
    }
    return { ok: true as const, refund: q.refund, pct: q.pct };
  });
}
