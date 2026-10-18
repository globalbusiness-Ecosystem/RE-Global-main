import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isCronRequest } from '@/lib/cron-auth';
import { runRetention } from '@/lib/retention-server';

export const dynamic = 'force-dynamic';

// Once a day (Vercel Cron): deletes technical records that are past their retention period.
export async function GET(req: NextRequest) {
  if (!isCronRequest(req)) return NextResponse.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  try {
    const results = await runRetention();
    return NextResponse.json({ ok: true, results }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[cron/retention] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
