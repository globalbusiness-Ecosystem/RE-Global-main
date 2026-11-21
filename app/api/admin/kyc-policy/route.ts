import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getKycPolicy, setKycPolicy } from '@/lib/kyc-policy';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Whether every account (Pi too) must pass the identity check before paying.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, policy: await getKycPolicy() }, { headers: H });
}

// { requireAll: boolean }
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (typeof b?.requireAll !== 'boolean') return NextResponse.json({ ok: false, error: 'Invalid' }, { status: 400, headers: H });
  try {
    await setKycPolicy({ requireAll: b.requireAll });
    await logAdmin('kyc.policy', { requireAll: b.requireAll });
    return NextResponse.json({ ok: true, policy: { requireAll: b.requireAll } }, { headers: H });
  } catch (err) {
    console.error('[admin/kyc-policy] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H });
  }
}
