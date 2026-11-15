import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { finishRegistration } from '@/lib/passkeys-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

// Step 2: the device's signed answer. { challengeId, response, label? }
export async function POST(req: NextRequest) {
  let user;
  try { user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')); }
  catch (err) { return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS }); }
  const limited = await rateLimited('passkeys-register', user.uid, 20, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: HEADERS });
  try {
    const r = await finishRegistration(user.uid, user.username, { origin: req.headers.get('origin'), challengeId: body.challengeId, response: body.response, label: body.label });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
    return NextResponse.json({ ok: true, passkey: r.passkey }, { headers: HEADERS });
  } catch (err) {
    console.error('[passkeys/register/verify] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
