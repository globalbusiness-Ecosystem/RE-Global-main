// E-mail reminders for guests: "check-in tomorrow" and "how was your stay?". Pure rules and texts, no Firebase.
// A reminder is for one exact day (a stay that starts tomorrow, a stay that ended yesterday), so the daily job sends
// each one once, without having to remember what it already sent.
export type ReminderKind = 'checkin' | 'review';

const DAY_MS = 86_400_000;
export const MAX_REMINDERS_PER_RUN = 200;

// 'today' is 'YYYY-MM-DD' (UTC). Returns null for anything else.
export function reminderDays(today: string): { tomorrow: string; yesterday: string } | null {
  const t = /^\d{4}-\d{2}-\d{2}$/.test(today) ? Date.parse(`${today}T00:00:00Z`) : NaN;
  if (!Number.isFinite(t)) return null;
  const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  return { tomorrow: day(t + DAY_MS), yesterday: day(t - DAY_MS) };
}

// Notifications are on unless the guest switched them off in Settings (an unset preference means on).
export const wantsEmail = (prefs: { notificationsEnabled?: unknown } | null | undefined): boolean => prefs?.notificationsEnabled !== false;

export const validEmail = (v: unknown): v is string => typeof v === 'string' && v.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(v);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// One short mail in Arabic and English (the guest's language is not stored). `appUrl` is our own site address.
export function buildReminderMail(kind: ReminderKind, b: { title: string; start: string; end: string }, appUrl: string): { subject: string; html: string } {
  const title = esc(b.title || '—');
  const dates = `${esc(b.start)} → ${esc(b.end)}`;
  const ar = kind === 'checkin'
    ? { h: 'تسجيل الوصول بكرة', p: `إقامتك في <b>${title}</b> بتبدأ بكرة (${dates}). نتمنالك إقامة سعيدة.` }
    : { h: 'إقامتك كانت إزاي؟', p: `خلصت إقامتك في <b>${title}</b>. قيّمها من "حجوزاتي" واكسب نقاط مكافآت.` };
  const en = kind === 'checkin'
    ? { h: 'Check-in tomorrow', p: `Your stay at <b>${title}</b> starts tomorrow (${dates}). Have a great stay.` }
    : { h: 'How was your stay?', p: `Your stay at <b>${title}</b> has ended. Rate it from My bookings and earn reward points.` };
  const link = `<p><a href="${esc(appUrl)}">${esc(appUrl)}</a></p>`;
  const foot = '<p style="color:#888;font-size:12px">يمكنك إيقاف الإشعارات من الإعدادات ← الإشعارات · You can turn notifications off in Settings → Notifications.</p>';
  return {
    subject: `${ar.h} · ${en.h}`,
    html: `<div dir="rtl" style="font-family:sans-serif"><h2>${ar.h}</h2><p>${ar.p}</p></div><div dir="ltr" style="font-family:sans-serif"><h2>${en.h}</h2><p>${en.p}</p></div>${link}${foot}`,
  };
}
