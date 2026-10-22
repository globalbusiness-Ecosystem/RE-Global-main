import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { canEditRequest, cleanRequest } from '@/lib/guest-requests';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;

// The guest sets (or clears, with an empty text) the special request on their own confirmed, unfinished stay.
export async function setGuestRequest(uid: string, bookingId: unknown, raw: unknown) {
  if (!okId(bookingId)) return { ok: false as const, status: 400, error: 'Invalid booking' };
  const v = cleanRequest(raw);
  if (!v.ok) return { ok: false as const, status: 400, error: v.error };
  const ref = adminDb.collection('bookings').doc(bookingId);
  const b = await ref.get();
  const d = b.exists ? (b.data() as Record<string, unknown>) : null;
  if (!d || d.uid !== uid) return { ok: false as const, status: 404, error: 'Booking not found' };
  if (!canEditRequest({ status: d.status, end: String(d.end ?? '') }, new Date().toISOString().slice(0, 10))) {
    return { ok: false as const, status: 409, error: 'This booking can no longer take a request' };
  }
  await ref.update({ guestNote: v.note, guestNoteAt: Timestamp.now() });
  return { ok: true as const, note: v.note };
}
