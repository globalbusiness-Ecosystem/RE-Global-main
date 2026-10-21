import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getCancellationPolicy } from '@/lib/booking-cancel';
import { parsePolicy } from '@/lib/cancellation';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, policy: await getCancellationPolicy() }, { headers: { 'Cache-Control': 'no-store' } });
}

// { freeDays, partialDays, partialPct } sets the cancellation policy of hotel and rental bookings.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const p = parsePolicy(body);
  if (!p) return NextResponse.json({ ok: false, error: 'Invalid policy' }, { status: 400 });
  try {
    const before = await getCancellationPolicy();
    await adminDb.collection('settings').doc('cancellation').set({ ...p, updatedAt: Timestamp.now() });
    await logAdmin('booking.policy', { from: `${before.freeDays}/${before.partialDays}/${before.partialPct}`, to: `${p.freeDays}/${p.partialDays}/${p.partialPct}` });
    return NextResponse.json({ ok: true, policy: p });
  } catch (err) {
    console.error('[admin/cancellation] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
