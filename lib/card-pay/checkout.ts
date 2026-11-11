import { cardBookingQuote, cardQuote, localCurrencyFor, type CardQuote } from './pricing';
import type { CardProvider } from './provider';
import { isBookingType, stayLimits, validateBooking } from '@/lib/booking-rules';
import { parseGuests } from '@/lib/guests';

interface StayPlan { type: string; start: string; end: string; nights: number; guests: number }

type CheckoutPlan =
  | { ok: true; quote: CardQuote; provider: CardProvider; stay?: StayPlan }
  | { ok: false; status: number; error: string };

type Prop = { status?: unknown; type?: unknown; hidden?: unknown; country?: unknown; cardPrice?: unknown; maxGuests?: unknown; minNights?: unknown; maxNights?: unknown };
type Pre = { ok: true; provider: CardProvider; type: string } | { ok: false; status: number; error: string };

// The checks that do not depend on dates: the listing exists, is open, can be paid by card, and a provider is connected.
function precheck(property: Prop | null, providerFor: (c: CardQuote['currency']) => CardProvider | undefined): Pre {
  if (!property || property.hidden === true) return { ok: false, status: 404, error: 'Property not found' };
  if (property.status !== 'available') return { ok: false, status: 409, error: 'This property is not available' };
  if (property.type === 'tokenized' || property.type === 'invest') return { ok: false, status: 400, error: 'Card payment is not available for shares yet' };
  const currency = localCurrencyFor(property.country);
  if (!currency || !(Number(property.cardPrice) > 0)) return { ok: false, status: 400, error: 'Card payment is not available for this property' };
  const provider = providerFor(currency);
  if (!provider) return { ok: false, status: 503, error: 'Card payment is not available right now' };
  return { ok: true, provider, type: String(property.type ?? '') };
}

/** True when this listing can be paid by card at all (dates are checked later for rent and hotel). */
export const canPayByCard = (property: Prop | null, providerFor: (c: CardQuote['currency']) => CardProvider | undefined): boolean => precheck(property, providerFor).ok;

// Decides whether a listing can be paid by card right now, from the stored property (never from what the browser says).
// For rent and hotel listings the dates and guests come from the browser, but they are validated here and the price is
// worked out here from the stored local price and the number of nights.
export function planCheckout(property: Prop | null, providerFor: (c: CardQuote['currency']) => CardProvider | undefined, booking?: unknown, nowMs: number = Date.now()): CheckoutPlan {
  const pre = precheck(property, providerFor);
  if (!pre.ok) return pre;
  if (isBookingType(pre.type)) {
    const v = validateBooking(pre.type, booking, nowMs, { limits: stayLimits(pre.type, property) });
    if (!v.ok) return { ok: false, status: 400, error: v.error };
    const g = parseGuests((booking as Record<string, unknown> | undefined)?.guests, property?.maxGuests);
    if (!g.ok) return { ok: false, status: 400, error: g.error };
    const quote = cardBookingQuote(property, pre.type, v.nights);
    if (!quote) return { ok: false, status: 400, error: 'Card payment is not available for this property' };
    return { ok: true, quote, provider: pre.provider, stay: { type: pre.type, start: v.start, end: v.end, nights: v.nights, guests: g.guests } };
  }
  const quote = cardQuote(property);
  if (!quote) return { ok: false, status: 400, error: 'Card payment is not available for this property' };
  return { ok: true, quote, provider: pre.provider };
}
