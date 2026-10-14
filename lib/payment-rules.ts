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
// Currencies that are pegged 1:1 to the US dollar. A listing priced in one of these is
// charged in Pi at the admin-set rate (settings/pricing.piUsdRate = how many USD one Pi is worth).
export const USD_PEGGED = ['USD', 'OUSD', 'USDC', 'USDT'];
export const isUsdPegged = (c: unknown) => typeof c === 'string' && USD_PEGGED.includes(c.toUpperCase());

// USD -> Pi, rounded UP to 2 decimals so the platform never undercharges.
export function piFromUsd(usd: number, piUsdRate: number): number | null {
  if (!Number.isFinite(usd) || usd <= 0 || !Number.isFinite(piUsdRate) || piUsdRate <= 0) return null;
  return Math.ceil((usd / piUsdRate) * 100 - 1e-9) / 100;
}

// Amount (in Pi) to charge for a listing: its explicit payAmountPi, else its price when priced in Pi,
// else (USD-pegged price + a Pi rate) the price converted to Pi.
export function propertyPaymentAmount(
  d: { price?: unknown; currency?: unknown; payAmountPi?: unknown } | null | undefined,
  piUsdRate?: number | null
): number | null {
  if (!d) return null;
  const pay = Number(d.payAmountPi);
  if (Number.isFinite(pay) && pay > 0) return pay;
  const price = Number(d.price);
  const isPi = d.currency === undefined || d.currency === null || d.currency === '' || d.currency === 'Pi' || d.currency === 'PI';
  if (isPi && Number.isFinite(price) && price > 0) return price;
  if (isUsdPegged(d.currency) && piUsdRate) return piFromUsd(price, piUsdRate);
  return null;
}

export function checkPropertyPaymentIntent(payment: {
  amount?: number;
  metadata?: { propertyId?: unknown; transactionType?: unknown } | null;
}, overrideAmount?: number | null): IntentCheck {
  const md = payment.metadata;
  if (!md || md.propertyId === undefined || md.propertyId === null || md.propertyId === '') return { ok: true };
  const feeAmount = expectedAmountFor(md.transactionType);
  if (feeAmount === null) return { ok: false, error: 'Unsupported transaction type' };
  const expected = typeof overrideAmount === 'number' ? overrideAmount : feeAmount;
  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || Math.abs(amount - expected) > 1e-9) {
    return { ok: false, error: 'Unexpected payment amount' };
  }
  return { ok: true };
}
