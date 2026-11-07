import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ipLimited } from '@/lib/rate-guard';
import { ensureProviders } from '@/lib/card-pay/registry';
import { providerFor } from '@/lib/card-pay/provider';
import { planCheckout } from '@/lib/card-pay/checkout';

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
    const plan = planCheckout(snap.exists ? (snap.data() as Record<string, unknown>) : null, providerFor);
    return NextResponse.json({ available: plan.ok }, { headers: H });
  } catch {
    return NextResponse.json({ available: false }, { headers: H });
  }
}
