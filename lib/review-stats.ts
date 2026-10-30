// Admin review overview: how guests rate each property, worst first so problems stand out. Pure helpers.
export interface ReviewRow { propertyTitle: string; rating: number; hidden: boolean; reply: string }
export interface PropertyRating { title: string; count: number; avg: number }
export interface ReviewOverview { count: number; avg: number; unanswered: number; properties: PropertyRating[] }

export const LOW_RATING = 3.5;
const round1 = (n: number) => Math.round(n * 10) / 10;

// Hidden reviews are left out, as they are not on the public page either.
export function reviewOverview(rows: ReviewRow[], maxProperties = 8): ReviewOverview {
  const visible = rows.filter((r) => !r.hidden && Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  const by = new Map<string, number[]>();
  for (const r of visible) by.set(r.propertyTitle, [...(by.get(r.propertyTitle) ?? []), r.rating]);
  const properties = [...by.entries()]
    .map(([title, v]) => ({ title, count: v.length, avg: round1(v.reduce((a, b) => a + b, 0) / v.length) }))
    .sort((a, b) => a.avg - b.avg || b.count - a.count || a.title.localeCompare(b.title))
    .slice(0, Math.max(1, maxProperties));
  const total = visible.reduce((a, r) => a + r.rating, 0);
  return {
    count: visible.length,
    avg: visible.length ? round1(total / visible.length) : 0,
    unanswered: visible.filter((r) => !r.reply.trim()).length,
    properties,
  };
}
