import 'server-only';
import { NextResponse } from 'next/server';
import { getBranding } from '@/lib/branding-server';

export const dynamic = 'force-dynamic';

// Public: every visitor needs the logo. Cached for a minute so it costs almost nothing.
export async function GET() {
  return NextResponse.json(await getBranding(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
