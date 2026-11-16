import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { beginAuthentication } from '@/lib/passkeys-server';
import { passkeyCount } from '@/lib/stepup-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

// Step 1 of "confirm with your fingerprint": the challenge the device will sign (only this account's passkeys are offered).
export async function POST(req: NextRequest) {
  let user;
  try { user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')); }
  catch (err) { return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS }); }
  const limited = await rateLimited('stepup', user.uid, 30, 10 * 60 * 1000);
  if (limited) return limited;
  try {
    if ((await passkeyCount(user.uid)) === 0) return NextResponse.json({ error: 'no_passkey' }, { status: 404, headers: HEADERS });
    const r = await beginAuthentication('stepup', user.uid, req.headers.get('origin'), user.uid);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
    return NextResponse.json({ challengeId: r.challengeId, options: r.options }, { headers: HEADERS });
  } catch (err) {
    console.error('[passkeys/stepup/options] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
