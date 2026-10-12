import { describe, it, expect } from 'vitest';
import { parsePropertyInput } from '@/lib/admin-property';

const base = { title: 'Villa', price: 100, currency: 'Pi', type: 'buy', propertyType: 'villa', status: 'available' };

describe('parsePropertyInput', () => {
  it('accepts a minimal valid property and defaults flags to false', () => {
    const r = parsePropertyInput(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.doc.featured).toBe(false);
      expect(r.doc.hidden).toBe(false);
      expect(r.doc.images).toEqual([]);
      expect(r.doc.createdAt).toBeUndefined();
    }
  });

  it('keeps hidden/featured/coordinates when provided', () => {
    const r = parsePropertyInput({ ...base, hidden: true, featured: true, lat: '30.04', lng: '31.23' });
    expect(r.ok && r.doc).toMatchObject({ hidden: true, featured: true, lat: 30.04, lng: 31.23 });
  });

  it('omits coordinates when left empty', () => {
    const r = parsePropertyInput({ ...base, lat: '', lng: '' });
    expect(r.ok && 'lat' in r.doc).toBe(false);
  });

  it('rejects bad input', () => {
    expect(parsePropertyInput(null).ok).toBe(false);
    expect(parsePropertyInput({ ...base, title: '  ' }).ok).toBe(false);
    expect(parsePropertyInput({ ...base, type: 'nope' }).ok).toBe(false);
    expect(parsePropertyInput({ ...base, price: -1 }).ok).toBe(false);
    expect(parsePropertyInput({ ...base, image: 'javascript:alert(1)' }).ok).toBe(false);
    expect(parsePropertyInput({ ...base, lat: 200, lng: 0 }).ok).toBe(false);
  });
});
