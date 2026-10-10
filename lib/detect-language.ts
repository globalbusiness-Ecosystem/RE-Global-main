import { LANGUAGE_OPTIONS, type NavLanguage } from '@/lib/nav-i18n';

const SUPPORTED = LANGUAGE_OPTIONS.map((l) => l.code);

export function isNavLanguage(v: unknown): v is NavLanguage {
  return typeof v === 'string' && (SUPPORTED as string[]).includes(v);
}

// A saved choice always wins (and is validated: localStorage can hold anything).
// Otherwise use the first browser language we support; fall back to English.
export function pickLanguage(stored: unknown, browserLanguages: readonly string[] = []): NavLanguage {
  if (isNavLanguage(stored)) return stored;
  for (const tag of browserLanguages) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (isNavLanguage(base)) return base;
  }
  return 'en';
}
