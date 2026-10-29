import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getRewardRules } from '@/lib/rewards-server';
import { parseRules } from '@/lib/rewards';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, rules: await getRewardRules() }, { headers: { 'Cache-Control': 'no-store' } });
}

// { points: {stay, purchase, review}, tiers: {silver, gold, platinum}, benefits: {bronze, silver, gold, platinum} }
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const rules = parseRules(body);
  if (!rules) return NextResponse.json({ ok: false, error: 'Invalid rules' }, { status: 400 });
  try {
    const before = await getRewardRules();
    await adminDb.collection('settings').doc('rewards').set({ ...rules, updatedAt: Timestamp.now() });
    const line = (r: typeof rules) => `${r.points.stay}/${r.points.purchase}/${r.points.review} · ${r.tiers.silver}/${r.tiers.gold}/${r.tiers.platinum}`;
    await logAdmin('rewards.rules', { from: line(before), to: line(rules) });
    return NextResponse.json({ ok: true, rules });
  } catch (err) {
    console.error('[admin/rewards] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
