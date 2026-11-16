import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { ipLimited } from '@/lib/rate-guard';
import { beginAuthentication, finishAuthentication } from '@/lib/passkeys-server';
import { webUsername } from '@/lib/web-auth';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };
const OWNER = 'web-login'; // nobody is signed in yet: the challenge is bound to this purpose, single use, 5 minutes

// Fast sign-in for web accounts (Google / e-mail link) that added a fingerprint in Settings.
// { step: 'options' } -> challenge; { step: 'verify', challengeId, response } -> a Firebase sign-in token.
// Only keys that belong to a web account (uid "web_...") are accepted - Pi accounts never sign in here.
export async function POST(req: NextRequest) {
  const slow = await ipLimited('passkey-login', req, 40, 15 * 60 * 1000);
  if (slow) return slow;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: HEADERS });
  try {
    if (body.step === 'options') {
      const r = await beginAuthentication('login', null, req.headers.get('origin'), OWNER);
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
      return NextResponse.json({ challengeId: r.challengeId, options: r.options }, { headers: HEADERS });
    }
    if (body.step === 'verify') {
      const r = await finishAuthentication('login', OWNER, null, { origin: req.headers.get('origin'), challengeId: body.challengeId, response: body.response });
      if (!r.ok || !r.uid.startsWith('web_') || r.uid.length <= 4 || r.uid.length > 132) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: HEADERS });
      const fuid = r.uid.slice(4);
      const account = await adminAuth.getUser(fuid).catch(() => null);
      if (!account || account.disabled) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: HEADERS });
      const token = await adminAuth.createCustomToken(fuid, { username: webUsername(fuid), passkeyLogin: true });
      return NextResponse.json({ ok: true, token }, { headers: HEADERS });
    }
    return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: HEADERS });
  } catch (err) {
    console.error('[auth/passkey-login] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
