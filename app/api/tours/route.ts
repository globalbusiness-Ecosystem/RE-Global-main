import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { toursPublic } from '@/lib/tours-server';

export const dynamic = 'force-dynamic';

// Public, read-only: is the tours entry on, and which listings can be toured (links the listing pages already show).
export async function GET(req: NextRequest) {
  const limited = await ipLimited('tours', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  return NextResponse.json(await toursPublic(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
