import 'server-only';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { emailConfigured, sendEmail } from '@/lib/send-email';
import { siteUrl } from '@/lib/site-url';
import { validEmail } from '@/lib/guest-reminders';
import { isMailLang } from '@/lib/kyc-mail';
import { consumeRateLimit } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/admin-alert';
import { buildPartnerMail, type PartnerMailKind } from '@/lib/partners-mail';
import { PARTNER_ROLES } from '@/lib/partners';

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const within = <T>(p: Promise<T>, fallback: T, ms = 4000) => Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

/**
 * Tells a partner about the team's decision (or a paid commission) by e-mail. Best effort: only to a verified e-mail of a
 * web sign-in (Pi accounts have none), never throws, and a failure never changes the decision. Returns whether a mail was sent.
 */
export async function notifyPartner(username: string, kind: PartnerMailKind, extra: { note?: string; amount?: string } = {}): Promise<boolean> {
  try {
    if (!emailConfigured()) return false;
    const snap = await adminDb.collection('partners').doc(username).get();
    const p = snap.data();
    const uid = typeof p?.uid === 'string' ? p.uid : '';
    if (!uid.startsWith('web_')) return false;
    const run = (async () => {
      const user = await adminAuth.getUser(uid.slice(4));
      if (!user.emailVerified || !validEmail(user.email)) return false;
      const mail = buildPartnerMail(kind, extra, isMailLang(p?.lang) ? p!.lang : 'en', siteUrl());
      await sendEmail({ to: user.email, subject: mail.subject, html: mail.html });
      return true;
    })();
    return await within(run, false);
  } catch (err) {
    console.error('[partners-notify] failed:', err instanceof Error ? err.message : 'unknown');
    return false;
  }
}

/** Tells the owner (ADMIN_ALERT_EMAIL) that a new application is waiting. Throttled, best effort, never throws. */
export async function notifyAdminNewApplication(username: string, a: { role: string; company: string; country: string }): Promise<boolean> {
  try {
    const to = process.env.ADMIN_ALERT_EMAIL?.trim();
    if (!to || !EMAIL_RE.test(to) || !emailConfigured()) return false;
    const role = (PARTNER_ROLES as readonly string[]).includes(a.role) ? a.role : 'partner';
    const run = (async () => {
      const rl = await consumeRateLimit('partner-application-alert', 20, 10 * 60 * 1000);
      if (!rl.ok) return false;
      await sendEmail({
        to, subject: `[RE Global] طلب شريك جديد: ${a.company.slice(0, 60)}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif"><h3>طلب شريك جديد</h3><p><b>${escapeHtml(a.company)}</b> (${escapeHtml(role)}، ${escapeHtml(a.country)}) من @${escapeHtml(username)}.</p><p>راجعه من لوحة التحكم ← المدفوعات ← الشركاء.</p></div>`,
      });
      return true;
    })();
    return await within(run, false);
  } catch (err) {
    console.error('[partners-notify] admin alert failed:', err instanceof Error ? err.message : 'unknown');
    return false;
  }
}
