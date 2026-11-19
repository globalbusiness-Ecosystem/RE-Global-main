import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getCelebration } from '@/lib/celebration-server';

export const dynamic = 'force-dynamic';

// Public: how the verification celebration should look and sound. Cached for a minute.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('celebration', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  return NextResponse.json(await getCelebration(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
