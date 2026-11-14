import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getProgramRules } from '@/lib/partners-server';
import { parseProgramRules, RATE_MAX } from '@/lib/partners';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, rules: await getProgramRules(), max: RATE_MAX }, { headers: { 'Cache-Control': 'no-store' } });
}

// { enabled: boolean, rates: { broker, developer, investor, sales } } as percentages of a purchase (0 to 20).
// A new percentage applies to commission lines created from then on; lines already written keep theirs.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const rules = parseProgramRules(await req.json().catch(() => null));
  if (!rules) return NextResponse.json({ ok: false, error: 'Invalid rules' }, { status: 400 });
  try {
    const before = await getProgramRules();
    await adminDb.collection('settings').doc('partnerProgram').set({ ...rules, updatedAt: Timestamp.now() });
    await logAdmin('partners.program', { from: before, to: rules });
    return NextResponse.json({ ok: true, rules });
  } catch (err) {
    console.error('[admin/partner-program] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
