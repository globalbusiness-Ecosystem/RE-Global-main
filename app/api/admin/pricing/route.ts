import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getPiUsdRate } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ ok: true, piUsdRate: await getPiUsdRate() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/pricing] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { piUsdRate } sets how many US dollars one Pi is worth (must be a sane positive number).
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const rate = Number(body?.piUsdRate);
  if (!Number.isFinite(rate) || rate < 0.0001 || rate > 1_000_000) {
    return NextResponse.json({ ok: false, error: 'Invalid rate' }, { status: 400 });
  }
  try {
    const before = await getPiUsdRate().catch(() => null);
    await adminDb.collection('settings').doc('pricing').set({ piUsdRate: rate, updatedAt: Timestamp.now() }, { mergeFields: ['piUsdRate', 'updatedAt'] });
    await logAdmin('pricing.rate', { from: before, to: rate });
    return NextResponse.json({ ok: true, piUsdRate: rate });
  } catch (err) {
    console.error('[admin/pricing] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
