import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getProvider } from '@/lib/card-pay/provider';
import { ensureProviders } from '@/lib/card-pay/registry';
import { alertReview } from '@/lib/admin-alert';
import { adminDb } from '@/lib/firebase-admin';
import { finalizeSale, releaseReservation } from '@/lib/property-reserve';
import { applyToOrder } from '@/lib/card-pay/store';
import { handleCardWebhook } from '@/lib/card-pay/webhook';

export const dynamic = 'force-dynamic';

// Called by the payment company, not by a person: there is no sign-in. It is protected by the company's signature
// (checked inside the provider's parseWebhook) and an IP rate limit.
export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const limited = await ipLimited('card-webhook', req, 120, 60_000);
  if (limited) return limited;
  ensureProviders();
  const { provider } = await ctx.params;
  const raw = await req.text();
  if (raw.length > 100_000) return NextResponse.json({ ok: false, error: 'too large' }, { status: 413 });
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  const reply = await handleCardWebhook(provider, raw, headers, {
    getProvider,
    applyToOrder,
    // Handing the property over is still done by the team: tell them an order was paid by card.
    onPaid: async (o) => {
      // Mark the property sold to this order (a second payer for the same property is flagged for review).
      if (o.propertyId) {
        const snap = await adminDb.collection('properties').doc(o.propertyId).get();
        await finalizeSale({
          propertyId: o.propertyId, uid: o.uid, username: o.uid, paymentId: o.id, contractId: '',
          propertyTitle: String(snap.data()?.title ?? ''), amount: o.amountMinor / 100, currency: o.currency,
        });
      }
      await alertReview('دفع ببطاقة', { 'رقم الطلب': o.id, 'المبلغ': `${(o.amountMinor / 100).toFixed(2)} ${o.currency}`, 'العميل': o.uid });
    },
    onFailed: async (o) => { if (o.propertyId) await releaseReservation(o.propertyId, o.uid); },
  });
  return NextResponse.json(reply.body, { status: reply.status, headers: { 'Cache-Control': 'no-store' } });
}
