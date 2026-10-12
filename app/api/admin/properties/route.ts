import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-session';
import { parsePropertyInput, STATUSES } from '@/lib/admin-property';
import { logAdmin } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const serverError = () => NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
const validId = (id: string) => /^[A-Za-z0-9_-]{1,128}$/.test(id);

const iso = (v: any): string | null => v?.toDate?.().toISOString() ?? null;

// All listings (including hidden ones) for the admin panel.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const snap = await adminDb.collection('properties').get();
    const properties = snap.docs
      .map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: iso(data.createdAt), updatedAt: iso(data.updatedAt) };
      })
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return NextResponse.json({ ok: true, properties }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/properties] list error:', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => null);
  const parsed = parsePropertyInput(b);
  if (!parsed.ok) return bad(parsed.error);

  try {
    // useProperties() orders by createdAt, so a listing without it never shows up.
    const ref = await adminDb
      .collection('properties')
      .add({ ...parsed.doc, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    await logAdmin('property.create', { id: ref.id, title: parsed.doc.title });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error('[admin/properties] add error:', err);
    return serverError();
  }
}

// Two shapes:
//   { patch: { hidden?, featured?, status? } }  -> quick toggles
//   { ...fullPropertyFields }                    -> full edit (replaces the listing, keeps createdAt)
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!validId(id)) return bad('Invalid id');
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== 'object') return bad('Invalid request');

  const ref = adminDb.collection('properties').doc(id);
  try {
    if (b.patch && typeof b.patch === 'object') {
      const update: Record<string, unknown> = {};
      if (typeof b.patch.hidden === 'boolean') update.hidden = b.patch.hidden;
      if (typeof b.patch.featured === 'boolean') update.featured = b.patch.featured;
      if (b.patch.status !== undefined) {
        if (!STATUSES.includes(b.patch.status)) return bad('Invalid status');
        update.status = b.patch.status;
      }
      if (Object.keys(update).length === 0) return bad('Nothing to update');
      const snap = await ref.get();
      if (!snap.exists) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
      await ref.update({ ...update, updatedAt: Timestamp.now() });
      await logAdmin('property.toggle', { id, ...update });
      return NextResponse.json({ ok: true });
    }

    const parsed = parsePropertyInput(b);
    if (!parsed.ok) return bad(parsed.error);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    const createdAt = snap.data()?.createdAt ?? Timestamp.now();
    await ref.set({ ...parsed.doc, createdAt, updatedAt: Timestamp.now() });
    await logAdmin('property.edit', { id, title: parsed.doc.title });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/properties] update error:', err);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!validId(id)) return bad('Invalid id');
  try {
    await adminDb.collection('properties').doc(id).delete();
    await logAdmin('property.delete', { id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/properties] delete error:', err);
    return serverError();
  }
}
