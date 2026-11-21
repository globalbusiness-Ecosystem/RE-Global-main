// Screening a legal name against the team's watchlist (sanctioned or blocked people). Pure and tolerant of spelling:
// Arabic and Latin names are normalised (case, accents, Arabic letter variants, punctuation) and compared as sets of words,
// so "Mohamed Ali Hassan" matches "hassan, ali mohamed". A hit never blocks anyone by itself: it sends the request to a person.
// This is the team's own list. It does not replace the official sanctions lists (UN, OFAC, EU) that an identity company checks.

const MARKS = /[ً-ٰٟـ]/g; // Arabic vowel marks and tatweel

export function normalizeName(v: string): string {
  return String(v ?? '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(MARKS, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}

const tokens = (v: string): string[] => normalizeName(v).split(' ').filter(Boolean);

/** The watchlist names the person's name matches: every word of the entry appears in the name. Entries of fewer than 2 words are ignored (too broad). */
export function screenName(legalName: string, list: readonly string[]): string[] {
  const have = new Set(tokens(legalName));
  if (have.size === 0) return [];
  return list.filter((entry) => {
    const t = tokens(entry);
    return t.length >= 2 && t.every((w) => have.has(w));
  });
}

/** Cleans what the team types: trims, drops empties and duplicates, caps size. */
export function cleanWatchlist(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out = new Set<string>();
  for (const v of raw) {
    const s = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, 100) : '';
    if (s) out.add(s);
    if (out.size >= 2000) break;
  }
  return [...out];
}
