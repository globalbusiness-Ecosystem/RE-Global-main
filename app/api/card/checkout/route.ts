import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { guardApi } from '@/lib/api-guard';
import { ensureProviders } from '@/lib/card-pay/registry';
import { providerFor } from '@/lib/card-pay/provider';
import { planCheckout } from '@/lib/card-pay/checkout';
import { createOrder, setProviderRef, deleteOrder } from '@/lib/card-pay/store';
import { reserveForPayment, releaseReservation } from '@/lib/property-reserve';
import { RESERVE_ERRORS } from '@/lib/property-lifecycle';
import { getKyc } from '@/lib/kyc-store';
import { needsKyc } from '@/lib/kyc-rules';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Starts a card payment: the price, currency and availability come from the stored property, never from the browser.
// The person is sent to the payment company's own page, so card details never reach this server.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'card-checkout', limit: 10, windowMs: 10 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  // People who signed in outside the Pi Browser must have their identity verified before paying (fails closed).
  if (needsKyc(user.uid)) {
    let k;
    try { k = await getKyc(user.uid); } catch { return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H }); }
    if (k.status !== 'approved') return NextResponse.json({ error: 'Identity verification required', code: 'kyc_required', kyc: k.status }, { status: 403, headers: H });
  }
  const body = await req.json().catch(() => ({}));
  const propertyId = typeof body?.propertyId === 'string' ? body.propertyId : '';
  if (!propertyId || propertyId.includes('/') || propertyId.length > 128) return NextResponse.json({ error: 'Invalid property' }, { status: 400, headers: H });

  ensureProviders();
  let property: Record<string, unknown> | null = null;
  try {
    const snap = await adminDb.collection('properties').doc(propertyId).get();
    property = snap.exists ? (snap.data() as Record<string, unknown>) : null;
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
  const plan = planCheckout(property, providerFor);
  if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status, headers: H });

  let orderId = '';
  let held = false;
  try {
    orderId = await createOrder({ uid: user.uid, propertyId, amountMinor: plan.quote.amountMinor, currency: plan.quote.currency, providerId: plan.provider.id });
    // Hold the property for this buyer (15 minutes), or refuse when it is sold or held by someone else, exactly like Pi payments.
    const v = await reserveForPayment(propertyId, user.uid, user.username, orderId);
    if (!v.ok) {
      await deleteOrder(orderId).catch(() => {});
      return NextResponse.json({ error: RESERVE_ERRORS[v.code] }, { status: 409, headers: H });
    }
    held = true;
    const origin = req.nextUrl.origin;
    const session = await plan.provider.createCheckout({
      orderId, amountMinor: plan.quote.amountMinor, currency: plan.quote.currency,
      description: String(property?.title ?? 'Property').slice(0, 120), returnUrl: `${origin}/payment/card-return`, customerUid: user.uid,
    });
    await setProviderRef(orderId, session.providerRef);
    return NextResponse.json({ orderId, redirectUrl: session.redirectUrl }, { headers: H });
  } catch {
    if (held) await releaseReservation(propertyId, user.uid).catch(() => {});
    if (orderId) await deleteOrder(orderId).catch(() => {});
    return NextResponse.json({ error: 'Could not start the payment, try again' }, { status: 503, headers: H });
  }
}
