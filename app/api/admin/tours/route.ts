import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getToursEnabled, listTours } from '@/lib/tours-server';
import { getShowDemo } from '@/lib/demo-listings-server';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// The admin's view of the tours entry: the switch, the sample-tour state, and which listings have a 360 link (those are the tours).
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const [enabled, demo, list] = await Promise.all([getToursEnabled(), getShowDemo(), listTours()]);
  return NextResponse.json({ ok: true, enabled, demo, items: list.items.map((i) => ({ id: i.id, title: i.titleAr || i.title, location: i.locationAr || i.location })) }, { headers: H });
}

// { enabled: boolean } switches the whole tours entry on or off for visitors.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => null);
  if (typeof b?.enabled !== 'boolean') return NextResponse.json({ ok: false, error: 'enabled must be true or false' }, { status: 400, headers: H });
  try {
    const before = await getToursEnabled();
    await adminDb.collection('settings').doc('tours').set({ enabled: b.enabled, updatedAt: Timestamp.now() }, { mergeFields: ['enabled', 'updatedAt'] });
    await logAdmin('display.tours', { from: before, to: b.enabled });
    return NextResponse.json({ ok: true, enabled: b.enabled }, { headers: H });
  } catch (err) {
    console.error('[admin/tours] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H });
  }
}
