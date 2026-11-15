import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { ADMIN_PASSKEY_UID } from '@/lib/admin-passkeys';
import { deletePasskey, listPasskeys } from '@/lib/passkeys-server';
import { isCredentialId } from '@/lib/passkeys';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// The admin panel's own passkeys (names and dates only).
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ ok: true, passkeys: await listPasskeys(ADMIN_PASSKEY_UID) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/passkeys] list error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// ?id=: removes one admin passkey.
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!isCredentialId(id)) return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  try {
    if (!(await deletePasskey(ADMIN_PASSKEY_UID, id))) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    await logAdmin('admin.passkey.remove', { id: id.slice(0, 8) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/passkeys] delete error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
