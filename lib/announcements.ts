import type { FeatureText } from './home-features';
import { FEATURE_LANGS } from './home-features';
import { parseLogoUrl } from './branding';
import { parseVideoUrl } from './video-embed';

// The announcements board on the home page: offers, partnerships, events, news and videos the admin writes.
export const ANNOUNCEMENT_KINDS = ['offer', 'partnership', 'event', 'news', 'video'] as const;
export type AnnouncementKind = (typeof ANNOUNCEMENT_KINDS)[number];
// Pages a card may open inside the app ("page:buy"). Anything else must be an https address.
export const LINK_PAGES = ['buy', 'rent', 'hotel', 'invest', 'tokenized', 'share-market', 'abroad', 'offplan', 'map', 'partners', 'analytics', 'contracts', 're-token', 'about', 'whitepaper'] as const;

export type Announcement = {
  kind: AnnouncementKind;
  active: boolean;
  img: string | null;
  t: FeatureText;
  d: FeatureText | null;
  /** YYYY-MM-DD. An event's day / an offer's last day; those two kinds disappear the day after. */
  date: string | null;
  link: string | null;
  linkLabel: FeatureText | null;
  video: string | null;
};
export type Announcements = { enabled: boolean; showStats: boolean; title: FeatureText | null; items: Announcement[] };

export const DEFAULT_ANNOUNCEMENTS: Announcements = { enabled: true, showStats: false, title: null, items: [] };
export const MAX_ANNOUNCEMENTS = 12;
export const MAX_ANN_TITLE = 70;
export const MAX_ANN_TEXT = 220;
export const MAX_ANN_LABEL = 24;

function parseText(v: unknown, max: number): FeatureText | null {
  if (!v || typeof v !== 'object') return null;
  const out: FeatureText = {};
  for (const l of FEATURE_LANGS) {
    const x = (v as Record<string, unknown>)[l];
    if (typeof x === 'string') { const s = x.trim(); if (s && s.length <= max) out[l] = s; }
  }
  return out.en || out.ar ? out : null;
}

export function parseDate(v: unknown): string | null {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(v + 'T00:00:00Z');
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : v;
}

export function parseLink(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (s.startsWith('page:')) return (LINK_PAGES as readonly string[]).includes(s.slice(5)) ? s : null;
  return parseLogoUrl(s);
}

export function parseAnnouncements(data: unknown): Announcements {
  const d = (data ?? {}) as Record<string, unknown>;
  const items = Array.isArray(d.items)
    ? d.items.slice(0, MAX_ANNOUNCEMENTS).flatMap((x): Announcement[] => {
        const r = (x ?? {}) as Record<string, unknown>;
        const t = parseText(r.t, MAX_ANN_TITLE);
        if (!t) return [];
        const kind = (ANNOUNCEMENT_KINDS as readonly string[]).includes(r.kind as string) ? (r.kind as AnnouncementKind) : 'news';
        const video = parseVideoUrl(r.video) ? String(r.video).trim() : null;
        if (kind === 'video' && !video) return [];
        const link = parseLink(r.link);
        return [{
          kind,
          active: typeof r.active === 'boolean' ? r.active : true,
          img: parseLogoUrl(r.img),
          t,
          d: parseText(r.d, MAX_ANN_TEXT),
          date: parseDate(r.date),
          link,
          linkLabel: link ? parseText(r.linkLabel, MAX_ANN_LABEL) : null,
          video,
        }];
      })
    : [];
  return {
    enabled: typeof d.enabled === 'boolean' ? d.enabled : true,
    showStats: d.showStats === true,
    title: parseText(d.title, 80),
    items,
  };
}

/** What visitors see: active items only; an offer or event is gone the day after its date. `today` is YYYY-MM-DD. */
export function visibleAnnouncements(items: Announcement[], today: string): Announcement[] {
  return items.filter((a) => a.active && !((a.kind === 'offer' || a.kind === 'event') && a.date && a.date < today));
}
