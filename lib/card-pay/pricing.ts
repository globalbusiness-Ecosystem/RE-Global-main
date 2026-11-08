import { CURRENCIES, type Currency } from './provider';
import { toMinor } from './order';
import { bookingTotal } from '@/lib/booking-rules';

// Each listing is charged by card in the currency of the country it is in, at a local price the admin sets
// (`cardPrice`), so nobody pays a converted Pi price and no exchange rate is involved.
export const COUNTRY_CURRENCY: Record<string, Currency> = {
  AE: 'AED', EG: 'EGP', SA: 'SAR', QA: 'QAR', TR: 'TRY', GB: 'GBP', US: 'USD', CA: 'CAD', FR: 'EUR', ES: 'EUR', DE: 'EUR', AU: 'AUD',
};

export function localCurrencyFor(country: unknown): Currency | null {
  if (typeof country !== 'string' || !Object.prototype.hasOwnProperty.call(COUNTRY_CURRENCY, country)) return null;
  return COUNTRY_CURRENCY[country];
}

export const isCardCurrency = (c: unknown): c is Currency => typeof c === 'string' && (CURRENCIES as readonly string[]).includes(c);

export interface CardQuote { currency: Currency; amountMinor: number }

/**
 * What a card payment for this listing costs, or null when it cannot be paid by card
 * (no country, a country with no supported currency, or no local price set by the admin).
 */
export function cardQuote(d: { country?: unknown; cardPrice?: unknown } | null | undefined): CardQuote | null {
  if (!d) return null;
  const currency = localCurrencyFor(d.country);
  const price = Number(d.cardPrice);
  if (!currency || !(price > 0)) return null;
  const amountMinor = toMinor(price);
  return amountMinor === null ? null : { currency, amountMinor };
}

/**
 * What a stay costs by card. For a rent or hotel listing `cardPrice` is the local price per night (hotel) or per month of
 * 30 nights (rent, charged pro rata), exactly like the Pi price; the total is rounded up to the minor unit.
 */
export function cardBookingQuote(d: { country?: unknown; cardPrice?: unknown } | null | undefined, type: string, nights: number): CardQuote | null {
  if (!d) return null;
  const currency = localCurrencyFor(d.country);
  const total = bookingTotal(type, Number(d.cardPrice), nights);
  if (!currency || total === null) return null;
  const amountMinor = toMinor(total);
  return amountMinor === null ? null : { currency, amountMinor };
}
