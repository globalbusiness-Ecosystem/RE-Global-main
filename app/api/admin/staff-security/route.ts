import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getRequireStaffTotp, setRequireStaffTotp } from '@/lib/admin-accounts';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Owner only (not in any role's areas): must every staff login carry an authenticator code?
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, requireTotp: await getRequireStaffTotp() }, { headers: H });
}

// { requireTotp: boolean }
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as { requireTotp?: unknown } | null;
  if (typeof b?.requireTotp !== 'boolean') return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400, headers: H });
  await setRequireStaffTotp(b.requireTotp);
  await logAdmin('admin.staffTotp.policy', { requireTotp: b.requireTotp });
  return NextResponse.json({ ok: true, requireTotp: b.requireTotp }, { headers: H });
}
