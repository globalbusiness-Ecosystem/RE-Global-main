import { NextRequest, NextResponse } from 'next/server';
import { getCancellationPolicy } from '@/lib/booking-cancel';
import { ipLimited } from '@/lib/rate-guard';

export const dynamic = 'force-dynamic';

// Public: the cancellation policy guests see before they book.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('policy', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  return NextResponse.json({ policy: await getCancellationPolicy() }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
}
