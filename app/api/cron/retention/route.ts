import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isCronRequest } from '@/lib/cron-auth';
import { runRetention } from '@/lib/retention-server';
import { getRetention, runKycRetention } from '@/lib/kyc-retention-store';

export const dynamic = 'force-dynamic';

// Once a day (Vercel Cron): deletes technical records that are past their retention period.
export async function GET(req: NextRequest) {
  if (!isCronRequest(req)) return NextResponse.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  try {
    const results = await runRetention();
    // Identity data is deleted here only when the team turned automatic deletion on (and never for a person under legal hold).
    let kyc: { due: number; purged: number } | null = null;
    try { if ((await getRetention()).autoDelete) kyc = await runKycRetention('cron'); } catch (e) { console.error('[cron/retention] kyc error:', e); }
    return NextResponse.json({ ok: true, results, kyc }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[cron/retention] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
