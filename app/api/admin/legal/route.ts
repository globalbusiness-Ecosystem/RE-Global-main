import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { defaultProfile, isCountry, mergeProfile, sanitizeLegalOverride, type LegalOverride } from '@/lib/legal-profiles';

export const dynamic = 'force-dynamic';

const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// ?country=XX -> { defaults, current } for the editor.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const code = req.nextUrl.searchParams.get('country');
  if (!isCountry(code)) return bad('Invalid country');
  try {
    const snap = await adminDb.collection('legal_profiles').doc(code).get();
    const override = (snap.exists ? snap.data() : null) as LegalOverride | null;
    return NextResponse.json({ ok: true, defaults: defaultProfile(code), current: mergeProfile(code, override) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/legal] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { country, override } replaces that country's edits (an empty object = back to defaults).
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!isCountry(body?.country)) return bad('Invalid country');
  const parsed = sanitizeLegalOverride(body.override);
  if (!parsed.ok) return bad(parsed.error);
  try {
    await adminDb.collection('legal_profiles').doc(body.country).set({ ...parsed.override, updatedAt: Timestamp.now() });
    await logAdmin('legal.save', { country: body.country, fields: Object.keys(parsed.override) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/legal] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
