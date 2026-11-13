import 'server-only';
import { NextResponse } from 'next/server';
import { getHomeFeatures } from '@/lib/home-features-server';

export const dynamic = 'force-dynamic';

// Public: every visitor sees the home page strip. Cached for a minute so it costs almost nothing.
export async function GET() {
  return NextResponse.json(await getHomeFeatures(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
