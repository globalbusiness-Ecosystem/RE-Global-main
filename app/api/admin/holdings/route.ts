import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';
import { logAdmin } from '@/lib/admin-audit';
import { adminHoldings, adminCancelHolding } from '@/lib/share-market';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ ok: true, ...(await adminHoldings()) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/holdings] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id } cancels a share purchase: the shares go back to the property and a refund is queued for the buyer.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  try {
    const r = await adminCancelHolding(typeof body?.id === 'string' ? body.id : '');
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
    await logAdmin('shares.cancel', { id: body.id, title: r.title, buyer: r.username, shares: r.shares, refund: r.amount });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/holdings] cancel error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
