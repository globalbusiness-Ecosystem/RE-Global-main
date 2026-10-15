import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-session';
import { logAdmin } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const iso = (v: any) => (v?.toDate ? v.toDate().toISOString() : null);

// Money the platform owes to users after resales (seller proceeds) or failed resales (refunds).
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const snap = await adminDb.collection('payouts').get();
    const payouts = snap.docs
      .map((d) => { const x = d.data(); return { id: d.id, ...x, createdAt: iso(x.createdAt), paidAt: iso(x.paidAt) }; })
      .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return NextResponse.json({ ok: true, payouts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/payouts] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id, note? } marks a payout as paid (after the admin sent the Pi to the user).
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id || id.includes('/') || id.length > 128) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  const note = typeof body?.note === 'string' ? body.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 300) : '';
  try {
    const ref = adminDb.collection('payouts').doc(id);
    const r = await adminDb.runTransaction(async (tx) => {
      const s = await tx.get(ref);
      if (!s.exists) return 404;
      if (s.data()?.status === 'paid') return 409;
      tx.update(ref, { status: 'paid', paidAt: Timestamp.now(), note });
      return 200;
    });
    if (r === 404) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (r === 409) return NextResponse.json({ ok: false, error: 'Already paid' }, { status: 409 });
    await logAdmin('payout.paid', { id, note });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/payouts] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
