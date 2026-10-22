import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { setGuestRequest } from '@/lib/guest-requests-server';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'no-store' };

// { bookingId, note } saves the guest's special request on their own stay (an empty note clears it).
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: NO_STORE });
  }
  const limited = await rateLimited('guest-request', user.uid, 20, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  try {
    const r = await setGuestRequest(user.uid, body?.bookingId, body?.note);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
    return NextResponse.json({ ok: true, note: r.note }, { headers: NO_STORE });
  } catch (err) {
    console.error('[bookings/request] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: NO_STORE });
  }
}
