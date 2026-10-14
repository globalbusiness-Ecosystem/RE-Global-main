// Rules for properties that can only be sold once (buy, off-plan, abroad).
// Rent / hotel / invest / tokenized are not exclusive: they need dates or shares (later phases).

export const EXCLUSIVE_TYPES = ['buy', 'offplan', 'abroad'];
export const RESERVE_MS = 15 * 60 * 1000;

export const isExclusiveType = (t: unknown) => typeof t === 'string' && EXCLUSIVE_TYPES.includes(t);

export type Reservation = { uid: string; expiresAtMs: number } | null;

// May this user start paying for the property right now?
export function decideReservation(
  property: { type?: unknown; status?: unknown },
  reservation: Reservation,
  uid: string,
  nowMs: number
): { ok: true } | { ok: false; code: 'sold' | 'reserved' } {
  if (!isExclusiveType(property.type)) return { ok: true };
  if (property.status === 'sold') return { ok: false, code: 'sold' };
  if (reservation && reservation.uid !== uid && reservation.expiresAtMs > nowMs) return { ok: false, code: 'reserved' };
  return { ok: true };
}

// A payment finished: should the property be marked sold to this payment?
//  mark     -> first sale, mark it
//  already  -> this very payment already marked it (idempotent retry)
//  conflict -> someone else already owns it; the payment needs a manual review/refund
export function decideSale(
  property: { status?: unknown; soldPaymentId?: unknown },
  paymentId: string
): 'mark' | 'already' | 'conflict' {
  if (property.status !== 'sold') return 'mark';
  return property.soldPaymentId === paymentId ? 'already' : 'conflict';
}

export const RESERVE_ERRORS: Record<'sold' | 'reserved', string> = {
  sold: 'This property has already been sold',
  reserved: 'This property is being purchased by another user right now, try again in a few minutes',
};
