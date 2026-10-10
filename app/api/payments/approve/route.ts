import { NextRequest, NextResponse } from 'next/server';
import { checkPropertyPaymentIntent } from '@/lib/payment-rules';
import { authorizePayment, piPaymentAction } from '@/lib/pi-payment-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await authorizePayment(req, body?.paymentId);
  if (ctx instanceof NextResponse) return ctx;
  const intent = checkPropertyPaymentIntent(ctx.payment);
  if (!intent.ok) {
    return NextResponse.json({ error: intent.error }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  return piPaymentAction(ctx.paymentId, 'approve');
}
