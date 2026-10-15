import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/market-auth';
import { myMarket } from '@/lib/share-market';

export const dynamic = 'force-dynamic';

// The signed-in user's share positions, their listings and the money owed to them.
export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  try {
    return NextResponse.json(await myMarket(user.uid), { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[market/me] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
