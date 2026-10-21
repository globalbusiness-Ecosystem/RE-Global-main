import { NextRequest, NextResponse } from 'next/server';
import { busyRanges } from '@/lib/booking-calendar';
import { buildFeed } from '@/lib/ical';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Public calendar feed (.ics) of the taken days of a hotel / rental listing: dates only, no personal data.
// Calendar apps poll it, so it is cached for 5 minutes and limited per IP.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const rl = await consumeRateLimit(`ical:${clientIp(req)}`, 60, 10 * 60 * 1000);
  if (!rl.ok) return new NextResponse('Too many requests', { status: 429, headers: { 'Retry-After': String(rl.retryAfter), 'Cache-Control': 'no-store' } });
  const { id } = await ctx.params;
  const propertyId = id.replace(/\.ics$/i, '');
  try {
    const busy = await busyRanges(propertyId);
    return new NextResponse(buildFeed(propertyId, 'RE Global', busy, Date.now()), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="availability.ics"',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return new NextResponse('Calendar unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
