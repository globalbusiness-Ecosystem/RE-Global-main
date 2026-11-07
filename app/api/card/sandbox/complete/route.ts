import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { ensureProviders } from '@/lib/card-pay/registry';
import { getProvider } from '@/lib/card-pay/provider';
import { getOrder } from '@/lib/card-pay/store';
import { cardWebhookDeps } from '@/lib/card-pay/deps';
import { handleCardWebhook } from '@/lib/card-pay/webhook';
import { signHmacSha256 } from '@/lib/card-pay/signature';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Test only: lets a signed-in person finish their OWN pending order with the pretend payment company, so the whole card
// cycle can be tried without money. It exists only while CARD_SANDBOX_SECRET is set, and it sends a properly signed
// notification through the same code path a real payment company uses.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'card-sandbox', limit: 20, windowMs: 10 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  ensureProviders();
  const secret = process.env.CARD_SANDBOX_SECRET;
  if (!secret || !getProvider('sandbox')) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: H });
  const body = await req.json().catch(() => ({}));
  const outcome = body?.outcome === 'paid' || body?.outcome === 'failed' ? body.outcome : null;
  const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
  if (!outcome || !orderId) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: H });
  const order = await getOrder(orderId).catch(() => null);
  if (!order || order.uid !== user.uid) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: H });
  const raw = JSON.stringify({ eventId: `sim_${outcome}_${orderId}`, orderId, providerRef: `sandbox_${orderId}`, status: outcome, amountMinor: order.amountMinor, currency: order.currency });
  const reply = await handleCardWebhook('sandbox', raw, { 'x-sandbox-signature': signHmacSha256(raw, secret) }, cardWebhookDeps);
  return NextResponse.json(reply.body, { status: reply.status, headers: H });
}
