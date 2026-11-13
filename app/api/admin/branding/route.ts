import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getBranding } from '@/lib/branding-server';
import { parseLogoUrl } from '@/lib/branding';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getBranding()) }, { headers: { 'Cache-Control': 'no-store' } });
}

// { logoUrl?: https url | null, animated?: boolean }. null (or an empty value) brings the built-in logo back.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const update: Record<string, unknown> = {};
  if (body && 'logoUrl' in body) {
    if (body.logoUrl === null || body.logoUrl === '') update.logoUrl = null;
    else {
      const url = parseLogoUrl(body.logoUrl);
      if (!url) return NextResponse.json({ ok: false, error: 'logoUrl must be an https image address' }, { status: 400 });
      update.logoUrl = url;
    }
  }
  if (body && 'animated' in body) {
    if (typeof body.animated !== 'boolean') return NextResponse.json({ ok: false, error: 'animated must be true or false' }, { status: 400 });
    update.animated = body.animated;
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ ok: false, error: 'Nothing to save' }, { status: 400 });
  try {
    const before = await getBranding();
    await adminDb.collection('settings').doc('branding').set({ ...update, updatedAt: Timestamp.now() }, { merge: true });
    await logAdmin('branding.update', { from: before, to: update });
    return NextResponse.json({ ok: true, ...(await getBranding()) });
  } catch (err) {
    console.error('[admin/branding] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
