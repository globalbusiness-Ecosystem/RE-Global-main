import { NextRequest, NextResponse } from 'next/server';
import { authorizePayment, piPaymentAction } from '@/lib/pi-payment-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await authorizePayment(req, body?.paymentId);
  if (ctx instanceof NextResponse) return ctx;
  return piPaymentAction(ctx.paymentId, 'approve');
}
