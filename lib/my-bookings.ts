import type { NavLanguage } from './nav-i18n';
import { parseDay, DAY_MS } from './booking-rules';

export type BookingPhase = 'upcoming' | 'current' | 'past';

// Where a stay is relative to today ('YYYY-MM-DD'). The check-out day itself already counts as past.
export function bookingPhase(start: string, end: string, today: string): BookingPhase {
  if (end <= today) return 'past';
  if (start <= today) return 'current';
  return 'upcoming';
}

// Whole days from today to the check-in day (0 = today). null when a date is not valid.
export function daysUntil(start: string, today: string): number | null {
  const s = parseDay(start);
  const t = parseDay(today);
  if (s === null || t === null) return null;
  return Math.round((s - t) / DAY_MS);
}

export interface MyBookingStrings {
  title: string; confirmed: string; review: string; cancelled: string;
  upcoming: string; current: string; past: string; today: string; tomorrow: string; inDays: string; addToCalendar: string;
}
// {n} is replaced by the number of days.
export const MY_BOOKING_I18N: Record<NavLanguage, MyBookingStrings> = {
  en: { title: 'My bookings', confirmed: 'Confirmed', review: 'Under review', cancelled: 'Cancelled, refund queued', upcoming: 'Upcoming', current: 'Staying now', past: 'Completed', today: 'Check-in today', tomorrow: 'Check-in tomorrow', inDays: 'Check-in in {n} days', addToCalendar: 'Add to calendar' },
  ar: { title: 'حجوزاتي', confirmed: 'مؤكد', review: 'قيد المراجعة', cancelled: 'ملغي واتسجل استرداد', upcoming: 'قادم', current: 'إقامتك دلوقتي', past: 'انتهى', today: 'الدخول النهارده', tomorrow: 'الدخول بكره', inDays: 'الدخول بعد {n} يوم', addToCalendar: 'ضيفه للتقويم' },
  fr: { title: 'Mes réservations', confirmed: 'Confirmée', review: 'En cours de vérification', cancelled: 'Annulée, remboursement en cours', upcoming: 'À venir', current: 'Séjour en cours', past: 'Terminée', today: 'Arrivée aujourd’hui', tomorrow: 'Arrivée demain', inDays: 'Arrivée dans {n} jours', addToCalendar: 'Ajouter au calendrier' },
  es: { title: 'Mis reservas', confirmed: 'Confirmada', review: 'En revisión', cancelled: 'Cancelada, reembolso en curso', upcoming: 'Próxima', current: 'Estancia en curso', past: 'Finalizada', today: 'Entrada hoy', tomorrow: 'Entrada mañana', inDays: 'Entrada en {n} días', addToCalendar: 'Añadir al calendario' },
  pt: { title: 'Minhas reservas', confirmed: 'Confirmada', review: 'Em análise', cancelled: 'Cancelada, reembolso em andamento', upcoming: 'Próxima', current: 'Estadia em curso', past: 'Concluída', today: 'Check-in hoje', tomorrow: 'Check-in amanhã', inDays: 'Check-in em {n} dias', addToCalendar: 'Adicionar ao calendário' },
  ur: { title: 'میری بکنگز', confirmed: 'تصدیق شدہ', review: 'زیرِ جائزہ', cancelled: 'منسوخ، رقم کی واپسی درج', upcoming: 'آنے والی', current: 'آپ کا قیام جاری ہے', past: 'مکمل', today: 'آج آمد', tomorrow: 'کل آمد', inDays: '{n} دن میں آمد', addToCalendar: 'کیلنڈر میں شامل کریں' },
  zh: { title: '我的预订', confirmed: '已确认', review: '审核中', cancelled: '已取消，退款已登记', upcoming: '即将入住', current: '入住中', past: '已完成', today: '今天入住', tomorrow: '明天入住', inDays: '{n} 天后入住', addToCalendar: '添加到日历' },
};
export const myBookingStrings = (lang: string): MyBookingStrings => MY_BOOKING_I18N[lang as NavLanguage] ?? MY_BOOKING_I18N.en;

// "Check-in in 5 days" for an upcoming stay; '' otherwise.
export function countdownText(lang: string, days: number | null): string {
  const t = myBookingStrings(lang);
  if (days === null || days < 0) return '';
  if (days === 0) return t.today;
  if (days === 1) return t.tomorrow;
  return t.inDays.replace('{n}', String(days));
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// Lines longer than 75 characters continue on the next line, starting with a space.
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 75) { out.push(rest.slice(0, 75)); rest = ' ' + rest.slice(75); }
  out.push(rest);
  return out.join('\r\n');
}

// An all-day calendar event (.ics) for one stay. The end date is the check-out day (exclusive).
export function buildIcs(b: { id: string; propertyTitle: string; start: string; end: string; nights?: number }, nowIso: string): string | null {
  if (parseDay(b.start) === null || parseDay(b.end) === null) return null;
  const stamp = nowIso.replace(/[-:]/g, '').replace(/\.\d+/, '').slice(0, 15) + 'Z';
  const compact = (d: string) => d.replace(/-/g, '');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RE Global//Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.id.replace(/[^A-Za-z0-9_-]/g, '')}@re-global`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(b.start)}`,
    `DTEND;VALUE=DATE:${compact(b.end)}`,
    `SUMMARY:${esc(b.propertyTitle || 'Booking')}`,
    ...(b.nights ? [`DESCRIPTION:${esc(`${b.nights} night${b.nights === 1 ? '' : 's'} - RE Global`)}`] : []),
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
