import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { PROJECT_STATUSES, type ProjectStatus } from '@/lib/partner-projects';
import { projectView } from '@/lib/partner-projects-server';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const NEXT: Record<string, { from: ProjectStatus[]; to: ProjectStatus }> = {
  approve: { from: ['pending'], to: 'approved' },
  reject: { from: ['pending'], to: 'rejected' },
  hide: { from: ['approved'], to: 'hidden' },
  restore: { from: ['hidden'], to: 'approved' },
};

// ?status=pending|approved|rejected|hidden|draft (all when empty): the partners' projects with counts, newest first.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const status = req.nextUrl.searchParams.get('status') ?? '';
  try {
    const s = await adminDb.collection('partnerProjects').limit(500).get();
    const all = s.docs.map((d: any) => projectView(d.id, d.data()));
    const counts = Object.fromEntries(PROJECT_STATUSES.map((k) => [k, all.filter((p: any) => p.status === k).length]));
    const list = (PROJECT_STATUSES as readonly string[]).includes(status) ? all.filter((p: any) => p.status === status) : all;
    list.sort((a: any, b: any) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return NextResponse.json({ ok: true, counts, projects: list }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/partner-projects] list error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id, action: approve|reject|hide|restore, note? } - the note is shown to the partner (for example why a project was not approved).
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' && !body.id.includes('/') ? body.id : '';
  const step = typeof body?.action === 'string' ? NEXT[body.action] : undefined;
  if (!id || !step) return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  const note = typeof body.note === 'string' ? body.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 300) : '';
  try {
    const ref = adminDb.collection('partnerProjects').doc(id);
    const cur = (await ref.get()).data();
    if (!cur) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (!step.from.includes(cur.status)) return NextResponse.json({ ok: false, error: 'This step is not allowed from the current status' }, { status: 409 });
    const patch: Record<string, unknown> = { status: step.to, note, reviewedAt: Timestamp.now() };
    if (step.to === 'approved' && !cur.approvedAt) patch.approvedAt = Timestamp.now();
    await ref.update(patch);
    await logAdmin(`partner.project.${body.action}`, { id, owner: cur.owner, title: String(cur.title ?? '').slice(0, 80), from: cur.status, to: step.to });
    return NextResponse.json({ ok: true, status: step.to });
  } catch (err) {
    console.error('[admin/partner-projects] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
