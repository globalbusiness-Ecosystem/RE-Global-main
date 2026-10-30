import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { adminRewardsOverview } from '@/lib/rewards-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await adminRewardsOverview()) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/rewards/overview] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
