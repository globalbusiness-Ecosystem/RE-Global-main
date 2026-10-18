import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';
import { normalizeReport } from '@/lib/listing-report';
import { getPublicListing } from '@/lib/public-listings-server';
import { createListingReport } from '@/lib/listing-report-store';
import { alertAdmin } from '@/lib/admin-alert';

export const dynamic = 'force-dynamic';
const json = (body: object, status: number, extra: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });

// Anyone (no sign-in needed) can report a listing. Small bodies, limited per IP and overall, the listing must exist.
export async function POST(req: NextRequest) {
  try {
    const ip = await consumeRateLimit(`lrep:${clientIp(req)}`, 5, 60 * 60 * 1000);
    if (!ip.ok) return json({ ok: false, error: 'Too many requests' }, 429, { 'Retry-After': String(ip.retryAfter) });
    const all = await consumeRateLimit('lrep:all', 200, 60 * 60 * 1000);
    if (!all.ok) return json({ ok: false, error: 'Too many requests' }, 429, { 'Retry-After': String(all.retryAfter) });
    const text = await req.text();
    if (text.length > 4000) return json({ ok: false, error: 'Invalid report' }, 400);
    const rep = normalizeReport(JSON.parse(text));
    if (!rep) return json({ ok: false, error: 'Invalid report' }, 400);
    if (!(await getPublicListing(rep.listingId))) return json({ ok: false, error: 'Invalid report' }, 400);
    await createListingReport(rep);
    await alertAdmin('listing-report', 'بلاغ جديد على عقار', { 'العقار': rep.listingId, 'السبب': rep.reason, 'التفاصيل': rep.details || '-' });
    return json({ ok: true }, 200);
  } catch (err) {
    if (err instanceof SyntaxError) return json({ ok: false, error: 'Invalid report' }, 400);
    console.error('[listing-report] error:', err);
    return json({ ok: false, error: 'Server error' }, 500);
  }
}
