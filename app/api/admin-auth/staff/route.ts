import { NextRequest, NextResponse } from 'next/server';
import { isAdminSessionConfigured } from '@/lib/admin-session';
import { clientKey, registerFailure, loginGate, completeAdminLogin } from '@/lib/admin-login-guard';
import { checkStaffLogin } from '@/lib/admin-accounts';
import { logAdmin } from '@/lib/admin-audit';
import { alertAdmin, adminAlertContext } from '@/lib/admin-alert';
import { consumeRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Sign-in of a staff admin account: name + PIN, then the authenticator code when the account has one (or the owner requires one).
// Same lock and attempt budget as the owner's PIN. A wrong name, a wrong PIN and a suspended account all get the same answer.
// Only after the PIN is right does the answer say a code is needed (needCode) or must be set up first (needEnroll).
export async function POST(req: NextRequest) {
  if (!isAdminSessionConfigured()) return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
  const key = clientKey(req);
  // A second, plain per-device limit on top of the lock and the global budget.
  if (!(await consumeRateLimit(`admin-staff-login:${key}`, 20, 10 * 60 * 1000)).ok) return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  const gated = await loginGate(req, key);
  if (gated) return gated;
  let username: unknown, pin: unknown, code: unknown;
  try { ({ username, pin, code } = await req.json()); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 }); }
  const r = await checkStaffLogin(username, pin, code);
  if (!r.ok) {
    if (r.needCode) return NextResponse.json({ ok: false, needCode: true }, { status: 401 });
    if (r.needEnroll) return NextResponse.json({ ok: false, needEnroll: true }, { status: 401 });
    await registerFailure(key);
    if (r.suspended) {
      await logAdmin('admin.login.suspended', { actor: r.id });
      await alertAdmin(`suspended-${r.id}`, `محاولة دخول من أدمن موقوف: ${r.id}`, adminAlertContext(req));
    } else if (r.badCode) {
      await logAdmin('admin.login.badcode', { actor: r.id });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return completeAdminLogin(req, key, r.usedCode ? 'totp' : 'pin', { sub: r.id, role: r.role, name: r.name });
}
