import { NextRequest, NextResponse } from 'next/server';
import { authorizePayment, piPaymentAction } from '@/lib/pi-payment-guard';
import { isValidTxid } from '@/lib/contract-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!isValidTxid(body?.txid)) {
    return NextResponse.json({ error: 'Invalid txid' }, { status: 400 });
  }
  const ctx = await authorizePayment(req, body?.paymentId);
  if (ctx instanceof NextResponse) return ctx;
  return piPaymentAction(ctx.paymentId, 'complete', { txid: body.txid });
}
