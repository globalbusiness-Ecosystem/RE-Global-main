import type { NavLanguage } from '@/lib/nav-i18n';

// One place that decides how numbers, prices and dates look for each language.
// Digits are always 0-9 (also in Arabic and Urdu): prices and contract amounts must read the same everywhere.
const BASE: Record<NavLanguage, string> = {
  en: 'en-US', ar: 'ar-EG', fr: 'fr-FR', es: 'es-ES', pt: 'pt-PT', ur: 'ur-PK', zh: 'zh-CN',
};

export function localeFor(lang?: string): string {
  const base = BASE[(lang ?? 'en') as NavLanguage] ?? BASE.en;
  return `${base}-u-nu-latn`;
}

const DASH = '—';
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// "1,234.5" in English, "1 234,5" in French, "1.234,5" in Spanish. Groups from 1,000 in every language.
export function formatNumber(v: unknown, lang?: string, maxFraction = 2): string {
  const n = toNum(v);
  if (n === null) return DASH;
  return new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: maxFraction, useGrouping: 'always' as unknown as boolean }).format(n);
}

// 1.2K / 3.4M style, for tight spaces.
export function formatCompact(v: unknown, lang?: string): string {
  const n = toNum(v);
  if (n === null) return DASH;
  return new Intl.NumberFormat(localeFor(lang), { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

// Pi, dollars and OUSD keep their usual marks; any other code is shown after the number.
export function formatMoney(amount: unknown, currency: unknown, lang?: string): string {
  const v = formatNumber(amount, lang);
  const c = typeof currency === 'string' ? currency.trim().toUpperCase() : 'PI';
  if (c === 'PI' || c === '' || c === 'π') return `${v} π`;
  if (c === 'USD' || c === 'USDC' || c === 'USDT') return `$${v}`;
  return `${v} ${c}`;
}

function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null;
  const d = v instanceof Date ? v : new Date(v as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

// "18 Oct 2026" / "18 أكتوبر 2026" / "2026年10月18日"
export function formatDate(v: unknown, lang?: string, timeZone?: string): string {
  const d = toDate(v);
  if (!d) return '';
  return d.toLocaleDateString(localeFor(lang), { year: 'numeric', month: 'short', day: 'numeric', ...(timeZone ? { timeZone } : {}) });
}

export function formatDateTime(v: unknown, lang?: string, timeZone?: string): string {
  const d = toDate(v);
  if (!d) return '';
  return d.toLocaleString(localeFor(lang), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', ...(timeZone ? { timeZone } : {}) });
}
