import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { adminOccupancy } from '@/lib/occupancy-admin';
import { parseWindow } from '@/lib/occupancy';

export const dynamic = 'force-dynamic';

// ?days=7|30|90 -> occupancy of every hotel and rental.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await adminOccupancy(parseWindow(req.nextUrl.searchParams.get('days')))) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/occupancy] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
