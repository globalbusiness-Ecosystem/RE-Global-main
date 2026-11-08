import 'server-only';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { emailConfigured, sendEmail } from '@/lib/send-email';
import { siteUrl } from '@/lib/site-url';
import { validEmail } from '@/lib/guest-reminders';
import { buildKycMail, isMailLang } from '@/lib/kyc-mail';

/**
 * Tells the person the team's decision by e-mail. Best effort: only to a verified e-mail of the sign-in, never
 * throws, and a failure never changes the decision. Returns whether a mail was sent.
 */
export async function notifyKycDecision(uid: string, decision: 'approved' | 'rejected', reason: string): Promise<boolean> {
  try {
    if (!uid.startsWith('web_') || !emailConfigured()) return false;
    const [user, doc] = await Promise.all([adminAuth.getUser(uid.slice(4)), adminDb.collection('kyc').doc(uid).get()]);
    if (!user.emailVerified || !validEmail(user.email)) return false;
    const lang = doc.data()?.lang;
    const mail = buildKycMail(decision, reason, isMailLang(lang) ? lang : 'en', siteUrl());
    await sendEmail({ to: user.email, subject: mail.subject, html: mail.html });
    return true;
  } catch (err) {
    console.error('[kyc-notify] failed:', err instanceof Error ? err.message : 'unknown');
    return false;
  }
}
