// Editable site content managed from the admin panel (home banners, partners).
export const CONTENT_KINDS = ['banners', 'partners'] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];
export const COLLECTION: Record<ContentKind, string> = { banners: 'site_banners', partners: 'partners' };
export const isKind = (k: unknown): k is ContentKind => CONTENT_KINDS.includes(k as ContentKind);

// Pages a banner button may open (matches the app's navigateToPage ids).
export const LINK_PAGES = ['', 'buy', 'rent', 'hotel', 'invest', 'tokenized', 'abroad', 'offplan', 'map', 'partners'];

export type Parsed = { ok: true; doc: Record<string, unknown> } | { ok: false; error: string };
const fail = (error: string): Parsed => ({ ok: false, error });

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function url(v: unknown): string | null {
  const s = str(v, 2000);
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? s : null;
  } catch {
    return null;
  }
}
function order(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= -9999 && n <= 9999 ? Math.round(n) : null;
}

export function parseContent(kind: ContentKind, b: any): Parsed {
  if (!b || typeof b !== 'object') return fail('Invalid request');
  const ord = order(b.order);
  if (ord === null) return fail('Invalid order');
  const active = b.active !== false;

  if (kind === 'banners') {
    const title = str(b.title, 120);
    if (!title) return fail('Title is required');
    const image = url(b.image);
    if (image === null) return fail('Invalid image URL');
    const link = str(b.link, 30);
    if (!LINK_PAGES.includes(link)) return fail('Invalid link');
    return {
      ok: true,
      doc: {
        title, titleAr: str(b.titleAr, 120), subtitle: str(b.subtitle, 300), subtitleAr: str(b.subtitleAr, 300),
        image, buttonLabel: str(b.buttonLabel, 40), buttonLabelAr: str(b.buttonLabelAr, 40), link, order: ord, active,
      },
    };
  }

  const name = str(b.name, 120);
  if (!name) return fail('Name is required');
  const logo = url(b.logo);
  const website = url(b.website);
  if (logo === null || website === null) return fail('Invalid URL');
  return {
    ok: true,
    doc: {
      name, nameAr: str(b.nameAr, 120), description: str(b.description, 400), descriptionAr: str(b.descriptionAr, 400),
      logo, website, contact: str(b.contact, 200), order: ord, active,
    },
  };
}
