import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { COLLECTION, isKind, parseContent } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const serverError = () => NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
const validId = (id: string) => /^[A-Za-z0-9_-]{1,128}$/.test(id);

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const kind = req.nextUrl.searchParams.get('kind');
  if (!isKind(kind)) return bad('Invalid kind');
  try {
    const snap = await adminDb.collection(COLLECTION[kind]).get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json({ ok: true, items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/content] list error:', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const kind = body?.kind;
  if (!isKind(kind)) return bad('Invalid kind');
  const parsed = parseContent(kind, body);
  if (!parsed.ok) return bad(parsed.error);
  try {
    const ref = await adminDb.collection(COLLECTION[kind]).add({ ...parsed.doc, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    await logAdmin('content.create', { kind, id: ref.id });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error('[admin/content] add error:', err);
    return serverError();
  }
}

// { kind, patch:{active} } toggles; otherwise a full edit that replaces the item (keeps createdAt).
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!validId(id)) return bad('Invalid id');
  const body = await req.json().catch(() => null);
  const kind = body?.kind;
  if (!isKind(kind)) return bad('Invalid kind');
  const ref = adminDb.collection(COLLECTION[kind]).doc(id);
  try {
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (body.patch && typeof body.patch === 'object') {
      if (typeof body.patch.active !== 'boolean') return bad('Nothing to update');
      await ref.update({ active: body.patch.active, updatedAt: Timestamp.now() });
      await logAdmin('content.toggle', { kind, id, active: body.patch.active });
      return NextResponse.json({ ok: true });
    }
    const parsed = parseContent(kind, body);
    if (!parsed.ok) return bad(parsed.error);
    await ref.set({ ...parsed.doc, createdAt: snap.data()?.createdAt ?? Timestamp.now(), updatedAt: Timestamp.now() });
    await logAdmin('content.update', { kind, id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/content] update error:', err);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = req.nextUrl.searchParams.get('id') ?? '';
  const kind = req.nextUrl.searchParams.get('kind');
  if (!validId(id) || !isKind(kind)) return bad('Invalid request');
  try {
    await adminDb.collection(COLLECTION[kind]).doc(id).delete();
    await logAdmin('content.delete', { kind, id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/content] delete error:', err);
    return serverError();
  }
}
