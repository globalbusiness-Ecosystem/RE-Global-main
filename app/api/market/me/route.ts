import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/market-auth';
import { myMarket } from '@/lib/share-market';
import { rateLimited } from '@/lib/rate-guard';
import { loadMarketTitles } from '@/lib/market-titles-server';

export const dynamic = 'force-dynamic';

// The signed-in user's share positions, their listings and the money owed to them.
export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  const limited = await rateLimited('market-me', user.uid, 60, 10 * 60 * 1000);
  if (limited) return limited;
  try {
    const mine = await myMarket(user.uid);
    const titles = await loadMarketTitles([...mine.positions.map((p) => p.propertyId), ...mine.listings.map((l) => l.propertyId)]);
    return NextResponse.json({ ...mine, titles }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[market/me] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
