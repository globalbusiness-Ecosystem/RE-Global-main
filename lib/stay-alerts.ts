import type { SmartAlert } from './smart-alerts';

// Alerts about the guest's own stays, worked out from their bookings (no extra storage, nothing is sent anywhere).
// Dates are 'YYYY-MM-DD', compared as UTC days.
export interface StayBooking { id: string; propertyTitle: string; start: string; end: string; status: string; reviewed?: boolean; hostReply?: string }

export const CHECKIN_SOON_DAYS = 3;
export const REVIEW_WINDOW_DAYS = 14;
export const REPLY_WINDOW_DAYS = 60;

const DAY_MS = 86_400_000;
const dayNum = (d: string): number | null => {
  const t = /^\d{4}-\d{2}-\d{2}$/.test(d) ? Date.parse(`${d}T00:00:00Z`) : NaN;
  return Number.isFinite(t) ? Math.round(t / DAY_MS) : null;
};

export function stayAlerts(bookings: StayBooking[], today: string): SmartAlert[] {
  const now = dayNum(today);
  if (now === null) return [];
  const out: SmartAlert[] = [];
  for (const b of bookings) {
    const start = dayNum(b.start);
    const end = dayNum(b.end);
    if (start === null || end === null) continue;
    const title = b.propertyTitle || '—';
    const at = new Date(Math.max(start, end) * DAY_MS);
    const base = { type: 'stay' as const, createdAt: at };
    if (b.status === 'review') {
      out.push({ ...base, id: `stay-review-${b.id}`, titleEn: 'Booking under review', titleAr: 'حجزك تحت المراجعة', descriptionEn: `${title}: we are checking your payment and will confirm soon.`, descriptionAr: `${title}: بنراجع الدفع وهنأكد الحجز قريب.`, i18n: { title: 'stayReviewT', description: 'stayReviewD', vars: { title } } });
      continue;
    }
    if (b.status !== 'confirmed') continue;
    const until = start - now;
    if (until >= 0 && until <= CHECKIN_SOON_DAYS) {
      const when = until === 0 ? { en: 'today', ar: 'النهارده' } : until === 1 ? { en: 'tomorrow', ar: 'بكرة' } : { en: `in ${until} days`, ar: `بعد ${until} أيام` };
      out.push({ ...base, id: `stay-soon-${b.id}`, titleEn: `Check-in ${when.en}`, titleAr: `تسجيل الوصول ${when.ar}`, descriptionEn: `${title}: ${b.start} → ${b.end}`, descriptionAr: `${title}: ${b.start} ← ${b.end}`, i18n: { title: until === 0 ? 'checkinToday' : until === 1 ? 'checkinTomorrow' : 'checkinDays', description: 'stayDatesD', vars: { title, n: until, start: b.start, end: b.end } } });
    }
    const since = now - end;
    if (since >= 0 && since <= REVIEW_WINDOW_DAYS && !b.reviewed) {
      out.push({ ...base, id: `stay-rate-${b.id}`, titleEn: 'How was your stay?', titleAr: 'إقامتك كانت إزاي؟', descriptionEn: `${title}: rate your stay from My bookings and earn reward points.`, descriptionAr: `${title}: قيّم إقامتك من "حجوزاتي" واكسب نقاط مكافآت.`, i18n: { title: 'rateT', description: 'rateD', vars: { title } } });
    }
    if (b.reviewed && b.hostReply?.trim() && since >= 0 && since <= REPLY_WINDOW_DAYS) {
      out.push({ ...base, id: `stay-reply-${b.id}`, titleEn: 'The host replied to your review', titleAr: 'الإدارة ردّت على تقييمك', descriptionEn: `${title}: see the reply under your stay in My bookings.`, descriptionAr: `${title}: شوف الرد تحت إقامتك في "حجوزاتي".`, i18n: { title: 'replyT', description: 'replyD', vars: { title } } });
    }
  }
  // Most recent first.
  return out.sort((a, c) => c.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(c.id));
}
