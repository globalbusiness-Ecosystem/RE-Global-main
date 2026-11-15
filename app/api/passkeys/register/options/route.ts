import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { beginRegistration } from '@/lib/passkeys-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

// Step 1 of adding a passkey: the challenge the device will sign.
export async function POST(req: NextRequest) {
  let user;
  try { user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')); }
  catch (err) { return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS }); }
  const limited = await rateLimited('passkeys-register', user.uid, 20, 60 * 60 * 1000);
  if (limited) return limited;
  try {
    const r = await beginRegistration(user.uid, user.username, req.headers.get('origin'));
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
    return NextResponse.json({ challengeId: r.challengeId, options: r.options }, { headers: HEADERS });
  } catch (err) {
    console.error('[passkeys/register/options] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
