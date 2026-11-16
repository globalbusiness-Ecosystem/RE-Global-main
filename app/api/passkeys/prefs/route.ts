import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { STEPUP_HEADER, consumeStepUp, passkeyCount, requiresStepUp, setRequireStepUp } from '@/lib/stepup-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

async function who(req: NextRequest) {
  try { return { user: await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')) }; }
  catch (err) { return { res: NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS }) }; }
}

// Does this account ask for its fingerprint before payments and data erasure? (The payment screen asks this before it starts.)
export async function GET(req: NextRequest) {
  const a = await who(req);
  if (!a.user) return a.res;
  const limited = await rateLimited('passkeys-read', a.user.uid, 60, 60 * 1000);
  if (limited) return limited;
  try {
    const [required, count] = await Promise.all([requiresStepUp(a.user.uid), passkeyCount(a.user.uid)]);
    return NextResponse.json({ requireStepUp: required, passkeys: count }, { headers: HEADERS });
  } catch (err) {
    console.error('[passkeys/prefs] read error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}

// { requireStepUp: boolean } with a fresh X-Stepup-Token. Turning it on or off both need a fingerprint check just now:
// on proves this device can answer (no self-lock-out), off stops someone with a stolen session from removing the protection.
export async function PUT(req: NextRequest) {
  const a = await who(req);
  if (!a.user) return a.res;
  const limited = await rateLimited('passkeys-write', a.user.uid, 30, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.requireStepUp !== 'boolean') return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: HEADERS });
  try {
    if (body.requireStepUp && (await passkeyCount(a.user.uid)) === 0) return NextResponse.json({ error: 'no_passkey' }, { status: 409, headers: HEADERS });
    if (!(await consumeStepUp(a.user.uid, req.headers.get(STEPUP_HEADER)))) return NextResponse.json({ error: 'stepup_required' }, { status: 403, headers: HEADERS });
    await setRequireStepUp(a.user.uid, body.requireStepUp);
    return NextResponse.json({ ok: true, requireStepUp: body.requireStepUp }, { headers: HEADERS });
  } catch (err) {
    console.error('[passkeys/prefs] write error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
