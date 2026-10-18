import { escapeHtml } from '@/lib/admin-alert';
import type { AttentionItem } from '@/lib/attention-rules';

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** Where the daily summary goes: the same address as the security alerts, only if it looks valid. */
export function digestRecipient(): string | null {
  const to = process.env.ADMIN_ALERT_EMAIL?.trim();
  return to && EMAIL_RE.test(to) ? to : null;
}

/** The morning summary. Returns null when there is nothing to say (no e-mail is better than an empty one). */
export function buildDigest(items: AttentionItem[], errors24h: number, adminUrl: string): { subject: string; html: string } | null {
  if (items.length === 0 && errors24h <= 0) return null;
  const bad = items.filter((i) => i.level === 'bad').length;
  const rows = items
    .map((i) => `<li style="margin:6px 0">${i.level === 'bad' ? '🔴' : '🟡'} ${escapeHtml(i.text)}</li>`)
    .join('');
  const errs = errors24h > 0 ? `<p>🐞 ${errors24h} نوع خطأ ظهر عند المستخدمين في آخر 24 ساعة (التفاصيل في لوحة التحكم).</p>` : '';
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif"><h3>ملخص RE Global اليومي</h3>`
    + (items.length ? `<ul style="padding-right:18px">${rows}</ul>` : '')
    + errs
    + `<p><a href="${escapeHtml(adminUrl)}">افتح لوحة التحكم</a></p></div>`;
  const subject = `[RE Global] ملخص يومي: ${bad > 0 ? `${bad} مستعجل` : `${items.length} محتاج انتباهك`}`;
  return { subject, html };
}
