import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-session';
import { logAdmin } from '@/lib/admin-audit';
import { getResaleFeePct } from '@/lib/market-settings';
import { MAX_FEE_PCT, parseFeePct } from '@/lib/market-rules';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, resaleFeePct: await getResaleFeePct(), max: MAX_FEE_PCT }, { headers: { 'Cache-Control': 'no-store' } });
}

// { resaleFeePct } sets the platform fee on share resales. Listings already on sale keep the fee they were created with.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const pct = parseFeePct(body?.resaleFeePct);
  if (pct === null) return NextResponse.json({ ok: false, error: `Fee must be between 0 and ${MAX_FEE_PCT}` }, { status: 400 });
  try {
    const before = await getResaleFeePct();
    await adminDb.collection('settings').doc('market').set({ resaleFeePct: pct, updatedAt: Timestamp.now() }, { mergeFields: ['resaleFeePct', 'updatedAt'] });
    await logAdmin('market.fee', { from: before, to: pct });
    return NextResponse.json({ ok: true, resaleFeePct: pct });
  } catch (err) {
    console.error('[admin/market-settings] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
