import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { validUsername } from '@/lib/ban-list';
import { adminUserDetail } from '@/lib/admin-user';

export const dynamic = 'force-dynamic';

// GET ?username=… : one user's contracts, bookings, share purchases, listings and payouts (admin support view).
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const username = req.nextUrl.searchParams.get('username');
  if (!validUsername(username)) return NextResponse.json({ ok: false, error: 'Invalid username' }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, ...(await adminUserDetail(username)) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/user-detail] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
