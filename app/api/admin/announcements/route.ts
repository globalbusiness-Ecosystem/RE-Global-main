import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getAnnouncements } from '@/lib/announcements-server';
import { parseAnnouncements, MAX_ANNOUNCEMENTS } from '@/lib/announcements';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getAnnouncements()) }, { headers: { 'Cache-Control': 'no-store' } });
}

// { enabled, showStats, title: {en?,ar?} | null, items: [...] }. An empty list removes the board.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  if (typeof body.enabled !== 'boolean' || typeof body.showStats !== 'boolean') return NextResponse.json({ ok: false, error: 'enabled and showStats must be true or false' }, { status: 400 });
  const next = parseAnnouncements(body);
  if (Array.isArray(body.items) && next.items.length < Math.min(body.items.length, MAX_ANNOUNCEMENTS)) {
    return NextResponse.json({ ok: false, error: 'Each item needs a title (70 characters at most); a video item needs a valid https YouTube, Vimeo or video-file link' }, { status: 400 });
  }
  try {
    const before = await getAnnouncements();
    await adminDb.collection('settings').doc('announcements').set({ ...next, updatedAt: Timestamp.now() });
    await logAdmin('announcements.update', { items: [before.items.length, next.items.length], showStats: next.showStats, enabled: next.enabled });
    return NextResponse.json({ ok: true, ...(await getAnnouncements()) });
  } catch (err) {
    console.error('[admin/announcements] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
