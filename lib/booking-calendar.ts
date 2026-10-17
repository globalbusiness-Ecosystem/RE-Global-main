import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { alertReview } from '@/lib/admin-alert';
import { HOLD_MS, activeRanges, decideBooking, type BookingDates, type Range } from '@/lib/booking-rules';

const okId = (id: string) => !!id && !id.includes('/') && id.length <= 128;
const calRef = (propertyId: string) => adminDb.collection('booking_calendars').doc(propertyId);
const read = (d: { exists: boolean; data(): unknown }): Range[] => {
  const r = d.exists ? (d.data() as { ranges?: Range[] }).ranges : [];
  return Array.isArray(r) ? r : [];
};

// Payment about to be approved: hold the dates for 15 minutes. Throws when Firestore is unreachable (fail closed).
export async function holdBooking(a: BookingDates & { propertyId: string; uid: string; username: string; paymentId: string }) {
  if (!okId(a.propertyId)) return { ok: false as const, code: 'unavailable' as const };
  const ref = calRef(a.propertyId);
  return adminDb.runTransaction(async (tx) => {
    const now = Date.now();
    const v = decideBooking(read(await tx.get(ref)), a, now);
    if (!v.ok) return v;
    const next: Range[] = [...v.ranges, { start: a.start, end: a.end, paymentId: a.paymentId, uid: a.uid, username: a.username, status: 'hold', expiresAtMs: now + HOLD_MS }];
    tx.set(ref, { ranges: next, updatedAt: Timestamp.now() });
    return { ok: true as const };
  });
}

// Payment cancelled: free the held dates.
export async function releaseBooking(propertyId: string, paymentId: string) {
  if (!okId(propertyId)) return;
  const ref = calRef(propertyId);
  await adminDb.runTransaction(async (tx) => {
    const ranges = read(await tx.get(ref));
    const next = ranges.filter((r) => !(r.paymentId === paymentId && r.status === 'hold'));
    if (next.length !== ranges.length) tx.set(ref, { ranges: next, updatedAt: Timestamp.now() });
  });
}

// Contract signed: turn the hold into a confirmed stay and record the booking. Idempotent per payment.
// If the hold had expired and someone else took the dates meanwhile, the booking is kept as 'review' (manual refund).
export async function confirmBooking(a: BookingDates & {
  propertyId: string; uid: string; username: string; paymentId: string; contractId: string;
  propertyTitle: string; propertyType: string; nights: number; amount: number;
}) {
  if (!okId(a.propertyId)) return { recorded: false as const };
  const ref = calRef(a.propertyId);
  const bRef = adminDb.collection('bookings').doc(a.paymentId);
  let fresh = false;
  const out = await adminDb.runTransaction(async (tx) => {
    fresh = false;
    const [cal, b] = await Promise.all([tx.get(ref), tx.get(bRef)]);
    if (b.exists) return { recorded: true as const, status: b.data()?.status as string };
    const now = Date.now();
    const v = decideBooking(read(cal), a, now);
    const status = v.ok ? 'confirmed' : 'review';
    fresh = status === 'review';
    if (v.ok) {
      const confirmed: Range = { start: a.start, end: a.end, paymentId: a.paymentId, uid: a.uid, username: a.username, status: 'confirmed' };
      tx.set(ref, { ranges: [...v.ranges, confirmed], updatedAt: Timestamp.now() });
    }
    tx.set(bRef, {
      uid: a.uid, username: a.username, propertyId: a.propertyId, propertyTitle: a.propertyTitle, propertyType: a.propertyType,
      start: a.start, end: a.end, nights: a.nights, amount: a.amount, currency: 'Pi',
      paymentId: a.paymentId, contractId: a.contractId, status, createdAt: Timestamp.now(),
    });
    return { recorded: true as const, status };
  });
  if (fresh) await alertReview('حجز', { 'رقم الدفع': a.paymentId, 'العقار': a.propertyTitle, 'الليالي': String(a.nights), 'المبلغ': a.amount + ' Pi', 'المستخدم': a.username });
  return out;
}

// Public view: which days are taken (no names, no payment ids).
export async function busyRanges(propertyId: string): Promise<BookingDates[]> {
  if (!okId(propertyId)) return [];
  const d = await calRef(propertyId).get();
  return activeRanges(read(d), Date.now()).map(({ start, end }) => ({ start, end }));
}
