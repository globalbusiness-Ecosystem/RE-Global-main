// The name a person chooses to be shown as ("Elsayed Al-shaib"). Two people can never have the same name: the check
// ignores capitals, spaces, dots, dashes and underscores, Arabic marks and letter variants (أ إ آ = ا, ى = ي, ة = ه),
// so "Ahmed Ali", "ahmed.ali" and "AhmedAli" count as one name.

export const NAME_MIN = 2;
export const NAME_MAX = 40;
export const NAME_COOLDOWN_DAYS = 7;
export const NAME_COOLDOWN_MS = NAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/** The comparison form of a name: the same for every spelling that looks the same. */
export function nameKey(name: string): string {
  return name
    .normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[\s._'’-]+/g, '');
}

const fold = (s: string) => nameKey(s);
// Names that could be mistaken for the platform or its team (start of the name) and exact titles.
const RESERVED_START = ['admin', 'reglobal', 'support', 'official', 'moderator', 'system', 'staff', 'founder', 'globalbusiness', 'الادمن', 'الادارة', 'الدعم', 'المؤسس', 'الرسمي'].map(fold);
const RESERVED_EXACT = ['owner', 'ceo', 'team', 'root', 'null', 'undefined', 'مؤسس', 'الرئيس', 'المدير', 'فريق', 'ادمن'].map(fold);

export type ParsedName = { name: string; key: string };

/** A cleaned name and its comparison key, or null when the name is not allowed. */
export function parseDisplayName(raw: unknown): ParsedName | null {
  if (typeof raw !== 'string') return null;
  const name = raw.replace(/[\u0000-\u001f\u007f​-‏‪-‮]+/g, '').replace(/\s+/g, ' ').trim();
  if (name.length < NAME_MIN || name.length > NAME_MAX) return null;
  if (!/^[\p{L}][\p{L}\p{M}\p{N} ._'’-]*$/u.test(name)) return null;
  if (/^web_/i.test(name) || /(https?|www)/i.test(name) || /\.[a-z]{2,}/i.test(name)) return null;
  const key = nameKey(name);
  if (key.length < NAME_MIN) return null;
  if (RESERVED_EXACT.includes(key) || RESERVED_START.some((p) => key.startsWith(p))) return null;
  return { name, key };
}

/** Milliseconds left before this person may change the name again (0 when they may). */
export const cooldownLeftMs = (changedAtMs: number | null, now = Date.now()): number =>
  changedAtMs && Number.isFinite(changedAtMs) ? Math.max(0, changedAtMs + NAME_COOLDOWN_MS - now) : 0;
