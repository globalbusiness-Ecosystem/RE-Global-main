import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { COMMISSION_STATUSES } from '@/lib/partners';
import { commissionRow, summarize } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// ?status=accrued|paid|void (all when empty): commission lines of every partner, newest first, with totals per currency.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const status = req.nextUrl.searchParams.get('status') ?? '';
  try {
    const s = await adminDb.collection('partnerCommissions').limit(500).get();
    const all = s.docs.map((d: any) => commissionRow(d.id, d.data()));
    const rows = (COMMISSION_STATUSES as readonly string[]).includes(status) ? all.filter((r: any) => r.status === status) : all;
    rows.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return NextResponse.json({ ok: true, totals: summarize(all), rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/partner-commissions] list error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id, action: paid|void, note? } - only a line that is still owed can be marked paid or cancelled. Payment itself is made outside the platform.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  const action = body?.action === 'paid' || body?.action === 'void' ? body.action : '';
  if (!id || !action) return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  const note = typeof body.note === 'string' ? body.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 300) : '';
  try {
    const ref = adminDb.collection('partnerCommissions').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    const d = snap.data() ?? {};
    if (d.status !== 'accrued') return NextResponse.json({ ok: false, error: 'Already settled' }, { status: 409 });
    await ref.set({ status: action, note, ...(action === 'paid' ? { paidAt: Timestamp.now() } : {}) }, { merge: true });
    await logAdmin(`partner.commission.${action}`, { id, partner: d.partner, amount: d.amount, currency: d.currency });
    return NextResponse.json({ ok: true, status: action });
  } catch (err) {
    console.error('[admin/partner-commissions] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
