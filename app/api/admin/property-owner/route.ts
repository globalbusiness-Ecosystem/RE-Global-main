import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { ownerLine, parseOwner, parseStoredOwner } from '@/lib/property-owner';

export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'no-store' };
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: HEADERS });
const goodId = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 200 && !v.includes('/');

// ?id=<propertyId> -> the owner record (admin only) and the line the contract will print.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!goodId(id)) return bad('Invalid property');
  try {
    const snap = await adminDb.collection('property_owners').doc(id).get();
    const owner = snap.exists ? parseStoredOwner(snap.data()) : undefined;
    return NextResponse.json({ ok: true, owner: owner ?? null, line: owner ? ownerLine(owner) : null }, { headers: HEADERS });
  } catch (err) {
    console.error('[admin/property-owner] read error:', err);
    return bad('Server error', 500);
  }
}

// { id, owner } replaces the record; an empty name removes it. The activity log keeps the property id only, never the name.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !goodId(body.id)) return bad('Invalid property');
  const parsed = parseOwner(body.owner);
  if (!parsed.ok) return bad(parsed.error);
  try {
    const ref = adminDb.collection('property_owners').doc(body.id);
    if (parsed.owner) await ref.set({ ...parsed.owner, updatedAt: Timestamp.now() });
    else await ref.delete();
    await logAdmin('property.owner', { id: body.id, removed: !parsed.owner });
    return NextResponse.json({ ok: true, line: parsed.owner ? ownerLine(parsed.owner) : null }, { headers: HEADERS });
  } catch (err) {
    console.error('[admin/property-owner] save error:', err);
    return bad('Server error', 500);
  }
}
