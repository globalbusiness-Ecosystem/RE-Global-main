import { parseLogoUrl } from '@/lib/branding';

// What the admin controls on the "About us" page besides its texts: a cover picture and the contact links.
export type AboutSettings = { coverUrl: string | null; email: string | null; website: string | null; whatsapp: string | null };
export const DEFAULT_ABOUT: AboutSettings = { coverUrl: null, email: null, website: null, whatsapp: null };

const EMAIL = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,255}\.[A-Za-z]{2,}$/;

export const parseEmail = (v: unknown): string | null => (typeof v === 'string' && v.trim().length <= 120 && EMAIL.test(v.trim()) ? v.trim() : null);
/** Digits only (country code first, no +), 7-15 long; anything else is not a phone number. */
export const parseWhatsapp = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const d = v.replace(/[\s\-()+]/g, '');
  return /^\d{7,15}$/.test(d) ? d : null;
};

export function parseAbout(data: unknown): AboutSettings {
  const d = (data ?? {}) as Record<string, unknown>;
  return { coverUrl: parseLogoUrl(d.coverUrl), email: parseEmail(d.email), website: parseLogoUrl(d.website), whatsapp: parseWhatsapp(d.whatsapp) };
}
