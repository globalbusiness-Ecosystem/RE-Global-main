import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { ipLimited, rateLimited } from '@/lib/rate-guard';
import { publicReviews, submitReview } from '@/lib/stay-reviews-server';

export const dynamic = 'force-dynamic';

// Public: ?propertyId=... -> average + latest visible reviews. Short CDN cache and a per-IP limit.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('reviews', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  try {
    const data = await publicReviews(req.nextUrl.searchParams.get('propertyId') ?? '');
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
  } catch {
    return NextResponse.json({ summary: { count: 0, avg: 0 }, reviews: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

// Signed-in guest: { bookingId, rating, comment? } reviews a finished stay (once per booking).
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401 });
  }
  const limited = await rateLimited('review', user.uid, 10, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  try {
    const r = await submitReview(user.uid, user.username, body?.bookingId, body);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reviews] submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
