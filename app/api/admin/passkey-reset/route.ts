import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { eraseStepUpData } from '@/lib/stepup-server';

export const dynamic = 'force-dynamic';

// For a person who lost the device that held their fingerprint: removes their fingerprints and the lock setting
// (they can add a new device and switch the lock on again). { uid } - a Pi uid or "web_...".
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const uid = typeof body?.uid === 'string' ? body.uid.trim() : '';
  if (!uid || uid.length > 140 || uid.includes('/')) return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  try {
    await eraseStepUpData(uid);
    await logAdmin('user.passkeys.reset', { uid: uid.slice(0, 12) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/passkey-reset] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
