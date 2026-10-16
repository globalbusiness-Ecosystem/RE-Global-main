import { NextRequest, NextResponse } from 'next/server';
import { busyRanges } from '@/lib/booking-calendar';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Public: which days of a rent / hotel listing are already taken (no personal data).
// Short CDN cache + per-IP limit, so nobody can turn this open endpoint into a stream of Firestore reads.
// The booking itself is re-checked on the server when it is paid, so a few seconds of delay here is harmless.
export async function GET(req: NextRequest) {
  const rl = await consumeRateLimit(`avail:${clientIp(req)}`, 120, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ busy: [], error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter), 'Cache-Control': 'no-store' } });
  }
  const propertyId = req.nextUrl.searchParams.get('propertyId') ?? '';
  try {
    const busy = await busyRanges(propertyId);
    return NextResponse.json({ busy }, { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' } });
  } catch {
    return NextResponse.json({ busy: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
