import 'server-only';
import { createHash } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { responseRate, validateReply } from '@/lib/review-reply';
import { REVIEW_LIST_MAX, canReview, maskName, summarize, validateReview } from '@/lib/stay-reviews';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;
// A public handle for a review: the document id is the payment id, so it is never shown. A short one-way hash is.
export const reviewRid = (id: string) => createHash('sha256').update(`rid:${id}`).digest('hex').slice(0, 16);
const iso = (t: unknown) => ((t as { toDate?: () => Date } | null)?.toDate ? (t as { toDate: () => Date }).toDate().toISOString() : '');

// A guest reviews a finished stay. The booking must be theirs, confirmed and over; one review per booking
// (the review document id is the booking id, and create() fails when it already exists).
export async function submitReview(uid: string, username: string, bookingId: unknown, raw: unknown) {
  if (!okId(bookingId)) return { ok: false as const, status: 400, error: 'Invalid booking' };
  const v = validateReview(raw);
  if (!v.ok) return { ok: false as const, status: 400, error: v.error };
  const b = await adminDb.collection('bookings').doc(bookingId).get();
  const d = b.exists ? (b.data() as Record<string, unknown>) : null;
  if (!d || d.uid !== uid) return { ok: false as const, status: 404, error: 'Booking not found' };
  if (!canReview({ status: d.status, end: String(d.end ?? '') }, new Date().toISOString().slice(0, 10))) {
    return { ok: false as const, status: 409, error: 'You can review a stay after check-out' };
  }
  try {
    await adminDb.collection('stay_reviews').doc(bookingId).create({
      propertyId: String(d.propertyId ?? ''), propertyTitle: String(d.propertyTitle ?? ''), uid,
      name: maskName(username), rating: v.rating, comment: v.comment, hidden: false, createdAt: Timestamp.now(),
    });
  } catch (err) {
    if ((err as { code?: number | string }).code === 6 || (err as { code?: number | string }).code === 'already-exists') {
      return { ok: false as const, status: 409, error: 'You already reviewed this stay' };
    }
    throw err;
  }
  return { ok: true as const };
}

// Public: the average and the latest visible reviews of one listing (masked name, no ids).
export async function publicReviews(propertyId: string) {
  if (!okId(propertyId)) return { summary: { count: 0, avg: 0, responseRate: null as number | null }, reviews: [] };
  const snap = await adminDb.collection('stay_reviews').where('propertyId', '==', propertyId).limit(500).get();
  const rows = snap.docs
    .map((x): Record<string, unknown> => ({ ...(x.data() as Record<string, unknown>), rid: reviewRid(x.id) }))
    .filter((x) => x.hidden !== true)
    .map((x) => ({ rid: String(x.rid), rating: Number(x.rating) || 0, comment: String(x.comment ?? ''), name: String(x.name ?? '***'), reply: String(x.reply ?? ''), date: iso(x.createdAt).slice(0, 10) }))
    .sort((a, c) => c.date.localeCompare(a.date));
  return { summary: { ...summarize(rows), responseRate: responseRate(rows) }, reviews: rows.slice(0, REVIEW_LIST_MAX) };
}

// Admin: the latest reviews, hidden ones included.
export async function adminReviews() {
  const snap = await adminDb.collection('stay_reviews').orderBy('createdAt', 'desc').limit(100).get();
  return snap.docs.map((x) => {
    const d = x.data() as Record<string, unknown>;
    return { id: x.id, propertyTitle: String(d.propertyTitle ?? ''), name: String(d.name ?? ''), rating: Number(d.rating) || 0, comment: String(d.comment ?? ''), hidden: d.hidden === true, reply: String(d.reply ?? ''), reports: Number(d.reports) || 0, date: iso(d.createdAt).slice(0, 10) };
  });
}

// Admin: hide or show a review (nothing is deleted).
export async function adminSetReviewHidden(id: unknown, hidden: boolean) {
  if (!okId(id)) return { ok: false as const, status: 400, error: 'Invalid review' };
  const ref = adminDb.collection('stay_reviews').doc(id);
  const s = await ref.get();
  if (!s.exists) return { ok: false as const, status: 404, error: 'Review not found' };
  await ref.update({ hidden });
  return { ok: true as const, title: String((s.data() as Record<string, unknown>).propertyTitle ?? '') };
}

// Admin: write, change or remove (empty text) the host reply shown under a review.
export async function adminSetReviewReply(id: unknown, raw: unknown) {
  if (!okId(id)) return { ok: false as const, status: 400, error: 'Invalid review' };
  const v = validateReply(raw);
  if (!v.ok) return { ok: false as const, status: 400, error: v.error };
  const ref = adminDb.collection('stay_reviews').doc(id);
  const s = await ref.get();
  if (!s.exists) return { ok: false as const, status: 404, error: 'Review not found' };
  await ref.update({ reply: v.reply, replyAt: v.reply ? Timestamp.now() : null });
  return { ok: true as const, title: String((s.data() as Record<string, unknown>).propertyTitle ?? ''), cleared: !v.reply };
}

// Anyone can flag a review (no sign-in): it only raises a counter for the admin, nothing is hidden automatically.
// Returns first = true when this is the first report, so the admin is alerted once, not on every click.
export async function reportReview(propertyId: unknown, rid: unknown) {
  if (!okId(propertyId) || typeof rid !== 'string' || !/^[0-9a-f]{16}$/.test(rid)) return { ok: false as const, status: 400, error: 'Invalid review' };
  const snap = await adminDb.collection('stay_reviews').where('propertyId', '==', propertyId).limit(500).get();
  const hit = snap.docs.find((x) => reviewRid(x.id) === rid && (x.data() as Record<string, unknown>).hidden !== true);
  if (!hit) return { ok: false as const, status: 404, error: 'Review not found' };
  const d = hit.data() as Record<string, unknown>;
  await hit.ref.update({ reports: FieldValue.increment(1), reportedAt: Timestamp.now() });
  return { ok: true as const, first: !(Number(d.reports) > 0), title: String(d.propertyTitle ?? '') };
}
