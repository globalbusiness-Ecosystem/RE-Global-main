import { NextRequest, NextResponse } from 'next/server';
import { checkPropertyPaymentIntent } from '@/lib/payment-rules';
import { lookupExpectedAmount } from '@/lib/property-price';
import { authorizePayment, piPaymentAction } from '@/lib/pi-payment-guard';

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
  return piPaymentAction(ctx.paymentId, 'approve');
}
