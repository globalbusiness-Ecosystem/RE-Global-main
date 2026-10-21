import { describe, it, expect } from 'vitest';
import { toPublicListing, listingJsonLd, withRating } from '@/lib/public-listings';

const hotel = { title: 'Nile Hotel', price: 120, currency: 'Pi', location: 'Cairo', country: 'EG', type: 'hotel' };

describe('review average on public pages', () => {
  it('adds the average and count to hotels and rentals only', () => {
    const h = withRating(toPublicListing('h', hotel)!, { count: 12, avg: 4.3 });
    expect(h).toMatchObject({ ratingValue: 4.3, ratingCount: 12 });
    expect(withRating(toPublicListing('r', { ...hotel, type: 'rent' })!, { count: 2, avg: 5 }).ratingCount).toBe(2);
    expect('ratingValue' in withRating(toPublicListing('b', { ...hotel, type: 'buy' })!, { count: 2, avg: 5 })).toBe(false);
  });
  it('ignores empty or invalid summaries', () => {
    const l = toPublicListing('h', hotel)!;
    expect(withRating(l, { count: 0, avg: 0 })).toBe(l);
    expect(withRating(l, { count: 3, avg: 9 })).toBe(l);
    expect(withRating(l, null)).toBe(l);
    expect(withRating(l, undefined)).toBe(l);
  });
  it('puts AggregateRating in the Hotel structured data', () => {
    const ld = listingJsonLd(withRating(toPublicListing('h', hotel)!, { count: 12, avg: 4.3 }), 'https://e.com', 'en') as Record<string, any>;
    expect(ld.aggregateRating).toEqual({ '@type': 'AggregateRating', ratingValue: 4.3, reviewCount: 12, bestRating: 5, worstRating: 1 });
  });
  it('has no rating markup without reviews, and none for rentals', () => {
    expect((listingJsonLd(toPublicListing('h', hotel)!, 'https://e.com', 'en') as Record<string, any>).aggregateRating).toBeUndefined();
    const r = withRating(toPublicListing('r', { ...hotel, type: 'rent' })!, { count: 2, avg: 5 });
    expect((listingJsonLd(r, 'https://e.com', 'en') as Record<string, any>).aggregateRating).toBeUndefined();
  });
});
