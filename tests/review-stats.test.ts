import { describe, it, expect } from 'vitest';
import { LOW_RATING, reviewOverview } from '@/lib/review-stats';

const r = (propertyTitle: string, rating: number, extra: Partial<{ hidden: boolean; reply: string }> = {}) => ({ propertyTitle, rating, hidden: false, reply: '', ...extra });

describe('reviewOverview', () => {
  it('is empty without reviews', () => {
    expect(reviewOverview([])).toEqual({ count: 0, avg: 0, unanswered: 0, properties: [] });
  });
  it('averages per property and lists the lowest rated first', () => {
    const o = reviewOverview([r('Nile', 5), r('Nile', 4), r('Cairo Inn', 2), r('Delta', 4), r('Delta', 5), r('Delta', 5)]);
    expect(o.properties.map((p) => p.title)).toEqual(['Cairo Inn', 'Nile', 'Delta']);
    expect(o.properties[1]).toEqual({ title: 'Nile', count: 2, avg: 4.5 });
    expect(o.properties[2].avg).toBe(4.7);
    expect(o.count).toBe(6);
    expect(o.avg).toBe(4.2);
  });
  it('leaves hidden and invalid ratings out', () => {
    const o = reviewOverview([r('A', 5), r('A', 1, { hidden: true }), r('A', 0), r('A', 9), r('A', Number.NaN)]);
    expect(o.count).toBe(1);
    expect(o.properties).toEqual([{ title: 'A', count: 1, avg: 5 }]);
  });
  it('counts visible reviews without a real reply', () => {
    const o = reviewOverview([r('A', 5, { reply: 'thanks' }), r('A', 4, { reply: '   ' }), r('A', 3), r('A', 2, { hidden: true })]);
    expect(o.unanswered).toBe(2);
  });
  it('breaks ties by more reviews, then by name, and caps the list', () => {
    const rows = [r('B', 4), r('A', 4), r('C', 4), r('C', 4)];
    expect(reviewOverview(rows).properties.map((p) => p.title)).toEqual(['C', 'A', 'B']);
    expect(reviewOverview(rows, 2).properties).toHaveLength(2);
    expect(reviewOverview(rows, 0).properties).toHaveLength(1);
  });
  it('exposes the low-rating line used for the warning colour', () => {
    expect(LOW_RATING).toBe(3.5);
  });
});
