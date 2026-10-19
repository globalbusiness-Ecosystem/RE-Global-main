import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getShowDemo } from '@/lib/demo-listings-server';

export const dynamic = 'force-dynamic';

// Public, read-only display switches for the site. Fails soft: if anything goes wrong the sample listings stay visible.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('site-settings', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  const showDemoListings = await getShowDemo();
  return NextResponse.json({ showDemoListings }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
