import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { listClientErrors } from '@/lib/client-error-store';

export const dynamic = 'force-dynamic';

// Errors that visitors' browsers hit, newest first.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, rows: await listClientErrors() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/client-errors] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
