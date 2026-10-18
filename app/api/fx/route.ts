import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getFxRates } from '@/lib/fx-server';

export const dynamic = 'force-dynamic';

// Public: today's rates for the currencies the site can show prices in.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('fx', req, 60, 10 * 60 * 1000);
  if (limited) return limited;
  const fx = await getFxRates();
  if (!fx) return NextResponse.json({ rates: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json(fx, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
