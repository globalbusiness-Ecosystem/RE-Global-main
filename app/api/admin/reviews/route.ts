import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { adminReviews, adminSetReviewHidden, adminSetReviewReply } from '@/lib/stay-reviews-server';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ ok: true, reviews: await adminReviews() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/reviews] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id, hidden } hides or shows a review on the public page.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const hidden = body?.hidden === true;
  try {
    if (body && 'reply' in body) {
      const rr = await adminSetReviewReply(body.id, body.reply);
      if (!rr.ok) return NextResponse.json({ ok: false, error: rr.error }, { status: rr.status });
      await logAdmin(rr.cleared ? 'review.reply.clear' : 'review.reply', { id: body.id, title: rr.title });
      return NextResponse.json({ ok: true });
    }
    const r = await adminSetReviewHidden(body?.id, hidden);
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
    await logAdmin(hidden ? 'review.hide' : 'review.show', { id: body.id, title: r.title });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/reviews] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
