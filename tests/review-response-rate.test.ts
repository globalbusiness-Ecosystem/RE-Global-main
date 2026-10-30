import { describe, it, expect } from 'vitest';
import { RATE_I18N, RATE_MIN_REVIEWS, rateLabel, responseRate } from '@/lib/review-reply';

const rows = (replied: number, total: number) => Array.from({ length: total }, (_, i) => ({ reply: i < replied ? 'thanks' : '' }));

describe('responseRate', () => {
  it('is hidden until there are enough reviews', () => {
    expect(responseRate([])).toBeNull();
    expect(responseRate(rows(4, RATE_MIN_REVIEWS - 1))).toBeNull();
    expect(responseRate(rows(0, RATE_MIN_REVIEWS))).toBe(0);
  });
  it('is the whole-percent share of reviews with a reply', () => {
    expect(responseRate(rows(5, 5))).toBe(100);
    expect(responseRate(rows(4, 5))).toBe(80);
    expect(responseRate(rows(1, 6))).toBe(17);
    expect(responseRate(rows(2, 3 + 4))).toBe(29);
  });
  it('does not count a blank reply', () => {
    expect(responseRate([{ reply: '  ' }, { reply: '' }, { reply: 'a' }, { reply: 'b' }, { reply: 'c' }])).toBe(60);
  });
});

describe('rateLabel', () => {
  it('fills the number in every language and falls back to English', () => {
    for (const l of Object.keys(RATE_I18N)) expect(rateLabel(l, 80)).toContain('80');
    expect(rateLabel('xx', 50)).toBe('The host replies to 50% of reviews');
    expect(rateLabel('ar', 50)).not.toContain('{n}');
  });
});
