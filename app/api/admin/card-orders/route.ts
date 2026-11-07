import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const iso = (v: any) => (v?.toDate ? v.toDate().toISOString() : null);

// Orders paid (or tried) by card. The admin hands the property over to paid orders by hand, then marks them handed over.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const snap = await adminDb.collection('card_orders').orderBy('createdAt', 'desc').limit(200).get();
    const orders = snap.docs.map((d) => {
      const x = d.data();
      return {
        id: d.id, uid: String(x.uid ?? ''), propertyId: x.propertyId ?? null, amountMinor: Number(x.amountMinor) || 0, currency: String(x.currency ?? ''),
        status: String(x.status ?? ''), providerId: x.providerId ?? null, createdAt: iso(x.createdAt), handedOverAt: iso(x.handedOverAt), note: x.note ?? '',
      };
    });
    return NextResponse.json({ ok: true, orders }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/card-orders] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id, note? } marks a PAID order as handed over to the buyer.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id || id.includes('/') || id.length > 128) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  const note = typeof body?.note === 'string' ? body.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 300) : '';
  try {
    const ref = adminDb.collection('card_orders').doc(id);
    const r = await adminDb.runTransaction(async (tx) => {
      const s = await tx.get(ref);
      if (!s.exists) return 404;
      if (s.data()?.status !== 'paid') return 409;
      if (s.data()?.handedOverAt) return 409;
      tx.update(ref, { handedOverAt: Timestamp.now(), note });
      return 200;
    });
    if (r === 404) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (r === 409) return NextResponse.json({ ok: false, error: 'Only a paid order that is not handed over yet' }, { status: 409 });
    await logAdmin('card-order.handed-over', { id, note });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/card-orders] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
