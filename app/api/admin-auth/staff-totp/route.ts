import { NextRequest, NextResponse } from 'next/server';
import { isAdminSessionConfigured } from '@/lib/admin-session';
import { clientKey, registerFailure, loginGate } from '@/lib/admin-login-guard';
import { beginTotp, confirmTotp } from '@/lib/admin-accounts';
import { logAdmin } from '@/lib/admin-audit';
import { consumeRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Setting up the authenticator app for a staff account. The PIN proves who is asking (there is no session yet), with the same lock and budget as a login.
// { username, pin, step: 'begin' } -> { secret, uri } (shown once) | { username, pin, step: 'confirm', code } -> { ok: true }
export async function POST(req: NextRequest) {
  if (!isAdminSessionConfigured()) return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500, headers: H });
  const key = clientKey(req);
  if (!(await consumeRateLimit(`admin-staff-totp:${key}`, 20, 10 * 60 * 1000)).ok) return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429, headers: H });
  const gated = await loginGate(req, key);
  if (gated) return gated;
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (b?.step === 'begin') {
    const r = await beginTotp(b.username, b.pin);
    if (!r.ok) {
      if (r.reason === 'auth') { await registerFailure(key); return NextResponse.json({ ok: false }, { status: 401, headers: H }); }
      return NextResponse.json({ ok: false, error: 'already' }, { status: 409, headers: H });
    }
    await logAdmin('admin.totp.begin', { actor: String(b.username) });
    return NextResponse.json({ ok: true, secret: r.secret, uri: r.uri }, { headers: H });
  }
  if (b?.step === 'confirm') {
    const r = await confirmTotp(b.username, b.pin, b.code);
    if (!r.ok) { await registerFailure(key); return NextResponse.json({ ok: false }, { status: 401, headers: H }); }
    await logAdmin('admin.totp.enabled', { actor: String(b.username) });
    return NextResponse.json({ ok: true }, { headers: H });
  }
  return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400, headers: H });
}
