import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { guardApi } from '@/lib/api-guard';
import { isSafeId } from '@/lib/my-data';
import { detectImage } from '@/lib/image-validate';
import { decodePhoto, validateAvatarPayload } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'no-store' };

// The picture is private: stored by the server only and returned only to its owner.
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'my-avatar-read', limit: 60 });
  if (user instanceof NextResponse) return user;
  if (!isSafeId(user.username)) return NextResponse.json({ error: 'Bad user' }, { status: 400, headers: HEADERS });
  try {
    const snap = await adminDb.collection('avatars').doc(user.username).get();
    const d = snap.exists ? (snap.data() as Record<string, unknown>) : null;
    if (d && typeof d.preset === 'string') return NextResponse.json({ avatar: { preset: d.preset } }, { headers: HEADERS });
    if (d && typeof d.photo === 'string') return NextResponse.json({ avatar: { photo: d.photo } }, { headers: HEADERS });
    return NextResponse.json({ avatar: null }, { headers: HEADERS });
  } catch (err) {
    console.error('[my-avatar] read error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}

export async function PUT(req: NextRequest) {
  const user = await guardApi(req, { scope: 'my-avatar-write', limit: 15 });
  if (user instanceof NextResponse) return user;
  if (!isSafeId(user.username)) return NextResponse.json({ error: 'Bad user' }, { status: 400, headers: HEADERS });
  const len = Number(req.headers.get('content-length') || 0);
  if (len > 80_000) return NextResponse.json({ error: 'Too large' }, { status: 413, headers: HEADERS });
  let body: unknown = null;
  try { body = await req.json(); } catch { /* handled below */ }
  const value = validateAvatarPayload(body);
  if (!value) return NextResponse.json({ error: 'Invalid picture' }, { status: 400, headers: HEADERS });
  let doc: Record<string, unknown>;
  if (value.kind === 'preset') {
    doc = { preset: value.id };
  } else {
    // The declared type is attacker-controlled: check the real file signature (jpeg or webp only).
    const bytes = decodePhoto(value.dataUrl);
    const real = bytes ? detectImage(bytes) : null;
    if (!real || (real.mime !== 'image/jpeg' && real.mime !== 'image/webp')) {
      return NextResponse.json({ error: 'Invalid picture' }, { status: 400, headers: HEADERS });
    }
    doc = { photo: `data:${real.mime};base64,${Buffer.from(bytes!).toString('base64')}` };
  }
  try {
    await adminDb.collection('avatars').doc(user.username).set({ ...doc, uid: user.uid, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, avatar: doc }, { headers: HEADERS });
  } catch (err) {
    console.error('[my-avatar] write error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await guardApi(req, { scope: 'my-avatar-write', limit: 15 });
  if (user instanceof NextResponse) return user;
  if (!isSafeId(user.username)) return NextResponse.json({ error: 'Bad user' }, { status: 400, headers: HEADERS });
  try {
    await adminDb.collection('avatars').doc(user.username).delete();
    return NextResponse.json({ ok: true }, { headers: HEADERS });
  } catch (err) {
    console.error('[my-avatar] delete error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
