// Is the guest e-mail reminder system ready to send? Takes only yes/no answers, never the secret values themselves.
export interface NotifyEnv { mailConfigured: boolean; adminEmailValid: boolean; cronSecretOk: boolean }
export interface ReadinessItem { id: 'mail' | 'cron' | 'adminEmail'; ok: boolean; label: string; fix: string }

export function notifyReadiness(env: NotifyEnv): { items: ReadinessItem[]; ready: boolean } {
  const items: ReadinessItem[] = [
    { id: 'mail', ok: env.mailConfigured, label: 'خدمة الإيميل', fix: 'ضيف في Vercel: GMAIL_USER و GMAIL_APP_PASSWORD (أو RESEND_API_KEY) ثم Redeploy.' },
    { id: 'cron', ok: env.cronSecretOk, label: 'تشغيل التذكير اليومي (CRON_SECRET)', fix: 'ضيف CRON_SECRET في Vercel: نص عشوائي 16 حرف أو أكتر، ثم Redeploy.' },
    { id: 'adminEmail', ok: env.adminEmailValid, label: 'إيميل تنبيهات الأدمن (ADMIN_ALERT_EMAIL)', fix: 'ضيف ADMIN_ALERT_EMAIL في Vercel بإيميل صحيح، ثم Redeploy. بيستخدم للإيميل التجريبي وتنبيهات الأدمن.' },
  ];
  // The guests' reminders need the mail service and the daily job; the admin address is only for the test and alerts.
  return { items, ready: env.mailConfigured && env.cronSecretOk };
}
