import { NextRequest, NextResponse } from 'next/server';
import { matchTotp } from '@/lib/totp';
import { ADMIN_COOKIE_NAME, isAdminSessionConfigured } from '@/lib/admin-session';
import { isAdminRequest } from '@/lib/admin-guard';
import { clientKey, safeEqual, registerFailure, loginGate, completeAdminLogin, getDb } from '@/lib/admin-login-guard';
import { adminHasPasskeys } from '@/lib/admin-passkeys';

export const dynamic = 'force-dynamic';

// A 6-digit code works once: remember the last accepted 30-second step, refuse the same step (or older) again.
const memoryStep = { v: 0 };
async function acceptStep(step: number): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const ref = db.collection('admin_login_attempts').doc('_totp');
      return await db.runTransaction(async (tx) => {
        const last = Number((await tx.get(ref)).data()?.lastStep || 0);
        if (step <= last) return false;
        tx.set(ref, { lastStep: step, updatedAt: Date.now() });
        return true;
      });
    } catch { /* fall back to memory */ }
  }
  if (step <= memoryStep.v) return false;
  memoryStep.v = step;
  return true;
}

export async function POST(req: NextRequest) {
  const ADMIN_PIN = process.env.ADMIN_PIN;
  if (!ADMIN_PIN || !isAdminSessionConfigured()) {
    return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
  }
  const key = clientKey(req);
  const gated = await loginGate(req, key);
  if (gated) return gated;
  const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim();
  let pin: unknown, code: unknown;
  try { ({ pin, code } = await req.json()); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 }); }

  if (typeof pin !== 'string' || !safeEqual(pin, ADMIN_PIN)) {
    await registerFailure(key);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (totpSecret) {
    // Second step: the 6-digit code. A wrong code counts like a wrong PIN, and the answer never says which one was wrong.
    const step = matchTotp(totpSecret, code);
    if (step === null || !(await acceptStep(step))) {
      await registerFailure(key);
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  } else if (process.env.ADMIN_PASSKEY_REQUIRED === '1' && (await adminHasPasskeys())) {
    // The owner asked for the fingerprint to be mandatory once one is registered: the PIN alone is no longer enough.
    await registerFailure(key);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return completeAdminLogin(req, key, totpSecret ? 'totp' : 'pin');
}
export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: await isAdminRequest(req), twoFactor: !!process.env.ADMIN_TOTP_SECRET?.trim(), passkey: await adminHasPasskeys() });
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
