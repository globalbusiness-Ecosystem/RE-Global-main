import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getHomeFeatures } from '@/lib/home-features-server';
import { parseHomeFeatures } from '@/lib/home-features';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getHomeFeatures()) }, { headers: { 'Cache-Control': 'no-store' } });
}

// { enabled: boolean, title: {en?,ar?..} | null, items: [{icon, t:{en?,ar?..}}] | null }. null brings the built-in text back.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  if (typeof body.enabled !== 'boolean') return NextResponse.json({ ok: false, error: 'enabled must be true or false' }, { status: 400 });
  if (Array.isArray(body.items) && body.items.length > 0 && parseHomeFeatures(body).items === null) {
    return NextResponse.json({ ok: false, error: 'Each item needs a text in English or Arabic (80 characters at most)' }, { status: 400 });
  }
  const next = parseHomeFeatures(body);
  try {
    const before = await getHomeFeatures();
    await adminDb.collection('settings').doc('homeFeatures').set({ ...next, updatedAt: Timestamp.now() });
    await logAdmin('homeFeatures.update', { from: before, to: next });
    return NextResponse.json({ ok: true, ...(await getHomeFeatures()) });
  } catch (err) {
    console.error('[admin/home-features] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
