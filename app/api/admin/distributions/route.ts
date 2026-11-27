import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { approveRun, cancelDraft, computeForProperty, distributionsUnlocked, getRun, listRuns, saveDraft } from '@/lib/distribution-server';

export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'no-store' };
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: HEADERS });

// Working out and saving a distribution never moves money and never creates a payout. Only 'approve' does, and only when DISTRIBUTIONS_ENABLED=1.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const run = await getRun(id);
      return run ? NextResponse.json({ ok: true, run }, { headers: HEADERS }) : fail('Run not found', 404);
    }
    return NextResponse.json({ ok: true, runs: await listRuns(), unlocked: distributionsUnlocked() }, { headers: HEADERS });
  } catch (err) {
    console.error('[admin/distributions] read error:', err);
    return fail('Server error', 500);
  }
}

// { action: 'preview' | 'save' | 'cancel' | 'approve', ... }
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== 'object') return fail('Invalid request');
  try {
    if (b.action === 'cancel') {
      const r = await cancelDraft(String(b.id ?? ''));
      if (!r.ok) return fail(r.error, r.status);
      await logAdmin('distribution.cancel', { id: String(b.id) });
      return NextResponse.json({ ok: true }, { headers: HEADERS });
    }
    if (b.action === 'approve') {
      const r = await approveRun(String(b.id ?? ''), b.confirm);
      if (!r.ok) return fail(r.error, r.status);
      await logAdmin('distribution.approve', { id: String(b.id), paid: r.paid, held: r.held });
      return NextResponse.json({ ok: true, paid: r.paid, paidAmount: r.paidAmount, held: r.held, heldAmount: r.heldAmount }, { headers: HEADERS });
    }
    const q = { propertyId: b.propertyId, start: b.start, end: b.end, gross: b.gross, feePct: b.feePct };
    if (b.action === 'preview') {
      const c = await computeForProperty(q);
      return c.ok ? NextResponse.json({ ok: true, propertyTitle: c.propertyTitle, start: c.start, end: c.end, run: c.run }, { headers: HEADERS }) : fail(c.error, c.status);
    }
    if (b.action === 'save') {
      const note = String(b.note ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 200);
      const r = await saveDraft(q, note);
      if (!r.ok) return fail(r.error, r.status);
      await logAdmin('distribution.save', { id: r.id, title: String(b.propertyId), net: r.run.net });
      return NextResponse.json({ ok: true, id: r.id, run: r.run }, { headers: HEADERS });
    }
    return fail('Unknown action');
  } catch (err) {
    console.error('[admin/distributions] error:', err);
    return fail('Server error', 500);
  }
}
