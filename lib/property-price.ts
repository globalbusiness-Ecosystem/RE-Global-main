import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { isUsdPegged, propertyPaymentAmount } from '@/lib/payment-rules';
import { getPiUsdRate } from '@/lib/pricing';
import { bookingTotal, isBookingType, validateBooking } from '@/lib/booking-rules';
import { parseGuests } from '@/lib/guests';
import { parseShares, sharesTotal, totalSharesOf } from '@/lib/share-rules';

// The amount (in Pi) the platform expects for a Firestore property, or null when the
// property is not in Firestore (demo listings) or has no usable price (fee rule applies).
// Throws when Firestore cannot be reached, or when a USD-priced property has no Pi rate set,
// so callers fail closed instead of charging a wrong amount.
export async function lookupExpectedAmount(propertyId: string): Promise<number | null> {
  if (!propertyId || propertyId.includes('/')) return null;
  const snap = await Promise.race([
    adminDb.collection('properties').doc(propertyId).get(),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('property lookup timeout')), 4000)),
  ]);
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  const explicit = propertyPaymentAmount(d);
  if (explicit !== null || !isUsdPegged(d.currency)) return explicit;
  const rate = await getPiUsdRate();
  const converted = propertyPaymentAmount(d, rate);
  if (converted === null) throw new Error('Pi rate not set for a USD-priced property');
  return converted;
}

// The caller sent dates that cannot be booked (client error, not an outage).
export class BookingInputError extends Error {}

export type Quote = {
  amount: number | null;
  booking?: { start: string; end: string; nights: number; type: string; guests: number };
  shares?: { count: number; totalShares: number; type: string };
};

// Like lookupExpectedAmount, but understands dated listings: for a rent / hotel property the
// expected amount is the price for the dates in the payment metadata.
// Throws BookingInputError for bad dates, any other Error when the server cannot decide (fail closed).
export async function resolveExpected(propertyId: string, metadata: unknown, opts: { allowPast?: boolean } = {}): Promise<Quote> {
  if (!propertyId || propertyId.includes('/')) return { amount: null };
  const snap = await Promise.race([
    adminDb.collection('properties').doc(propertyId).get(),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('property lookup timeout')), 4000)),
  ]);
  if (!snap.exists) return { amount: null };
  const d = snap.data() as Record<string, unknown>;
  let unit = propertyPaymentAmount(d);
  if (unit === null && isUsdPegged(d.currency)) {
    const rate = await getPiUsdRate();
    unit = propertyPaymentAmount(d, rate);
    if (unit === null) throw new Error('Pi rate not set for a USD-priced property');
  }
  const type = String(d.type ?? '');
  const totalShares = totalSharesOf(d);
  if (totalShares !== null && unit !== null) {
    // Sold by shares: `unit` is the value of the whole asset; the buyer pays for the shares chosen.
    const mdS = (metadata && typeof metadata === 'object' ? metadata : {}) as Record<string, unknown>;
    const ps = parseShares(mdS.shares, totalShares);
    if (!ps.ok) throw new BookingInputError(ps.error);
    const amount = sharesTotal(unit, totalShares, ps.count);
    if (amount === null) throw new Error('Could not price the shares');
    return { amount, shares: { count: ps.count, totalShares, type } };
  }
  if (!isBookingType(type) || unit === null) return { amount: unit };
  const md = (metadata && typeof metadata === 'object' ? metadata : {}) as Record<string, unknown>;
  const v = validateBooking(type, md.booking, Date.now(), opts);
  if (!v.ok) throw new BookingInputError(v.error);
  const g = parseGuests((md.booking as Record<string, unknown> | undefined)?.guests, d.maxGuests);
  if (!g.ok) throw new BookingInputError(g.error);
  const total = bookingTotal(type, unit, v.nights);
  if (total === null) throw new Error('Could not price the booking');
  return { amount: total, booking: { start: v.start, end: v.end, nights: v.nights, type, guests: g.guests } };
}
