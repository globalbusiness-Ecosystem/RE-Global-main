import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { guestCancelBooking, guestCancelQuote } from '@/lib/booking-cancel';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'no-store' };

async function authed(req: NextRequest) {
  try {
    return { user: await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')) };
  } catch (err) {
    return { res: NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401 }) };
  }
}

// ?bookingId=... -> what the guest would get back if they cancelled now.
export async function GET(req: NextRequest) {
  const a = await authed(req);
  if (a.res) return a.res;
  const limited = await rateLimited('cancel-quote', a.user!.uid, 60, 10 * 60 * 1000);
  if (limited) return limited;
  try {
    const r = await guestCancelQuote(a.user!.uid, req.nextUrl.searchParams.get('bookingId'));
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
    return NextResponse.json(r, { headers: NO_STORE });
  } catch (err) {
    console.error('[bookings/cancel] quote error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: NO_STORE });
  }
}

// { bookingId } cancels the guest's own stay and queues the refund the policy allows.
export async function POST(req: NextRequest) {
  const a = await authed(req);
  if (a.res) return a.res;
  const limited = await rateLimited('cancel', a.user!.uid, 10, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  try {
    const r = await guestCancelBooking(a.user!.uid, body?.bookingId);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
    return NextResponse.json({ ok: true, refund: r.refund, pct: r.pct }, { headers: NO_STORE });
  } catch (err) {
    console.error('[bookings/cancel] cancel error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: NO_STORE });
  }
}
