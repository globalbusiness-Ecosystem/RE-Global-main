// Admin-editable page texts. The built-in i18n objects stay the defaults; the admin stores
// only the strings it changed, keyed by a dotted path (e.g. "roadmap.0.title"), per language.

export const TEXT_PAGES = ['inspections', 'retoken', 'whitepaper'] as const;
export type TextPage = (typeof TEXT_PAGES)[number];
export const isTextPage = (v: unknown): v is TextPage => typeof v === 'string' && (TEXT_PAGES as readonly string[]).includes(v);

export const TEXT_LANGS = ['en', 'ar'] as const;
export type TextLang = (typeof TEXT_LANGS)[number];
export const isTextLang = (v: unknown): v is TextLang => typeof v === 'string' && (TEXT_LANGS as readonly string[]).includes(v);

export type Overrides = Record<string, string>;

const MAX_ENTRIES = 600;
const MAX_LEN = 3000;
const KEY_RE = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;

// Every editable (string) leaf of a strings object. Function leaves are skipped.
export function flattenTexts(obj: unknown, prefix = '', out: Overrides = {}): Overrides {
  if (typeof obj === 'string') {
    if (prefix) out[prefix] = obj;
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenTexts(v, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) flattenTexts(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

// Returns a copy of `base` with overridden string leaves replaced. Unknown paths and
// non-string leaves are ignored, so a stale override can never break a page.
export function applyOverrides<T>(base: T, overrides: Overrides | null | undefined): T {
  if (!overrides) return base;
  const keys = Object.keys(overrides);
  if (!keys.length) return base;
  const walk = (node: any, path: string): any => {
    if (typeof node === 'string') {
      const o = overrides[path];
      return typeof o === 'string' && o.trim() ? o : node;
    }
    if (Array.isArray(node)) return node.map((v, i) => walk(v, path ? `${path}.${i}` : String(i)));
    if (node && typeof node === 'object') {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(node)) out[k] = walk(v, path ? `${path}.${k}` : k);
      return out;
    }
    return node;
  };
  return walk(base, '') as T;
}

// Validates what the admin sends: keeps only well-formed, non-empty string overrides.
export function sanitizeOverrides(input: unknown): { ok: true; overrides: Overrides } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'Invalid overrides' };
  const out: Overrides = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!KEY_RE.test(k) || k.length > 120) return { ok: false, error: 'Invalid key: ' + k.slice(0, 40) };
    if (typeof v !== 'string') return { ok: false, error: 'Invalid value for ' + k };
    const t = v.trim();
    if (!t) continue;
    if (t.length > MAX_LEN) return { ok: false, error: 'Text too long: ' + k };
    out[k] = t;
  }
  if (Object.keys(out).length > MAX_ENTRIES) return { ok: false, error: 'Too many overrides' };
  return { ok: true, overrides: out };
}
