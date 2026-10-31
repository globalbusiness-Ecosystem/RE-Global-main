import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { emailConfigured, sendEmail } from '@/lib/send-email';
import { ipLimited } from '@/lib/rate-guard';
import { notifyReadiness } from '@/lib/notify-readiness';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const adminTo = () => {
  const v = process.env.ADMIN_ALERT_EMAIL?.trim() ?? '';
  return EMAIL_RE.test(v) ? v : '';
};
const cronSecretOk = () => (process.env.CRON_SECRET?.trim().length ?? 0) >= 16;

// Readiness: yes/no per setting. Never returns a value.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const r = notifyReadiness({ mailConfigured: emailConfigured(), adminEmailValid: Boolean(adminTo()), cronSecretOk: cronSecretOk() });
  return NextResponse.json({ ok: true, ...r }, { headers: { 'Cache-Control': 'no-store' } });
}

// Sends one test e-mail to ADMIN_ALERT_EMAIL only (a fixed address, so this cannot be used to mail anyone else).
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const limited = await ipLimited('notify-test', req, 5, 10 * 60 * 1000);
  if (limited) return limited;
  const to = adminTo();
  if (!emailConfigured()) return NextResponse.json({ ok: false, error: 'mail-not-configured' }, { status: 400 });
  if (!to) return NextResponse.json({ ok: false, error: 'admin-email-missing' }, { status: 400 });
  try {
    await sendEmail({
      to,
      subject: '[RE Global] إيميل تجريبي ✅',
      html: '<p dir="rtl">لو وصلك الإيميل ده، يبقى إعدادات الإيميل شغالة وتذكيرات الضيوف هتتبعت.</p>',
    });
  } catch (err) {
    console.error('[admin/notify-test] send failed:', err); // the reason stays in the server log
    return NextResponse.json({ ok: false, error: 'send-failed' }, { status: 502 });
  }
  await logAdmin('notify.test', {});
  return NextResponse.json({ ok: true });
}
