import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getCelebration } from '@/lib/celebration-server';
import { parseCelebration } from '@/lib/celebration';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getCelebration()) }, { headers: { 'Cache-Control': 'no-store' } });
}

// The whole settings object. A music or voice link that is not an https audio file is refused (not silently dropped).
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  const next = parseCelebration(body);
  const asked = [body.user?.musicUrl, body.founder?.musicUrl, body.founder?.voiceUrl];
  const kept = [next.user.musicUrl, next.founder.musicUrl, next.founder.voiceUrl];
  if (asked.some((a, i) => typeof a === 'string' && a.trim() !== '' && !kept[i])) {
    return NextResponse.json({ ok: false, error: 'رابط الصوت لازم يكون https وينتهي بـ mp3 أو m4a أو ogg أو wav' }, { status: 400 });
  }
  try {
    await adminDb.collection('settings').doc('celebration').set({ ...next, updatedAt: Timestamp.now() });
    await logAdmin('celebration.update', { enabled: next.enabled, user: next.user.enabled, founder: next.founder.enabled, voice: next.founder.voice });
    return NextResponse.json({ ok: true, ...next });
  } catch (err) {
    console.error('[admin/celebration] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
