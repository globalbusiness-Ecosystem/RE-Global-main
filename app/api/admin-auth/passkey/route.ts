import { NextRequest, NextResponse } from 'next/server';
import { isAdminSessionConfigured } from '@/lib/admin-session';
import { clientKey, safeEqual, registerFailure, loginGate, completeAdminLogin } from '@/lib/admin-login-guard';
import { ADMIN_PASSKEY_UID } from '@/lib/admin-passkeys';
import { beginAuthentication, finishAuthentication } from '@/lib/passkeys-server';
import { ipLimited } from '@/lib/rate-guard';

export const dynamic = 'force-dynamic';

// Admin sign-in with PIN + fingerprint (instead of the 6-digit code). Two calls: { step: 'options', pin } then { step: 'verify', pin, challengeId, response }.
// Same lock-out and attempt budget as the PIN sign-in, and the PIN is checked on both calls, so this route cannot be used to guess it.
export async function POST(req: NextRequest) {
  const ADMIN_PIN = process.env.ADMIN_PIN;
  if (!ADMIN_PIN || !isAdminSessionConfigured()) return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
  const slow = await ipLimited('admin-passkey', req, 40, 15 * 60 * 1000); // on top of the lock-out below
  if (slow) return slow;
  const key = clientKey(req);
  const gated = await loginGate(req, key);
  if (gated) return gated;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  if (typeof body.pin !== 'string' || !safeEqual(body.pin, ADMIN_PIN)) {
    await registerFailure(key);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    if (body.step === 'options') {
      const r = await beginAuthentication('admin', ADMIN_PASSKEY_UID, req.headers.get('origin'), ADMIN_PASSKEY_UID);
      if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
      return NextResponse.json({ ok: true, challengeId: r.challengeId, options: r.options });
    }
    if (body.step === 'verify') {
      const r = await finishAuthentication('admin', ADMIN_PASSKEY_UID, ADMIN_PASSKEY_UID, { origin: req.headers.get('origin'), challengeId: body.challengeId, response: body.response });
      if (!r.ok) {
        await registerFailure(key);
        return NextResponse.json({ ok: false }, { status: 401 });
      }
      return completeAdminLogin(req, key, 'passkey');
    }
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  } catch (err) {
    console.error('[admin-auth/passkey] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
