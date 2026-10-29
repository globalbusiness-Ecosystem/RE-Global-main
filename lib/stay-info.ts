import type { NavLanguage } from './nav-i18n';

// Optional hotel / rental facts the admin can set: check-in and check-out time, and the guest limit.
export type StayInfo = { checkInTime?: string; checkOutTime?: string; maxGuests?: number; minNights?: number; maxNights?: number };

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const MAX_GUESTS_LIMIT = 50;
export const NIGHTS_LIMIT = 60;

// '' (left empty) is fine; anything else must be a real HH:MM or a whole number 1..50.
export function parseStayInfo(b: unknown): { ok: true; info: StayInfo } | { ok: false; error: string } {
  const r = (b && typeof b === 'object' ? b : {}) as Record<string, unknown>;
  const info: StayInfo = {};
  for (const k of ['checkInTime', 'checkOutTime'] as const) {
    const v = r[k];
    if (v === undefined || v === null || v === '') continue;
    if (typeof v !== 'string' || !TIME_RE.test(v)) return { ok: false, error: 'Invalid check-in/check-out time (use HH:MM)' };
    info[k] = v;
  }
  const g = r.maxGuests;
  if (g !== undefined && g !== null && g !== '') {
    const n = typeof g === 'number' ? g : Number(g);
    if (!Number.isInteger(n) || n < 1 || n > MAX_GUESTS_LIMIT) return { ok: false, error: `Guests must be a whole number from 1 to ${MAX_GUESTS_LIMIT}` };
    info.maxGuests = n;
  }
  const nights: Partial<Record<'minNights' | 'maxNights', number>> = {};
  for (const k of ['minNights', 'maxNights'] as const) {
    const v = r[k];
    if (v === undefined || v === null || v === '') continue;
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isInteger(n) || n < 1 || n > NIGHTS_LIMIT) return { ok: false, error: `Nights must be a whole number from 1 to ${NIGHTS_LIMIT}` };
    nights[k] = n;
  }
  if (nights.minNights !== undefined && nights.maxNights !== undefined && nights.minNights > nights.maxNights) return { ok: false, error: 'Minimum nights cannot be higher than maximum nights' };
  Object.assign(info, nights);
  return { ok: true, info };
}

export interface StayStrings { checkIn: string; checkOut: string; guests: string; minStay: string; maxStay: string }
// {n} is replaced by the guest limit.
export const STAY_I18N: Record<NavLanguage, StayStrings> = {
  en: { checkIn: 'Check-in from', checkOut: 'Check-out until', guests: 'Up to {n} guests', minStay: 'Minimum stay: {n} nights', maxStay: 'Maximum stay: {n} nights' },
  ar: { checkIn: 'الدخول من', checkOut: 'الخروج لغاية', guests: 'لحد {n} ضيوف', minStay: 'أقل مدة إقامة: {n} ليالي', maxStay: 'أقصى مدة إقامة: {n} ليالي' },
  fr: { checkIn: 'Arrivée dès', checkOut: 'Départ avant', guests: "Jusqu'à {n} personnes", minStay: 'Séjour minimum : {n} nuits', maxStay: 'Séjour maximum : {n} nuits' },
  es: { checkIn: 'Entrada desde', checkOut: 'Salida hasta', guests: 'Hasta {n} huéspedes', minStay: 'Estancia mínima: {n} noches', maxStay: 'Estancia máxima: {n} noches' },
  pt: { checkIn: 'Check-in a partir de', checkOut: 'Check-out até', guests: 'Até {n} hóspedes', minStay: 'Estadia mínima: {n} noites', maxStay: 'Estadia máxima: {n} noites' },
  ur: { checkIn: 'آمد از', checkOut: 'روانگی تک', guests: 'زیادہ سے زیادہ {n} مہمان', minStay: 'کم از کم قیام: {n} راتیں', maxStay: 'زیادہ سے زیادہ قیام: {n} راتیں' },
  zh: { checkIn: '入住时间', checkOut: '退房时间', guests: '最多 {n} 位客人', minStay: '最少入住 {n} 晚', maxStay: '最多入住 {n} 晚' },
};

// 'HH:MM' shown as the visitor's clock style (12h or 24h), always with 0-9 digits.
export function formatClock(hhmm: string, lang: string): string {
  if (!TIME_RE.test(hhmm)) return hhmm;
  const [h, m] = hhmm.split(':').map(Number);
  try {
    return new Intl.DateTimeFormat(`${lang}-u-nu-latn`, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(Date.UTC(2000, 0, 1, h, m));
  } catch {
    return hhmm;
  }
}

// The lines to show on the listing page, in order. Empty when the admin set nothing.
export function stayFacts(info: StayInfo | null | undefined, lang: string): { icon: string; text: string }[] {
  const s = STAY_I18N[lang as NavLanguage] ?? STAY_I18N.en;
  const out: { icon: string; text: string }[] = [];
  if (info?.checkInTime && TIME_RE.test(info.checkInTime)) out.push({ icon: '🕑', text: `${s.checkIn} ${formatClock(info.checkInTime, lang)}` });
  if (info?.checkOutTime && TIME_RE.test(info.checkOutTime)) out.push({ icon: '🕚', text: `${s.checkOut} ${formatClock(info.checkOutTime, lang)}` });
  const g = Number(info?.maxGuests);
  if (Number.isInteger(g) && g >= 1) out.push({ icon: '👥', text: s.guests.replace('{n}', String(g)) });
  const lo = Number(info?.minNights);
  const hi = Number(info?.maxNights);
  if (Number.isInteger(lo) && lo >= 2 && lo <= NIGHTS_LIMIT) out.push({ icon: '🌙', text: s.minStay.replace('{n}', String(lo)) });
  if (Number.isInteger(hi) && hi >= 1 && hi < NIGHTS_LIMIT) out.push({ icon: '🌙', text: s.maxStay.replace('{n}', String(hi)) });
  return out;
}
