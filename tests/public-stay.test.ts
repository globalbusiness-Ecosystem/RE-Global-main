import { describe, it, expect } from 'vitest';
import { toPublicListing, listingTexts, listingJsonLd } from '@/lib/public-listings';

const hotel = { title: 'Nile Hotel', price: 120, currency: 'Pi', location: 'Cairo', country: 'EG', type: 'hotel', lat: 30.04, lng: 31.23, checkInTime: '14:00', checkOutTime: '11:00', maxGuests: 4 };

describe('public hotel and rental pages', () => {
  it('reads stay facts and drops invalid ones', () => {
    const l = toPublicListing('h', hotel)!;
    expect(l.checkInTime).toBe('14:00');
    expect(l.maxGuests).toBe(4);
    const bad = toPublicListing('h', { ...hotel, checkInTime: '25:00', checkOutTime: 5, maxGuests: 0 })!;
    expect('checkInTime' in bad).toBe(false);
    expect('checkOutTime' in bad).toBe(false);
    expect('maxGuests' in bad).toBe(false);
    expect('maxGuests' in toPublicListing('h', { ...hotel, maxGuests: 999 })!).toBe(false);
  });
  it('shows the price per night or per month and the stay facts', () => {
    const t = listingTexts(toPublicListing('h', hotel)!, 'en');
    expect(t.price).toMatch(/\/ night$/);
    expect(t.facts).toContain('Up to 4 guests');
    expect(t.description).toContain('/ night');
    expect(listingTexts(toPublicListing('r', { ...hotel, type: 'rent' })!, 'en').price).toMatch(/\/ month$/);
    expect(listingTexts(toPublicListing('b', { ...hotel, type: 'buy' })!, 'en').price).not.toContain('/');
    expect(listingTexts(toPublicListing('h', hotel)!, 'ar').price).toContain('ليلة');
  });
  it('does not show stay facts for a plain sale', () => {
    expect(listingTexts(toPublicListing('b', { ...hotel, type: 'buy' })!, 'en').facts).not.toContain('guests');
  });
  it('emits Hotel structured data with per-night pricing', () => {
    const ld = listingJsonLd(toPublicListing('h', hotel)!, 'https://e.com', 'en') as Record<string, any>;
    expect(ld['@type']).toBe('Hotel');
    expect(ld.checkinTime).toBe('14:00');
    expect(ld.checkoutTime).toBe('11:00');
    expect(ld.occupancy.maxValue).toBe(4);
    expect(ld.geo.latitude).toBe(30.04);
    expect(ld.address.addressCountry).toBe('EG');
    expect(ld.offers.priceSpecification).toMatchObject({ unitCode: 'DAY', price: 120, priceCurrency: 'XPI' });
  });
  it('keeps rentals as real estate listings priced per month', () => {
    const ld = listingJsonLd(toPublicListing('r', { ...hotel, type: 'rent' })!, 'https://e.com', 'en') as Record<string, any>;
    expect(ld['@type']).toBe('RealEstateListing');
    expect(ld.checkinTime).toBeUndefined();
    expect(ld.offers.priceSpecification.unitCode).toBe('MON');
  });
  it('leaves other listings unchanged', () => {
    const ld = listingJsonLd(toPublicListing('b', { ...hotel, type: 'buy' })!, 'https://e.com', 'en') as Record<string, any>;
    expect(ld['@type']).toBe('RealEstateListing');
    expect(ld.offers.priceSpecification).toBeUndefined();
  });
});
