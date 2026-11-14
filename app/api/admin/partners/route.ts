import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { PARTNER_STATUSES, type PartnerStatus } from '@/lib/partners';
import { getPartner, publicProfile } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const NEXT: Record<string, { from: PartnerStatus[]; to: PartnerStatus }> = {
  approve: { from: ['pending', 'rejected'], to: 'approved' },
  reject: { from: ['pending'], to: 'rejected' },
  suspend: { from: ['approved'], to: 'suspended' },
  reinstate: { from: ['suspended'], to: 'approved' },
};

// ?status=pending|approved|rejected|suspended (all when empty): the partner applications, newest first.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const status = req.nextUrl.searchParams.get('status') ?? '';
  try {
    const s = await adminDb.collection('partners').limit(500).get();
    const all = s.docs.map((d: any) => publicProfile(d.data()));
    const counts = Object.fromEntries(PARTNER_STATUSES.map((k) => [k, all.filter((p: any) => p.status === k).length]));
    const list = (PARTNER_STATUSES as readonly string[]).includes(status) ? all.filter((p: any) => p.status === status) : all;
    list.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return NextResponse.json({ ok: true, counts, partners: list }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/partners] list error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { username, action: approve|reject|suspend|reinstate, note? } - the note is shown to the applicant (for example why it was rejected).
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username : '';
  const step = typeof body?.action === 'string' ? NEXT[body.action] : undefined;
  if (!username || !step) return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  const note = typeof body.note === 'string' ? body.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 300) : '';
  try {
    const cur = await getPartner(username);
    if (!cur) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (!step.from.includes(cur.status)) return NextResponse.json({ ok: false, error: 'This step is not allowed from the current status' }, { status: 409 });
    const patch: Record<string, unknown> = { status: step.to, note, reviewedAt: Timestamp.now(), updatedAt: Timestamp.now() };
    if (step.to === 'approved' && !cur.approvedAt) patch.approvedAt = Timestamp.now();
    await adminDb.collection('partners').doc(username).set(patch, { merge: true });
    await logAdmin(`partner.${body.action}`, { username, role: cur.role, from: cur.status, to: step.to });
    return NextResponse.json({ ok: true, status: step.to });
  } catch (err) {
    console.error('[admin/partners] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
