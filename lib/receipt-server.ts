import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { getCancellationPolicy } from '@/lib/booking-cancel';
import { policyText } from '@/lib/cancellation';
import { TIME_RE } from '@/lib/stay-info';
import type { ReceiptData } from '@/lib/receipt';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;

// The data of a receipt for the guest's own confirmed stay (check-in and check-out times come from the listing when it has them).
export async function guestReceiptData(uid: string, bookingId: unknown, lang: string) {
  if (!okId(bookingId)) return { ok: false as const, status: 400, error: 'Invalid booking' };
  const b = await adminDb.collection('bookings').doc(bookingId).get();
  const d = b.exists ? (b.data() as Record<string, unknown>) : null;
  if (!d || d.uid !== uid) return { ok: false as const, status: 404, error: 'Booking not found' };
  if (d.status !== 'confirmed') return { ok: false as const, status: 409, error: 'A receipt is available for confirmed bookings only' };
  let checkInTime: string | undefined;
  let checkOutTime: string | undefined;
  const propertyId = String(d.propertyId ?? '');
  if (okId(propertyId)) {
    try {
      const p = await adminDb.collection('properties').doc(propertyId).get();
      const x = p.exists ? (p.data() as Record<string, unknown>) : {};
      if (typeof x.checkInTime === 'string' && TIME_RE.test(x.checkInTime)) checkInTime = x.checkInTime;
      if (typeof x.checkOutTime === 'string' && TIME_RE.test(x.checkOutTime)) checkOutTime = x.checkOutTime;
    } catch { /* the times are optional */ }
  }
  const data: ReceiptData = {
    bookingId, paymentId: String(d.paymentId ?? bookingId), title: String(d.propertyTitle ?? ''), start: String(d.start ?? ''), end: String(d.end ?? ''),
    nights: Number(d.nights) || 0, ...(Number(d.guests) > 0 ? { guests: Number(d.guests) } : {}), amount: Number(d.amount) || 0,
    ...(checkInTime ? { checkInTime } : {}), ...(checkOutTime ? { checkOutTime } : {}),
    username: String(d.username ?? ''), issuedAt: new Date().toISOString(), policy: policyText(lang, await getCancellationPolicy()),
  };
  return { ok: true as const, data };
}
