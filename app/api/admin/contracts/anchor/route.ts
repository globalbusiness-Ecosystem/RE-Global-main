import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { syncCardContracts } from '@/lib/chain-sync';

export const dynamic = 'force-dynamic';

// Tries again to put card contracts on the blockchain (up to 10 per call). Safe to repeat. The daily job does the same on its own.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const out = await syncCardContracts(10);
    await logAdmin('contracts.anchor', out);
    return NextResponse.json({ ok: true, ...out }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/contracts/anchor] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
