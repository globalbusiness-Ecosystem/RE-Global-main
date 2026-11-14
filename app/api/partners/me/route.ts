import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { myPartnerView } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

// The signed-in user's partner status and, once approved, their invite code, invited customers and commission lines.
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Not authenticated' }, { status, headers: HEADERS });
  }
  const limited = await rateLimited('partners-me', user.uid, 30, 60 * 1000);
  if (limited) return limited;
  try {
    return NextResponse.json(await myPartnerView(user.uid, user.username), { headers: HEADERS });
  } catch (err) {
    console.error('[partners/me] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
