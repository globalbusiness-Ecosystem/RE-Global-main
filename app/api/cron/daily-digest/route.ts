import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isCronRequest } from '@/lib/cron-auth';
import { gatherAttention } from '@/lib/admin-attention';
import { buildDigest, digestRecipient } from '@/lib/daily-digest';
import { sendEmail, emailConfigured } from '@/lib/send-email';
import { siteUrl } from '@/lib/site-url';
import { sendGuestReminders } from '@/lib/guest-reminders-server';
import { syncCardContracts } from '@/lib/chain-sync';
import { activityReport } from '@/lib/admin-report-store';
import { buildAdminReportHtml } from '@/lib/admin-report';

export const dynamic = 'force-dynamic';

// Once a day (Vercel Cron): e-mails the owner what needs attention. Says nothing when everything is fine.
export async function GET(req: NextRequest) {
  if (!isCronRequest(req)) return NextResponse.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  // Guest reminders ride on this daily job (Vercel's free plan allows only two cron jobs). They never block the owner summary.
  if (emailConfigured()) {
    try {
      const r = await sendGuestReminders();
      if (r.sent || r.failed) console.log(`[cron/guest-reminders] sent ${r.sent}, failed ${r.failed}, skipped ${r.skipped}`);
    } catch (err) {
      console.error('[cron/guest-reminders] error:', err);
    }
  }
  // Card contracts that are not on the blockchain yet are retried here too (same reason: only two cron jobs). Never blocks the summary.
  try {
    const r = await syncCardContracts(10);
    if (r.anchored || r.recorded || r.failed || r.created) console.log(`[cron/chain-sync] created ${r.created}, anchored ${r.anchored}, recorded ${r.recorded}, failed ${r.failed} ${r.errors.join(',')}`);
  } catch (err) {
    console.error('[cron/chain-sync] error:', err);
  }
  const to = digestRecipient();
  if (!to || !emailConfigured()) return NextResponse.json({ ok: true, sent: false, reason: 'no-recipient' }, { headers: { 'Cache-Control': 'no-store' } });
  // Each staff admin's activity of the last day goes to the owner (nothing is sent when no staff account did anything). Never blocks the summary.
  try {
    const rep = buildAdminReportHtml((await activityReport(24)).filter((s) => s.actor !== 'owner'), 24, `${siteUrl()}/admin`);
    if (rep) await sendEmail({ to, subject: rep.subject, html: rep.html });
  } catch (err) {
    console.error('[cron/admin-report] error:', err);
  }
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
