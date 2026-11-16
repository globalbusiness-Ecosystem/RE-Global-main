import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getLockImage } from '@/lib/lock-image-server';

export const dynamic = 'force-dynamic';

// Public: the fingerprint screen is shown before sign-in. Cached for a minute.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('lock-image', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  return NextResponse.json(await getLockImage(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
