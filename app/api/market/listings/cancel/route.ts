import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/market-auth';
import { cancelListing } from '@/lib/share-market';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  const body = await req.json().catch(() => ({}));
  try {
    const r = await cancelListing(user.uid, String(body?.listingId ?? ''));
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[market/cancel] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
