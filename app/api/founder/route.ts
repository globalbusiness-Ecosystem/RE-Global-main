import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getFounder } from '@/lib/founder-server';

export const dynamic = 'force-dynamic';

// Public: the founder card of the About page (name, photo, words). Never the account id. Cached for a minute.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('founder', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  return NextResponse.json(await getFounder(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
