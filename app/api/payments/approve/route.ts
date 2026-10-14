import { NextRequest, NextResponse } from 'next/server';
import { checkPropertyPaymentIntent } from '@/lib/payment-rules';
import { lookupExpectedAmount } from '@/lib/property-price';
import { authorizePayment, piPaymentAction } from '@/lib/pi-payment-guard';
import { reserveForPayment } from '@/lib/property-reserve';
import { RESERVE_ERRORS } from '@/lib/property-lifecycle';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await authorizePayment(req, body?.paymentId);
  if (ctx instanceof NextResponse) return ctx;
  let expectedAmount: number | null = null;
  try {
    expectedAmount = await lookupExpectedAmount(String(ctx.payment.metadata?.propertyId ?? ''));
  } catch {
    return NextResponse.json({ error: 'Could not verify the property price, try again' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const intent = checkPropertyPaymentIntent(ctx.payment, expectedAmount);
  if (!intent.ok) {
    return NextResponse.json({ error: intent.error }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
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
