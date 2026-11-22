import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getFourEyes, setFourEyes } from '@/lib/kyc-four-eyes-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// The "four eyes" switch for identity decisions (on by default).
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getFourEyes()) }, { headers: H });
}

// { enabled: boolean }
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as { enabled?: unknown } | null;
  if (typeof b?.enabled !== 'boolean') return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400, headers: H });
  try {
    await setFourEyes(b.enabled);
    await logAdmin('kyc.fourEyes', { enabled: b.enabled });
    return NextResponse.json({ ok: true, enabled: b.enabled }, { headers: H });
  } catch (err) {
    console.error('[admin/kyc-four-eyes] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H });
  }
}
