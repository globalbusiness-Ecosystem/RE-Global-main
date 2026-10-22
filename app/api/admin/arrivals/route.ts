import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { adminArrivals } from '@/lib/arrivals-admin';
import { parseArrivalWindow } from '@/lib/arrivals';

export const dynamic = 'force-dynamic';

// ?days=3|7|14 -> arrivals and departures of confirmed stays.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await adminArrivals(parseArrivalWindow(req.nextUrl.searchParams.get('days')))) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/arrivals] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
