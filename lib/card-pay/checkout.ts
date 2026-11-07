import { cardQuote, type CardQuote } from './pricing';
import type { CardProvider } from './provider';

export type CheckoutPlan =
  | { ok: true; quote: CardQuote; provider: CardProvider }
  | { ok: false; status: number; error: string };

// Decides whether a listing can be paid by card right now, from the stored property (never from what the browser says).
export function planCheckout(
  property: { status?: unknown; type?: unknown; hidden?: unknown; country?: unknown; cardPrice?: unknown } | null,
  providerFor: (c: CardQuote['currency']) => CardProvider | undefined,
): CheckoutPlan {
  if (!property || property.hidden === true) return { ok: false, status: 404, error: 'Property not found' };
  if (property.status !== 'available') return { ok: false, status: 409, error: 'This property is not available' };
  if (property.type === 'tokenized' || property.type === 'invest') return { ok: false, status: 400, error: 'Card payment is not available for shares yet' };
  const quote = cardQuote(property);
  if (!quote) return { ok: false, status: 400, error: 'Card payment is not available for this property' };
  const provider = providerFor(quote.currency);
  if (!provider) return { ok: false, status: 503, error: 'Card payment is not available right now' };
  return { ok: true, quote, provider };
}
