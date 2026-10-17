import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ipLimited } from '@/lib/rate-guard';
import { isTextPage } from '@/lib/site-texts';

export const dynamic = 'force-dynamic';

// Public, read-only: the admin's text edits for one page. Fails soft with {} so pages
// keep their built-in texts if the database is unreachable.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('texts', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  const page = req.nextUrl.searchParams.get('page');
  if (!isTextPage(page)) return NextResponse.json({ texts: {} }, { status: 400 });
  try {
    const snap = await adminDb.collection('site_texts').doc(page).get();
    const d = (snap.exists ? snap.data() : {}) as Record<string, unknown>;
    const texts: Record<string, unknown> = {};
    for (const lang of ['en', 'ar']) if (d[lang] && typeof d[lang] === 'object') texts[lang] = d[lang];
    return NextResponse.json({ texts }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (err) {
    console.error('[texts] read error:', err);
    return NextResponse.json({ texts: {} }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
