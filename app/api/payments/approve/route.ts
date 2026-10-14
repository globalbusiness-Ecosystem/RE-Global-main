import { NextRequest, NextResponse } from 'next/server';
import { checkPropertyPaymentIntent } from '@/lib/payment-rules';
import { resolveExpected, BookingInputError, type Quote } from '@/lib/property-price';
import { holdBooking } from '@/lib/booking-calendar';
import { BOOKING_ERRORS } from '@/lib/booking-rules';
import { authorizePayment, piPaymentAction } from '@/lib/pi-payment-guard';
import { reserveForPayment } from '@/lib/property-reserve';
import { RESERVE_ERRORS } from '@/lib/property-lifecycle';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await authorizePayment(req, body?.paymentId);
  if (ctx instanceof NextResponse) return ctx;
  let quote: Quote;
  try {
    quote = await resolveExpected(String(ctx.payment.metadata?.propertyId ?? ''), ctx.payment.metadata);
  } catch (e) {
    if (e instanceof BookingInputError) return NextResponse.json({ error: e.message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ error: 'Could not verify the property price, try again' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const intent = checkPropertyPaymentIntent(ctx.payment, quote.amount);
  if (!intent.ok) {
    return NextResponse.json({ error: intent.error }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  // Dated listings (rent / hotel): hold the dates for this guest, or refuse if they are taken.
  if (quote.booking) {
    try {
      const h = await holdBooking({ propertyId: String(ctx.payment.metadata?.propertyId), uid: ctx.user.uid, username: ctx.user.username, paymentId: ctx.paymentId, start: quote.booking.start, end: quote.booking.end });
      if (!h.ok) return NextResponse.json({ error: BOOKING_ERRORS.unavailable }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return NextResponse.json({ error: 'Could not hold the dates, try again' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    return piPaymentAction(ctx.paymentId, 'approve');
  }
  // Exclusive listings (buy / off-plan / abroad): hold the property for this buyer, or refuse if it is sold or held.
  try {
    const v = await reserveForPayment(String(ctx.payment.metadata?.propertyId ?? ''), ctx.user.uid, ctx.user.username, ctx.paymentId);
    if (!v.ok) return NextResponse.json({ error: RESERVE_ERRORS[v.code] }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not reserve the property, try again' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return piPaymentAction(ctx.paymentId, 'approve');
}
