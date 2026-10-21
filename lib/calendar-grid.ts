import type { NavLanguage } from './nav-i18n';
import { DAY_MS, parseDay, type BookingDates } from './booking-rules';

export const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// First day of the week by language: Saturday for Arabic and Urdu, Monday for French, Spanish and Portuguese, Sunday otherwise.
export const weekStartFor = (lang: string): number => (lang === 'ar' || lang === 'ur' ? 6 : lang === 'fr' || lang === 'es' || lang === 'pt' ? 1 : 0);

// The weeks of a month as rows of 7 cells: 'YYYY-MM-DD', or null for the empty cells before the 1st and after the last day.
export function monthGrid(year: number, month: number, weekStart: number): (string | null)[][] {
  const first = Date.UTC(year, month, 1);
  const lead = (new Date(first).getUTCDay() - weekStart + 7) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(isoDay(Date.UTC(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// Every night that is already taken. A stay from the 5th to the 8th takes nights 5, 6 and 7: the 8th (check-out day) stays free.
export function busyNights(busy: BookingDates[]): Set<string> {
  const out = new Set<string>();
  for (const b of busy) {
    const s = parseDay(b.start);
    const e = parseDay(b.end);
    if (s === null || e === null || e <= s) continue;
    for (let t = s, n = 0; t < e && n < 800; t += DAY_MS, n++) out.add(isoDay(t));
  }
  return out;
}

export type Selection = { start: string; end: string };

// A tap on a day. First tap = check-in; second tap later in the same free stretch = check-out; any other tap starts over.
export function applyPick(sel: Selection, day: string, taken: Set<string>, today: string): Selection {
  if (day < today) return sel;
  if (!sel.start || sel.end || day <= sel.start) return taken.has(day) ? sel : { start: day, end: '' };
  const s = parseDay(sel.start);
  const e = parseDay(day);
  if (s === null || e === null) return sel;
  for (let t = s; t < e; t += DAY_MS) if (taken.has(isoDay(t))) return taken.has(day) ? sel : { start: day, end: '' };
  return { start: sel.start, end: day };
}

export const inRange = (day: string, sel: Selection) => !!sel.start && !!sel.end && day >= sel.start && day <= sel.end;

export function monthLabel(year: number, month: number, lang: string): string {
  try {
    return new Intl.DateTimeFormat(`${lang}-u-nu-latn`, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(year, month, 1));
  } catch {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }
}

// Short weekday names in the order of the grid columns.
export function weekdayLabels(lang: string, weekStart: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dow = (weekStart + i) % 7;
    const ms = Date.UTC(2023, 0, 1 + dow); // 2023-01-01 was a Sunday
    try { out.push(new Intl.DateTimeFormat(`${lang}-u-nu-latn`, { weekday: 'short', timeZone: 'UTC' }).format(ms)); } catch { out.push(String(dow)); }
  }
  return out;
}

export interface CalendarStrings { prev: string; next: string; booked: string }
export const CALENDAR_I18N: Record<NavLanguage, CalendarStrings> = {
  en: { prev: 'Previous month', next: 'Next month', booked: 'Booked' },
  ar: { prev: 'الشهر اللي فات', next: 'الشهر الجاي', booked: 'محجوز' },
  fr: { prev: 'Mois précédent', next: 'Mois suivant', booked: 'Réservé' },
  es: { prev: 'Mes anterior', next: 'Mes siguiente', booked: 'Reservado' },
  pt: { prev: 'Mês anterior', next: 'Próximo mês', booked: 'Reservado' },
  ur: { prev: 'پچھلا مہینہ', next: 'اگلا مہینہ', booked: 'بک ہے' },
  zh: { prev: '上个月', next: '下个月', booked: '已预订' },
};
export const calendarStrings = (lang: string): CalendarStrings => CALENDAR_I18N[lang as NavLanguage] ?? CALENDAR_I18N.en;
