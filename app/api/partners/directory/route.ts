import 'server-only';
import { NextResponse } from 'next/server';
import { partnerDirectory } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';

// Public: approved partners who chose to be listed (company, kind, country, a short text). Cached for a few minutes.
export async function GET() {
  try {
    return NextResponse.json({ partners: await partnerDirectory() }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
  } catch {
    return NextResponse.json({ partners: [] });
  }
}
