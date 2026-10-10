// Server-side rules for the Pi payments this app creates.
// The client decides the amount it asks Pi for, so the server must not trust it:
// a payment tied to a property is only accepted when the amount matches what the
// platform charges for that kind of transaction.

export const PLATFORM_FEES_PI = {
  buy: 1, // purchase reservation
  other: 50, // rent / invest / tokenized / hotel
} as const;

const KNOWN_TYPES = ['buy', 'rent', 'hotel', 'invest', 'tokenized'];

export function expectedAmountFor(transactionType: unknown): number | null {
  const t = transactionType === undefined || transactionType === null ? 'buy' : String(transactionType);
  if (!KNOWN_TYPES.includes(t)) return null;
  return t === 'buy' ? PLATFORM_FEES_PI.buy : PLATFORM_FEES_PI.other;
}

export interface IntentCheck {
  ok: boolean;
  error?: string;
}

// Returns ok for payments that are not about a property (nothing to enforce here).
export function checkPropertyPaymentIntent(payment: {
  amount?: number;
  metadata?: { propertyId?: unknown; transactionType?: unknown } | null;
}): IntentCheck {
  const md = payment.metadata;
  if (!md || md.propertyId === undefined || md.propertyId === null || md.propertyId === '') return { ok: true };
  const expected = expectedAmountFor(md.transactionType);
  if (expected === null) return { ok: false, error: 'Unsupported transaction type' };
  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || Math.abs(amount - expected) > 1e-9) {
    return { ok: false, error: 'Unexpected payment amount' };
  }
  return { ok: true };
}
