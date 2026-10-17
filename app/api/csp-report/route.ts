import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';
import { normalizeCspReport } from '@/lib/csp-report';
import { recordCsp } from '@/lib/csp-store';

export const dynamic = 'force-dynamic';

const quiet = () => new NextResponse(null, { status: 204 });

// Browsers post CSP violation reports here (report-only mode: nothing is blocked, we just learn what the site loads).
// Always answers 204 so the endpoint reveals nothing; small bodies only; limited per IP and overall.
export async function POST(req: NextRequest) {
  try {
    const ip = await consumeRateLimit(`csp:${clientIp(req)}`, 60, 10 * 60 * 1000);
    if (!ip.ok) return quiet();
    const all = await consumeRateLimit('csp:all', 600, 60 * 60 * 1000);
    if (!all.ok) return quiet();
    const text = await req.text();
    if (text.length > 8000) return quiet();
    const rec = normalizeCspReport(JSON.parse(text));
    if (rec) await recordCsp(rec);
  } catch {
    // a malformed report is not worth an error
  }
  return quiet();
}
