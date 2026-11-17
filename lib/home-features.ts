import type { NavLanguage } from './nav-i18n';
import { parseLogoUrl } from './branding';

// The "Why choose RE?" strip on the home page, editable by the admin.
export const FEATURE_LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];
export const FEATURE_ICON_KEYS = ['glasses', 'zap', 'building', 'globe', 'bot', 'scroll', 'shield', 'video', 'chart', 'trending', 'languages', 'star', 'coins', 'lock', 'gem', 'sparkles'] as const;
export type FeatureIconKey = (typeof FEATURE_ICON_KEYS)[number];
export type FeatureText = Partial<Record<NavLanguage, string>>;
export type HomeFeatureItem = { icon: FeatureIconKey; t: FeatureText };
// A picture card: a photo the admin uploaded with a title and a short line written over it.
export type HomeFeatureCard = { img: string; t: FeatureText; d: FeatureText | null };
export type HomeFeatures = { enabled: boolean; title: FeatureText | null; items: HomeFeatureItem[] | null; cards: HomeFeatureCard[] | null };

export const DEFAULT_HOME_FEATURES: HomeFeatures = { enabled: true, title: null, items: null, cards: null };
export const MAX_FEATURE_ITEMS = 12;
export const MAX_FEATURE_CARDS = 8;
export const MAX_CARD_TITLE = 60;
export const MAX_CARD_TEXT = 140;
const MAX_TEXT = 80;

function parseText(v: unknown, max = MAX_TEXT): FeatureText | null {
  if (!v || typeof v !== 'object') return null;
  const out: FeatureText = {};
  for (const l of FEATURE_LANGS) {
    const x = (v as Record<string, unknown>)[l];
    if (typeof x === 'string') {
      const s = x.trim();
      if (s && s.length <= max) out[l] = s;
    }
  }
  return out.en || out.ar ? out : null;
}

// Anything unexpected falls back to the built-in strip, so a bad document can never break the home page.
export function parseHomeFeatures(data: unknown): HomeFeatures {
  const d = (data ?? {}) as Record<string, unknown>;
  const items = Array.isArray(d.items)
    ? d.items.slice(0, MAX_FEATURE_ITEMS).flatMap((x): HomeFeatureItem[] => {
        const r = (x ?? {}) as Record<string, unknown>;
        const t = parseText(r.t);
        const icon = (FEATURE_ICON_KEYS as readonly string[]).includes(r.icon as string) ? (r.icon as FeatureIconKey) : 'star';
        return t ? [{ icon, t }] : [];
      })
    : null;
  // A card needs its picture (https only) and a title; the line over the picture is optional.
  const cards = Array.isArray(d.cards)
    ? d.cards.slice(0, MAX_FEATURE_CARDS).flatMap((x): HomeFeatureCard[] => {
        const r = (x ?? {}) as Record<string, unknown>;
        const img = parseLogoUrl(r.img);
        const t = parseText(r.t, MAX_CARD_TITLE);
        return img && t ? [{ img, t, d: parseText(r.d, MAX_CARD_TEXT) }] : [];
      })
    : null;
  return {
    enabled: typeof d.enabled === 'boolean' ? d.enabled : true,
    title: parseText(d.title),
    items: items && items.length > 0 ? items : null,
    cards: cards && cards.length > 0 ? cards : null,
  };
}

export function pickText(t: FeatureText, language: NavLanguage): string {
  return t[language] || t.en || t.ar || '';
}
