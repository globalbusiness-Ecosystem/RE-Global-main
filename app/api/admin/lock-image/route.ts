import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getLockImage } from '@/lib/lock-image-server';
import { parseLogoUrl } from '@/lib/branding';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getLockImage()) }, { headers: { 'Cache-Control': 'no-store' } });
}

// { imageUrl: https image address | null }. null (or empty) brings the built-in fingerprint icon back.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || !('imageUrl' in body)) return NextResponse.json({ ok: false, error: 'Nothing to save' }, { status: 400 });
  let imageUrl: string | null = null;
  if (body.imageUrl !== null && body.imageUrl !== '') {
    imageUrl = parseLogoUrl(body.imageUrl);
    if (!imageUrl) return NextResponse.json({ ok: false, error: 'imageUrl must be an https image address' }, { status: 400 });
  }
  try {
    const before = await getLockImage();
    await adminDb.collection('settings').doc('lockImage').set({ imageUrl, updatedAt: Timestamp.now() }, { merge: true });
    await logAdmin('lockimage.update', { from: before.imageUrl ? 'custom' : 'default', to: imageUrl ? 'custom' : 'default' });
    return NextResponse.json({ ok: true, ...(await getLockImage()) });
  } catch (err) {
    console.error('[admin/lock-image] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
