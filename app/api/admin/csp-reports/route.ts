import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { listCsp } from '@/lib/csp-store';

export const dynamic = 'force-dynamic';

// The sources the site loads from, most frequent first (what a future strict policy has to allow).
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, rows: await listCsp() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/csp-reports] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
