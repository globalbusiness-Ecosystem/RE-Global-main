import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getBadgeThresholds } from '@/lib/badge-server';
import { parseThresholds } from '@/lib/badge-level';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, thresholds: await getBadgeThresholds() }, { headers: { 'Cache-Control': 'no-store' } });
}

// { thresholds: [0, a, b, c, d, e, f] }: the points where levels 1 to 7 start.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const thresholds = parseThresholds(body?.thresholds);
  if (!thresholds) return NextResponse.json({ ok: false, error: 'Seven whole numbers, the first 0, each higher than the one before' }, { status: 400 });
  try {
    const before = await getBadgeThresholds();
    await adminDb.collection('settings').doc('badges').set({ thresholds, updatedAt: Timestamp.now() });
    await logAdmin('badges.thresholds', { from: before.join('/'), to: thresholds.join('/') });
    return NextResponse.json({ ok: true, thresholds });
  } catch (err) {
    console.error('[admin/badges] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
