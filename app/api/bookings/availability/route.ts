import { NextRequest, NextResponse } from 'next/server';
import { busyRanges } from '@/lib/booking-calendar';

export const dynamic = 'force-dynamic';

// Public: which days of a rent / hotel listing are already taken (no personal data).
export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get('propertyId') ?? '';
  try {
    const busy = await busyRanges(propertyId);
    return NextResponse.json({ busy }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ busy: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
