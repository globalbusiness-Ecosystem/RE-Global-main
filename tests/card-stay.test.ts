import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { canPayByCard, planCheckout } from '@/lib/card-pay/checkout';
import { cardBookingQuote } from '@/lib/card-pay/pricing';
import { readStay } from '@/lib/card-pay/order';
import { sandboxProvider } from '@/lib/card-pay/sandbox-provider';
import { bookingTotals } from '@/lib/booking-rules';

const src = (p: string) => readFileSync(p, 'utf8');
const sb = sandboxProvider('sandbox-secret-0123456789');
const find = () => sb;
const NOW = Date.UTC(2026, 10, 10);
const hotel = { status: 'available', type: 'hotel', country: 'EG', cardPrice: 1500, maxGuests: 3 };
const rent = { status: 'available', type: 'rent', country: 'AE', cardPrice: 3000 };

describe('stay pricing by card', () => {
  it('hotel: price per night in the local currency, rounded up to the minor unit', () => {
    expect(cardBookingQuote(hotel, 'hotel', 3)).toEqual({ currency: 'EGP', amountMinor: 450000 });
    expect(cardBookingQuote({ ...hotel, cardPrice: 99.99 }, 'hotel', 2)).toEqual({ currency: 'EGP', amountMinor: 19998 });
  });
  it('rent: price per 30 nights, charged pro rata', () => {
    expect(cardBookingQuote(rent, 'rent', 30)).toEqual({ currency: 'AED', amountMinor: 300000 });
    expect(cardBookingQuote(rent, 'rent', 45)).toEqual({ currency: 'AED', amountMinor: 450000 });
  });
  it('refuses without a supported country, a price, or real nights', () => {
    expect(cardBookingQuote({ ...hotel, country: 'XX' }, 'hotel', 2)).toBeNull();
    expect(cardBookingQuote({ ...hotel, cardPrice: 0 }, 'hotel', 2)).toBeNull();
    expect(cardBookingQuote(hotel, 'hotel', 0)).toBeNull();
    expect(cardBookingQuote(null, 'hotel', 2)).toBeNull();
  });
});

describe('planCheckout for stays', () => {
  const dates = { start: '2026-11-12', end: '2026-11-15', guests: 2 };
  it('prices the stay from the stored price and the dates, never from the browser', () => {
    const p = planCheckout(hotel, find, dates, NOW);
    expect(p).toMatchObject({ ok: true, quote: { currency: 'EGP', amountMinor: 450000 }, stay: { type: 'hotel', start: '2026-11-12', end: '2026-11-15', nights: 3, guests: 2 } });
  });
  it('needs valid dates, a stay inside the limits, and a sensible guest count', () => {
    expect(planCheckout(hotel, find, undefined, NOW)).toMatchObject({ ok: false, status: 400 });
    expect(planCheckout(hotel, find, { start: '2026-11-15', end: '2026-11-12' }, NOW)).toMatchObject({ ok: false, status: 400 });
    expect(planCheckout(hotel, find, { start: '2026-01-01', end: '2026-01-03' }, NOW)).toMatchObject({ ok: false, status: 400 });
    expect(planCheckout(hotel, find, { ...dates, guests: 9 }, NOW)).toMatchObject({ ok: false, status: 400 });
    expect(planCheckout(rent, find, { start: '2026-11-12', end: '2026-11-20' }, NOW)).toMatchObject({ ok: false, status: 400 }); // rent: 30 nights minimum
  });
  it('a hotel limited by the admin keeps that limit', () => {
    expect(planCheckout({ ...hotel, minNights: 2 }, find, { start: '2026-11-12', end: '2026-11-13' }, NOW)).toMatchObject({ ok: false, status: 400 });
  });
  it('buying is unchanged and has no stay', () => {
    const p = planCheckout({ status: 'available', type: 'buy', country: 'EG', cardPrice: 1000 }, find);
    expect(p).toMatchObject({ ok: true, quote: { amountMinor: 100000 } });
    expect((p as { stay?: unknown }).stay).toBeUndefined();
  });
  it('canPayByCard ignores dates but not the other rules', () => {
    expect(canPayByCard(hotel, find)).toBe(true);
    expect(canPayByCard({ ...hotel, status: 'sold' }, find)).toBe(false);
    expect(canPayByCard({ ...hotel, cardPrice: undefined }, find)).toBe(false);
    expect(canPayByCard(hotel, () => undefined)).toBe(false);
  });
});

describe('stay saved on an order', () => {
  it('reads a good one and ignores anything odd', () => {
    expect(readStay({ type: 'hotel', start: '2026-11-12', end: '2026-11-15', nights: 3, guests: 2 })).toEqual({ type: 'hotel', start: '2026-11-12', end: '2026-11-15', nights: 3, guests: 2 });
    for (const bad of [null, 'x', {}, { type: 'hotel', start: 'nope', end: '2026-11-15', nights: 3, guests: 2 }, { type: 'hotel', start: '2026-11-12', end: '2026-11-15', nights: 1.5, guests: 2 }]) expect(readStay(bad)).toBeUndefined();
  });
});

describe('wiring', () => {
  it('checkout holds the dates for a stay and the property for a sale, and frees the right one on failure', () => {
    const s = src('app/api/card/checkout/route.ts');
    expect(s).toContain('holdBooking(');
    expect(s).toContain('reserveForPayment(');
    expect(s).toContain('releaseBooking(propertyId, orderId)');
    expect(s).toContain('planCheckout(property, providerFor, body?.booking)');
  });
  it('payment confirms the booking (with the card currency) and failure frees the dates', () => {
    const s = src('lib/card-pay/deps.ts');
    expect(s).toContain('confirmBooking(');
    expect(s).toContain('currency: o.currency');
    expect(s).toContain('releaseBooking(o.propertyId, o.id)');
  });
  it('the card button sends the dates and only shows for a stay once dates are chosen', () => {
    const b = src('components/card-pay-button.tsx');
    expect(b).toContain("transactionType === 'buy'");
    expect(b).toContain('Boolean(booking)');
    expect(b).toContain('booking: {');
    expect(src('components/unified-payment-button.tsx')).toContain('booking={booking}');
  });
  it('card stays are not added to the Pi revenue', () => {
    const t = bookingTotals([
      { status: 'confirmed', amount: 10, end: '2026-12-01', nights: 3 },
      { status: 'confirmed', amount: 4500, currency: 'EGP', end: '2026-12-01', nights: 3 },
      { status: 'confirmed', amount: 5, currency: 'Pi', end: '2026-12-01', nights: 1 },
    ], '2026-10-16');
    expect(t.revenue).toBe(15);
    expect(t.confirmed).toBe(3);
  });
  it('card refunds are marked with their currency so they are not paid in Pi', () => {
    expect(src('lib/booking-cancel.ts')).toContain("currency: String(d.currency)");
    expect(src('lib/booking-admin.ts')).toContain("currency: String(d.currency)");
    expect(src('components/admin/payouts-panel.tsx')).toContain('r.currency');
  });
});
