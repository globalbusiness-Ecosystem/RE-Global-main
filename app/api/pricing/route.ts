import 'server-only';
import { NextResponse } from 'next/server';
import { getPiUsdRate } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

// Public: the Pi/USD rate the admin set (null when not set). Used to show USD prices in Pi.
export async function GET() {
  try {
    const piUsdRate = await getPiUsdRate();
    return NextResponse.json({ piUsdRate }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } });
  } catch (err) {
    console.error('[pricing] read error:', err);
    return NextResponse.json({ piUsdRate: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
