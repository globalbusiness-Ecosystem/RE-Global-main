import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getAbout } from '@/lib/about-server';

export const dynamic = 'force-dynamic';

// Public: the cover picture and contact links of the About page. Cached for a minute.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('about', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  return NextResponse.json(await getAbout(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
