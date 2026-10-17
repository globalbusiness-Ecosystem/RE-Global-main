import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/market-auth';
import { rateLimited } from '@/lib/rate-guard';
import { isValidPaymentId, isValidTxid } from '@/lib/contract-guard';
import { validateResalePayment, type ResalePayment } from '@/lib/market-rules';
import { listingAmount, settleResale } from '@/lib/share-market';
import { signResaleContract } from '@/lib/resale-contract';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'no-store' };

// After the Pi payment for a resale listing completed: verify it with Pi, then move the shares.
export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  const limited = await rateLimited('settle', user.uid, 30, 10 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => ({}));
  const { paymentId, txid } = body ?? {};
  if (!isValidPaymentId(paymentId) || !isValidTxid(txid)) return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400, headers: NO_STORE });
  if (!process.env.PI_API_KEY) return NextResponse.json({ error: 'Payments are not configured' }, { status: 500, headers: NO_STORE });

  let payment: ResalePayment;
  try {
    const res = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Key ${process.env.PI_API_KEY}` }, cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return NextResponse.json({ error: 'Payment not found' }, { status: 404, headers: NO_STORE });
    if (!res.ok) return NextResponse.json({ error: 'Could not verify payment' }, { status: 502, headers: NO_STORE });
    payment = (await res.json()) as ResalePayment;
  } catch {
    return NextResponse.json({ error: 'Could not reach Pi Platform API' }, { status: 503, headers: NO_STORE });
  }

  const listingId = String(payment.metadata?.listingId ?? '');
  try {
    const expected = await listingAmount(listingId);
    if (expected === null) return NextResponse.json({ error: 'Listing not found' }, { status: 404, headers: NO_STORE });
    const check = validateResalePayment(payment, { uid: user.uid, txid, listingId, expectedAmount: expected });
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status, headers: NO_STORE });
    const r = await settleResale({ paymentId, buyerUid: user.uid, buyerName: user.username, listingId, amount: expected });
    if (!r.recorded) return NextResponse.json({ error: 'Listing not found' }, { status: 404, headers: NO_STORE });
    // A confirmed sale gets a signed contract. If signing fails the client retries: settlement is idempotent.
    let contractId: string | null = null;
    if (r.status === 'confirmed') {
      const c = await signResaleContract({ paymentId, txid, listingId, buyerName: user.username, amount: expected });
      contractId = c?.contractId ?? null;
    }
    return NextResponse.json({ ok: true, status: r.status, contractId }, { headers: NO_STORE });
  } catch (err) {
    console.error('[market/settle] error:', err);
    return NextResponse.json({ error: 'Settlement failed' }, { status: 500, headers: NO_STORE });
  }
}
