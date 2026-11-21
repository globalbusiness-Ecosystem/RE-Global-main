import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getWatchlist, setWatchlist } from '@/lib/kyc-watchlist';
import { cleanWatchlist } from '@/lib/kyc-screening';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// The team's own watchlist of blocked or sanctioned names. A match sends a request to manual review.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, names: await getWatchlist() }, { headers: H });
}

// { names: string[] } replaces the whole list.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!Array.isArray(b?.names)) return NextResponse.json({ ok: false, error: 'Invalid' }, { status: 400, headers: H });
  const names = cleanWatchlist(b.names);
  try {
    await setWatchlist(names);
    await logAdmin('kyc.watchlist', { count: names.length });
    return NextResponse.json({ ok: true, count: names.length }, { headers: H });
  } catch (err) {
    console.error('[admin/kyc-watchlist] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H });
  }
}
