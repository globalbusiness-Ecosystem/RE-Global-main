import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/send-email';
import { siteUrl } from '@/lib/site-url';
import { MAX_REMINDERS_PER_RUN, buildReminderMail, reminderDays, validEmail, wantsEmail, type ReminderKind } from '@/lib/guest-reminders';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;

// Runs once a day. Mails guests whose stay starts tomorrow, and guests whose stay ended yesterday and who have not
// reviewed it. Only to a verified e-mail, only when notifications are not switched off. Each reminder is claimed in
// `reminder_log` first (create fails when it exists), so a retried run never mails the same reminder twice.
export async function sendGuestReminders(nowMs = Date.now()): Promise<{ sent: number; skipped: number; failed: number }> {
  const days = reminderDays(new Date(nowMs).toISOString().slice(0, 10));
  const out = { sent: 0, skipped: 0, failed: 0 };
  if (!days) return out;
  const col = adminDb.collection('bookings');
  const [soon, over] = await Promise.all([col.where('start', '==', days.tomorrow).limit(500).get(), col.where('end', '==', days.yesterday).limit(500).get()]);
  const jobs = [
    ...soon.docs.map((d) => ({ d, kind: 'checkin' as ReminderKind })),
    ...over.docs.map((d) => ({ d, kind: 'review' as ReminderKind })),
  ].slice(0, MAX_REMINDERS_PER_RUN);

  for (const { d, kind } of jobs) {
    const b = d.data() as Record<string, unknown>;
    const username = b.username;
    if (b.status !== 'confirmed' || !okId(username)) { out.skipped++; continue; }
    if (kind === 'review' && (await adminDb.collection('stay_reviews').doc(d.id).get()).exists) { out.skipped++; continue; }
    const [profile, prefs] = await Promise.all([adminDb.collection('profiles').doc(username).get(), adminDb.collection('preferences').doc(username).get()]);
    const p = profile.exists ? (profile.data() as Record<string, unknown>) : null;
    const to = p?.emailVerified === true ? p.verifiedEmail : null;
    if (!validEmail(to) || !wantsEmail(prefs.exists ? (prefs.data() as Record<string, unknown>) : null)) { out.skipped++; continue; }
    try {
      await adminDb.collection('reminder_log').doc(`${d.id}_${kind}`).create({ at: new Date(nowMs).toISOString() });
    } catch (err) {
      if ((err as { code?: number | string }).code === 6 || (err as { code?: number | string }).code === 'already-exists') { out.skipped++; continue; }
      throw err;
    }
    try {
      const mail = buildReminderMail(kind, { title: String(b.propertyTitle ?? ''), start: String(b.start ?? ''), end: String(b.end ?? '') }, siteUrl());
      await sendEmail({ to, subject: mail.subject, html: mail.html });
      out.sent++;
    } catch (err) {
      out.failed++;
      console.error('[guest-reminders] send failed:', err instanceof Error ? err.message : 'unknown');
    }
  }
  return out;
}
