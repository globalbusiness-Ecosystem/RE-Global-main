import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { finishAuthentication } from '@/lib/passkeys-server';
import { issueStepUp } from '@/lib/stepup-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

// Step 2: the device's signed answer. { challengeId, response } -> a one-time token (2 minutes) to send as X-Stepup-Token.
export async function POST(req: NextRequest) {
  let user;
  try { user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')); }
  catch (err) { return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS }); }
  const limited = await rateLimited('stepup', user.uid, 30, 10 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: HEADERS });
  try {
    const r = await finishAuthentication('stepup', user.uid, user.uid, { origin: req.headers.get('origin'), challengeId: body.challengeId, response: body.response });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
    return NextResponse.json({ ok: true, token: await issueStepUp(user.uid) }, { headers: HEADERS });
  } catch (err) {
    console.error('[passkeys/stepup/verify] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
