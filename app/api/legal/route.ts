import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getLegalProfile } from '@/lib/legal-server';

export const dynamic = 'force-dynamic';

// Public: the buyer-facing legal notice for a property's country.
export async function GET(req: NextRequest) {
  const p = await getLegalProfile(req.nextUrl.searchParams.get('country'));
  return NextResponse.json(
    { noticeEn: p.noticeEn, noticeAr: p.noticeAr },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
