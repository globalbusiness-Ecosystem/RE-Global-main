import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { alertAdmin } from '@/lib/admin-alert';
import { reportReview } from '@/lib/stay-reviews-server';

export const dynamic = 'force-dynamic';
const json = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Public: { propertyId, rid } flags a review for the admin. Limited per IP; the first flag on a review alerts the admin.
export async function POST(req: NextRequest) {
  const limited = await ipLimited('review-report', req, 8, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  try {
    const r = await reportReview(body?.propertyId, body?.rid);
    if (!r.ok) return json({ ok: false, error: r.error }, r.status);
    if (r.first) await alertAdmin('review-report', 'بلاغ جديد على تقييم ضيف', { 'العقار': r.title || String(body.propertyId) });
    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[reviews/report] error:', err);
    return json({ ok: false, error: 'Server error' }, 500);
  }
}
