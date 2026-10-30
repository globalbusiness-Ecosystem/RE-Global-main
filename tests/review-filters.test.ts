import { describe, it, expect } from 'vitest';
import { REVIEW_FILTERS, countReviews, filterReviews } from '@/lib/review-filters';

const rows = [
  { id: 'a', hidden: false, reply: '', reports: 0 },
  { id: 'b', hidden: false, reply: 'thanks', reports: 1 },
  { id: 'c', hidden: true, reply: '', reports: 4 },
  { id: 'd', hidden: false, reply: '  ', reports: 4 },
  { id: 'e', hidden: false, reply: 'ok', reports: 0 },
];
const ids = (f: Parameters<typeof filterReviews>[1]) => filterReviews(rows, f).map((r) => r.id);

describe('filterReviews', () => {
  it('shows everything for "all", in the original order', () => {
    expect(ids('all')).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
  it('"reported" lists flagged reviews, most reported first, ties keep the original order', () => {
    expect(ids('reported')).toEqual(['c', 'd', 'b']);
  });
  it('"hidden" lists hidden reviews only', () => {
    expect(ids('hidden')).toEqual(['c']);
  });
  it('"unanswered" lists visible reviews without a real reply', () => {
    expect(ids('unanswered')).toEqual(['a', 'd']);
  });
  it('does not change the input', () => {
    const copy = JSON.stringify(rows);
    filterReviews(rows, 'reported');
    expect(JSON.stringify(rows)).toBe(copy);
  });
  it('counts match the lists', () => {
    for (const f of REVIEW_FILTERS) expect(countReviews(rows, f)).toBe(filterReviews(rows, f).length);
  });
});
