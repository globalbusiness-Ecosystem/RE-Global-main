import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { ADMIN_PASSKEY_UID } from '@/lib/admin-passkeys';
import { beginRegistration } from '@/lib/passkeys-server';

export const dynamic = 'force-dynamic';

// Step 1 of adding a fingerprint to the admin panel (needs an open admin session).
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const r = await beginRegistration(ADMIN_PASSKEY_UID, 'admin', req.headers.get('origin'));
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({ challengeId: r.challengeId, options: r.options }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/passkeys/register/options] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
