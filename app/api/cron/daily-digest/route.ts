import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isCronRequest } from '@/lib/cron-auth';
import { gatherAttention } from '@/lib/admin-attention';
import { buildDigest, digestRecipient } from '@/lib/daily-digest';
import { sendEmail, emailConfigured } from '@/lib/send-email';
import { siteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

// Once a day (Vercel Cron): e-mails the owner what needs attention. Says nothing when everything is fine.
export async function GET(req: NextRequest) {
  if (!isCronRequest(req)) return NextResponse.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const to = digestRecipient();
  if (!to || !emailConfigured()) return NextResponse.json({ ok: true, sent: false, reason: 'no-recipient' }, { headers: { 'Cache-Control': 'no-store' } });
  try {
    const items = await gatherAttention();
    let errors = 0;
    try {
      const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
      errors = (await adminDb.collection('client_errors').where('lastAt', '>=', since).count().get()).data().count;
    } catch { /* the error list is optional */ }
    const mail = buildDigest(items, errors, `${siteUrl()}/admin`);
    if (!mail) return NextResponse.json({ ok: true, sent: false, reason: 'all-clear' }, { headers: { 'Cache-Control': 'no-store' } });
    await sendEmail({ to, subject: mail.subject, html: mail.html });
    return NextResponse.json({ ok: true, sent: true, items: items.length }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[cron/daily-digest] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
