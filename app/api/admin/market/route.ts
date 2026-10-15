import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';
import { logAdmin } from '@/lib/admin-audit';
import { adminMarketOverview, adminCancelListing } from '@/lib/share-market';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ ok: true, ...(await adminMarketOverview()) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/market] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { listingId } takes an open listing off the market.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  try {
    const r = await adminCancelListing(typeof body?.listingId === 'string' ? body.listingId : '');
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
    await logAdmin('market.listing.cancel', { listingId: body.listingId, title: r.title, seller: r.sellerName });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/market] cancel error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
