import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-session';
import { logAdmin } from '@/lib/admin-audit';
import { isTextLang, isTextPage, sanitizeOverrides } from '@/lib/site-texts';

export const dynamic = 'force-dynamic';

const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const page = req.nextUrl.searchParams.get('page');
  if (!isTextPage(page)) return bad('Invalid page');
  try {
    const snap = await adminDb.collection('site_texts').doc(page).get();
    const d = (snap.exists ? snap.data() : {}) as Record<string, any>;
    return NextResponse.json({ ok: true, texts: { en: d.en ?? {}, ar: d.ar ?? {} } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/texts] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { page, lang, overrides } replaces that language's edits for the page (empty = back to defaults).
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!isTextPage(body?.page)) return bad('Invalid page');
  if (!isTextLang(body?.lang)) return bad('Invalid language');
  const parsed = sanitizeOverrides(body.overrides);
  if (!parsed.ok) return bad(parsed.error);
  try {
    await adminDb.collection('site_texts').doc(body.page).set({ [body.lang]: parsed.overrides, updatedAt: Timestamp.now() }, { mergeFields: [body.lang, 'updatedAt'] });
    await logAdmin('texts.save', { page: body.page, lang: body.lang, count: Object.keys(parsed.overrides).length });
    return NextResponse.json({ ok: true, count: Object.keys(parsed.overrides).length });
  } catch (err) {
    console.error('[admin/texts] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
