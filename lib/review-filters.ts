// Admin review moderation: which reviews to show. Pure helpers, safe for the browser.
export type ReviewFilter = 'all' | 'reported' | 'hidden' | 'unanswered';
export const REVIEW_FILTERS: ReviewFilter[] = ['all', 'reported', 'unanswered', 'hidden'];

type Row = { hidden: boolean; reply: string; reports: number };

const match = (r: Row, f: ReviewFilter) =>
  f === 'reported' ? r.reports > 0 : f === 'hidden' ? r.hidden : f === 'unanswered' ? !r.hidden && !r.reply.trim() : true;

export function filterReviews<T extends Row>(rows: T[], f: ReviewFilter): T[] {
  const out = rows.filter((r) => match(r, f));
  // Most reported first; the sort is stable so the original (newest first) order is kept for ties.
  return f === 'reported' ? [...out].sort((a, b) => b.reports - a.reports) : out;
}

export const countReviews = (rows: Row[], f: ReviewFilter) => rows.filter((r) => match(r, f)).length;
