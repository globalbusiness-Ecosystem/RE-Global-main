import 'server-only';
import { sendEmail, emailConfigured } from '@/lib/send-email';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';

// Security alerts by email to the owner (ADMIN_ALERT_EMAIL): a new admin login, "log out everywhere",
// attempts while the login is locked. Best effort: it never blocks or breaks the action it reports on,
// and it is throttled (5 per kind per 10 minutes) so an attack cannot flood the inbox.

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function buildAlertHtml(title: string, details: Record<string, string>): string {
  const rows = Object.entries(details)
    .map(([k, v]) => `<tr><td style="padding:4px 12px;color:#666">${escapeHtml(k)}</td><td style="padding:4px 12px"><b>${escapeHtml(String(v))}</b></td></tr>`)
    .join('');
  return `<div dir="rtl" style="font-family:Arial,sans-serif"><h3>${escapeHtml(title)}</h3><table>${rows}</table>`
    + '<p>لو ده مش أنت: ادخل لوحة التحكم واضغط "اخرج من كل الجلسات"، وغيّر ADMIN_PIN في Vercel فوراً.</p></div>';
}

/** Where and when a request came from, for the alert text. */
export function adminAlertContext(req: Request): Record<string, string> {
  return {
    'الوقت (القاهرة)': new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }),
    IP: clientIp(req),
    'المتصفح': (req.headers.get('user-agent') || 'unknown').slice(0, 120),
  };
}

export async function alertAdmin(kind: string, title: string, details: Record<string, string>): Promise<boolean> {
  const to = process.env.ADMIN_ALERT_EMAIL?.trim();
  if (!to || !EMAIL_RE.test(to) || !emailConfigured()) return false;
  try {
    const run = (async () => {
      const rl = await consumeRateLimit(`admin-alert:${kind}`, 5, 10 * 60 * 1000);
      if (!rl.ok) return false;
      await sendEmail({ to, subject: `[RE Global] ${title}`, html: buildAlertHtml(title, details) });
      return true;
    })();
    // Never keep the admin waiting more than a few seconds for the mail server.
    return await Promise.race([run, new Promise<boolean>((r) => setTimeout(() => r(false), 4000))]);
  } catch (err) {
    console.error('[admin-alert] failed:', err);
    return false;
  }
}

/** A payment landed in manual review (refund needed). Called once, when the record is first created. */
export function alertReview(label: string, details: Record<string, string>): Promise<boolean> {
  return alertAdmin('review', 'عملية محتاجة مراجعة يدوية: ' + label, details);
}
