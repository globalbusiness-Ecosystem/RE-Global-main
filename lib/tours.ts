// Virtual (360°) tours on the home screen. One entry for everything: the tours are the listings the admin gave a 360 link,
// plus the built-in sample tour while sample content is switched on. The admin can switch the whole entry off.

export type TourItem = { id: string; title: string; titleAr: string; location: string; locationAr: string; image: string; vrUrl: string };

/** Anything other than an explicit `false` keeps tours on, so a missing or broken setting never removes the entry. */
export const parseToursEnabled = (v: unknown): boolean => v !== false;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const link = (v: unknown) => { const s = str(v, 600); return /^https:\/\//i.test(s) ? s : ''; };

/** Listings that can be toured: visible, with an https 360 link. Capped so the screen and the answer stay small. */
export function tourItems(docs: { id: string; data: Record<string, unknown> }[], max = 60): TourItem[] {
  const out: TourItem[] = [];
  for (const d of docs) {
    if (d.data.hidden === true) continue;
    const vrUrl = link(d.data.vrUrl);
    if (!vrUrl) continue;
    const image = link(d.data.image) || (Array.isArray(d.data.images) ? link(d.data.images[0]) : '');
    out.push({ id: d.id, title: str(d.data.title, 120), titleAr: str(d.data.titleAr, 120), location: str(d.data.location, 120), locationAr: str(d.data.locationAr, 120), image, vrUrl });
    if (out.length >= max) break;
  }
  return out;
}

/** Does the home screen show the tours entry? Switched on by the admin, and something to open. */
export const showToursEntry = (s: { enabled: boolean; demo: boolean; count: number } | null): boolean => !!s && s.enabled && (s.count > 0 || s.demo);
