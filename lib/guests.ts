import type { NavLanguage } from './nav-i18n';
import { MAX_GUESTS_LIMIT } from './stay-info';

// How many guests a booking is for. Absent means 1. The listing's limit (maxGuests) applies when the admin set one.
export function parseGuests(raw: unknown, maxGuests?: unknown): { ok: true; guests: number } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === '') return { ok: true, guests: 1 };
  const n = typeof raw === 'number' ? raw : Number(raw);
  const limit = Number.isInteger(Number(maxGuests)) && Number(maxGuests) >= 1 ? Number(maxGuests) : MAX_GUESTS_LIMIT;
  if (!Number.isInteger(n) || n < 1) return { ok: false, error: 'Choose a valid number of guests' };
  if (n > limit) return { ok: false, error: `This stay allows up to ${limit} guest${limit === 1 ? '' : 's'}` };
  return { ok: true, guests: n };
}

export interface GuestStrings { label: string; count: string }
// {n} is replaced by the number of guests.
export const GUEST_I18N: Record<NavLanguage, GuestStrings> = {
  en: { label: 'Guests', count: '{n} guests' },
  ar: { label: 'عدد الضيوف', count: '{n} ضيوف' },
  fr: { label: 'Voyageurs', count: '{n} voyageurs' },
  es: { label: 'Huéspedes', count: '{n} huéspedes' },
  pt: { label: 'Hóspedes', count: '{n} hóspedes' },
  ur: { label: 'مہمان', count: '{n} مہمان' },
  zh: { label: '客人数', count: '{n} 位客人' },
};
export const guestStrings = (lang: string): GuestStrings => GUEST_I18N[lang as NavLanguage] ?? GUEST_I18N.en;
export const guestsText = (lang: string, n: number) => guestStrings(lang).count.replace('{n}', String(n));
