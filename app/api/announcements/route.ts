import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { getAnnouncements } from '@/lib/announcements-server';

export const dynamic = 'force-dynamic';

// Public: the home page board. Only what visitors may see (inactive items stay private). Cached for a minute.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('announcements', req, 120, 10 * 60 * 1000);
  if (limited) return limited;
  const a = await getAnnouncements();
  return NextResponse.json({ ...a, items: a.items.filter((x) => x.active) }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
