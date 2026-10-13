import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTION, isKind } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

// Public, read-only: active banners / partners for the site. Fails soft with an empty
// list so pages fall back to their defaults if the database is unreachable.
export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get('kind');
  if (!isKind(kind)) return NextResponse.json({ items: [] }, { status: 400 });
  try {
    const snap = await adminDb.collection(COLLECTION[kind]).get();
    const items = snap.docs
      .map((d) => {
        const { createdAt, updatedAt, ...rest } = d.data() as Record<string, unknown>;
        void createdAt; void updatedAt;
        return { id: d.id, ...rest } as Record<string, any>;
      })
      .filter((i) => i.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (err) {
    console.error('[content] list error:', err);
    return NextResponse.json({ items: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
