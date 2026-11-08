import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ipLimited } from '@/lib/rate-guard';
import { ensureProviders } from '@/lib/card-pay/registry';
import { providerFor } from '@/lib/card-pay/provider';
import { canPayByCard, planCheckout } from '@/lib/card-pay/checkout';
import { isBookingType } from '@/lib/booking-rules';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Tells the page whether this listing can be paid by card right now (a provider is connected, the listing has a local
// price, and it is for sale). Public and read-only: it reveals nothing the listing page does not already show.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('card-config', req, 60, 60_000);
  if (limited) return limited;
  const id = req.nextUrl.searchParams.get('propertyId') ?? '';
  if (!id || id.includes('/') || id.length > 128) return NextResponse.json({ available: false }, { headers: H });
  ensureProviders();
  try {
    const snap = await adminDb.collection('properties').doc(id).get();
    const property = snap.exists ? (snap.data() as Record<string, unknown>) : null;
    const sp = req.nextUrl.searchParams;
    const start = sp.get('start');
    // A stay is priced for its dates, so the page can show the exact amount before the person pays.
    if (property && isBookingType(property.type) && start) {
      const plan = planCheckout(property, providerFor, { start, end: sp.get('end'), guests: sp.get('guests') ?? undefined });
      return NextResponse.json(plan.ok ? { available: true, amountMinor: plan.quote.amountMinor, currency: plan.quote.currency } : { available: false }, { headers: H });
    }
    if (property && isBookingType(property.type)) return NextResponse.json({ available: canPayByCard(property, providerFor) }, { headers: H });
    const plan = planCheckout(property, providerFor);
    return NextResponse.json(plan.ok ? { available: true, amountMinor: plan.quote.amountMinor, currency: plan.quote.currency } : { available: false }, { headers: H });
  } catch {
    return NextResponse.json({ available: false }, { headers: H });
  }
}
