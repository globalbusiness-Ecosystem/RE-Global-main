import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/admin-session';
import { isAdminRequest } from '@/lib/admin-guard';
import { revokeAllSessions } from '@/lib/admin-revoke';
import { logAdmin } from '@/lib/admin-audit';
import { alertAdmin, adminAlertContext } from '@/lib/admin-alert';

export const dynamic = 'force-dynamic';

// Log out every admin session everywhere (use it if a PIN, a phone or a browser may be compromised).
// Sessions issued after this moment work normally, so you can log in again right away.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  await revokeAllSessions();
  await logAdmin('admin.revoke', {});
  await alertAdmin('revoke', 'تم الخروج من كل جلسات الأدمن', adminAlertContext(req));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
