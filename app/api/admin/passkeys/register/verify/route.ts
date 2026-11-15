import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { ADMIN_PASSKEY_UID } from '@/lib/admin-passkeys';
import { finishRegistration } from '@/lib/passkeys-server';

export const dynamic = 'force-dynamic';

// Step 2: the device's signed answer. { challengeId, response, label? }
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  try {
    const r = await finishRegistration(ADMIN_PASSKEY_UID, 'admin', { origin: req.headers.get('origin'), challengeId: body.challengeId, response: body.response, label: body.label });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    await logAdmin('admin.passkey.add', { label: r.passkey.label });
    return NextResponse.json({ ok: true, passkey: r.passkey });
  } catch (err) {
    console.error('[admin/passkeys/register/verify] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
