import 'server-only';
import { NextResponse } from 'next/server';
import { getMarketStats } from '@/lib/market-stats-server';

export const dynamic = 'force-dynamic';

// Public: aggregate market figures (listings by type and country, prices, completed deals per month). Cached for five minutes.
export async function GET() {
  try {
    return NextResponse.json(await getMarketStats(), { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
