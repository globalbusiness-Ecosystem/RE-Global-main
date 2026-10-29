import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { redeemReferral } from '@/lib/referrals-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

// { code } - a new customer uses a friend's referral code, once.
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Not authenticated' }, { status, headers: HEADERS });
  }
  const limited = await rateLimited('referral-redeem', user.uid, 10, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  try {
    const r = await redeemReferral(user.uid, user.username, body?.code);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
    return NextResponse.json({ ok: true }, { headers: HEADERS });
  } catch (err) {
    console.error('[referrals/redeem] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
