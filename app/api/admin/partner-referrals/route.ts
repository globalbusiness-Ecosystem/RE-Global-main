import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getPartner, syncCommissions, commissionRow } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const clean = (v: unknown) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, '').trim().slice(0, 80) : '');
const iso = (t: any) => (t && typeof t.toMillis === 'function' ? new Date(t.toMillis()).toISOString() : null);

// A person can be found by account username, chosen username (handle) or invite code.
async function findAccount(q: string): Promise<{ username: string; data: Record<string, any> } | null> {
  if (!q || q.includes('/')) return null;
  const direct = await adminDb.collection('referrals').doc(q).get();
  if (direct.exists) return { username: direct.id, data: direct.data() ?? {} };
  for (const [field, value] of [['handle', q], ['code', q.toUpperCase()]] as const) {
    const s = await adminDb.collection('referrals').where(field, '==', value).limit(1).get();
    if (!s.empty) return { username: s.docs[0].id, data: s.docs[0].data() ?? {} };
  }
  return null;
}

// ?q=<username | handle | code>: how this customer is linked (who invited them), their purchases, and the commission lines those purchases produced.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const q = clean(req.nextUrl.searchParams.get('q'));
  if (!q) return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  try {
    const acc = await findAccount(q);
    if (!acc) return NextResponse.json({ ok: true, found: false }, { headers: { 'Cache-Control': 'no-store' } });
    const [contracts, bookings, lines] = await Promise.all([
      adminDb.collection('contracts').where('buyerUsername', '==', acc.username).limit(50).get(),
      typeof acc.data.uid === 'string' && acc.data.uid ? adminDb.collection('bookings').where('uid', '==', acc.data.uid).limit(50).get() : Promise.resolve({ docs: [] as any[] }),
      adminDb.collection('partnerCommissions').where('referee', '==', acc.username).limit(50).get(),
    ]);
    return NextResponse.json({
      ok: true, found: true, username: acc.username, handle: acc.data.handle ?? null, code: acc.data.code ?? null,
      referredBy: acc.data.referredBy ?? null, referredAt: iso(acc.data.referredAt), linkedByAdmin: !!acc.data.linkedByAdmin,
      contracts: contracts.docs.map((d: any) => ({ id: d.id, status: d.data().status ?? '', type: d.data().type ?? '', amount: d.data().amount ?? 0, currency: d.data().currency ?? '', createdAt: iso(d.data().createdAt) })),
      confirmedBookings: bookings.docs.filter((d: any) => d.data().status === 'confirmed').length,
      commissions: lines.docs.map((d: any) => commissionRow(d.id, d.data())),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/partner-referrals] lookup error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { customer, partner, force? } - links a customer to an approved partner by hand (for an invite the automatic check refused, e.g. the friend
// already had activity before using the code), then writes the commission lines of purchases made after the partner was approved.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const customerQ = clean(body?.customer), partnerQ = clean(body?.partner);
  if (!customerQ || !partnerQ) return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  try {
    const [customer, partnerAcc] = await Promise.all([findAccount(customerQ), findAccount(partnerQ)]);
    if (!customer) return NextResponse.json({ ok: false, error: 'Customer not found' }, { status: 404 });
    if (!partnerAcc) return NextResponse.json({ ok: false, error: 'Partner not found' }, { status: 404 });
    if (customer.username === partnerAcc.username) return NextResponse.json({ ok: false, error: 'Same account' }, { status: 400 });
    const partner = await getPartner(partnerAcc.username);
    if (!partner || partner.status !== 'approved') return NextResponse.json({ ok: false, error: 'Partner is not approved' }, { status: 409 });
    if (partnerAcc.data.referredBy === customer.username) return NextResponse.json({ ok: false, error: 'Mutual' }, { status: 400 });
    const current = customer.data.referredBy;
    if (current && current !== partnerAcc.username && body?.force !== true) return NextResponse.json({ ok: false, error: 'Already linked', referredBy: current }, { status: 409 });
    await adminDb.collection('referrals').doc(customer.username).set({ username: customer.username, referredBy: partnerAcc.username, referredAt: Timestamp.now(), linkedByAdmin: true }, { merge: true });
    const created = await syncCommissions(partnerAcc.username, partner);
    await logAdmin('partner.referral.link', { customer: customer.username, partner: partnerAcc.username, created });
    return NextResponse.json({ ok: true, partner: partnerAcc.username, created });
  } catch (err) {
    console.error('[admin/partner-referrals] link error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
