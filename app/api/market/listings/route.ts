import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/market-auth';
import { createListing, listOpenListings } from '@/lib/share-market';
import { getResaleFeePct } from '@/lib/market-settings';
import { consumeRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'no-store' };

// Public: shares currently for sale.
export async function GET() {
  try {
    const [listings, feePct] = await Promise.all([listOpenListings(), getResaleFeePct()]);
    return NextResponse.json({ listings, feePct }, { headers: NO_STORE });
  } catch (err) {
    console.error('[market/listings] list error:', err);
    return NextResponse.json({ listings: [], feePct: 2 }, { headers: NO_STORE });
  }
}

// Put some of your shares on sale: { propertyId, shares, pricePerShare }.
export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  const rl = await consumeRateLimit(`listing:${user.uid}`, 20, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  const body = await req.json().catch(() => ({}));
  try {
    const r = await createListing({ uid: user.uid, username: user.username, propertyId: String(body?.propertyId ?? ''), shares: body?.shares, pricePerShare: body?.pricePerShare });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
    return NextResponse.json({ ok: true, id: r.id }, { headers: NO_STORE });
  } catch (err) {
    console.error('[market/listings] create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: NO_STORE });
  }
}
