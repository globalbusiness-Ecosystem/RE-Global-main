import { NextRequest, NextResponse } from 'next/server';
import { isAdminSessionConfigured } from '@/lib/admin-session';
import { clientKey, registerFailure, loginGate, completeAdminLogin } from '@/lib/admin-login-guard';
import { checkStaffLogin } from '@/lib/admin-accounts';
import { logAdmin } from '@/lib/admin-audit';
import { alertAdmin, adminAlertContext } from '@/lib/admin-alert';
import { consumeRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Sign-in of a staff admin account (name + PIN). Same lock and attempt budget as the owner's PIN.
// The answer never says whether the name exists, the PIN was wrong, or the account is suspended.
export async function POST(req: NextRequest) {
  if (!isAdminSessionConfigured()) return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
  const key = clientKey(req);
  // A second, plain per-device limit on top of the lock and the global budget.
  if (!(await consumeRateLimit(`admin-staff-login:${key}`, 20, 10 * 60 * 1000)).ok) return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  const gated = await loginGate(req, key);
  if (gated) return gated;
  let username: unknown, pin: unknown;
  try { ({ username, pin } = await req.json()); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 }); }
  const r = await checkStaffLogin(username, pin);
  if (!r.ok) {
    await registerFailure(key);
    if (r.suspended) {
      await logAdmin('admin.login.suspended', { actor: r.id });
      await alertAdmin(`suspended-${r.id}`, `محاولة دخول من أدمن موقوف: ${r.id}`, adminAlertContext(req));
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return completeAdminLogin(req, key, 'pin', { sub: r.id, role: r.role, name: r.name });
}
