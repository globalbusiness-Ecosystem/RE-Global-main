import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('server-only', () => ({}));
const admin = vi.fn();
vi.mock('@/lib/admin-guard', () => ({ isAdminRequest: (...a: unknown[]) => admin(...a) }));
const lim = vi.fn();
vi.mock('@/lib/rate-guard', () => ({ ipLimited: (...a: unknown[]) => lim(...a) }));

import { geocodeQuery, parseGeocode, osmLink } from '@/lib/geocode';
import { geocode, _resetGeocodeCache } from '@/lib/geocode-server';
import { POST } from '@/app/api/admin/geocode/route';

describe('geocodeQuery', () => {
  it('adds the country when it is not already there', () => {
    expect(geocodeQuery('Downtown Dubai', 'United Arab Emirates')).toBe('Downtown Dubai, United Arab Emirates');
    expect(geocodeQuery('Maadi, Cairo, Egypt', 'Egypt')).toBe('Maadi, Cairo, Egypt');
    expect(geocodeQuery('  New   Cairo \n', '')).toBe('New Cairo');
  });
  it('gives nothing for empty or odd input', () => {
    for (const bad of ['', '   ', null, undefined, 5]) expect(geocodeQuery(bad, 'Egypt')).toBe('');
    expect(geocodeQuery('x'.repeat(500)).length).toBe(200);
  });
});

describe('parseGeocode', () => {
  it('reads the first real result', () => {
    expect(parseGeocode([{ lat: '25.2048493', lon: '55.2707828', display_name: 'Dubai' }])).toEqual({ lat: 25.204849, lng: 55.270783, label: 'Dubai' });
  });
  it('refuses empty, broken and 0,0 answers', () => {
    for (const bad of [null, [], {}, 'x', [null], [{}], [{ lat: 'a', lon: 'b' }], [{ lat: '0', lon: '0' }], [{ lat: '95', lon: '10' }]]) expect(parseGeocode(bad)).toBeNull();
  });
});

describe('osmLink', () => {
  it('links to the exact spot, and not for bad coordinates', () => {
    expect(osmLink('30.04', '31.23')).toBe('https://www.openstreetmap.org/?mlat=30.04&mlon=31.23#map=17/30.04/31.23');
    expect(osmLink('', '')).toBeNull();
    expect(osmLink(0, 0)).toBeNull();
  });
});

describe('geocode (server)', () => {
  beforeEach(() => { _resetGeocodeCache(); });
  afterEach(() => vi.unstubAllGlobals());
  const good = [{ lat: '30.0444', lon: '31.2357', display_name: 'Cairo' }];

  it('asks Nominatim with an identifying User-Agent and caches the answer', async () => {
    const f = vi.fn(async () => ({ ok: true, json: async () => good }));
    vi.stubGlobal('fetch', f);
    const a = await geocode('Cairo', 'EG');
    const b = await geocode('cairo', 'eg');
    expect(a).toEqual({ lat: 30.0444, lng: 31.2357, label: 'Cairo' });
    expect(b).toEqual(a);
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0] as unknown as [URL, { headers: Record<string, string> }];
    expect(String(url)).toContain('countrycodes=eg');
    expect(init.headers['User-Agent']).toContain('RE-Global');
  });
  it('gives null when the service is down or answers badly', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    expect(await geocode('Nowhere A', '')).toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    expect(await geocode('Nowhere B', '')).toBeNull();
  });
});

describe('POST /api/admin/geocode', () => {
  beforeEach(() => { admin.mockReset(); lim.mockReset(); admin.mockResolvedValue(true); lim.mockResolvedValue(null); });
  afterEach(() => vi.unstubAllGlobals());
  const req = (body: unknown) => ({ json: async () => body, headers: new Headers() }) as never;

  it('is admin only', async () => {
    admin.mockResolvedValue(false);
    expect((await POST(req({ location: 'Cairo' }))).status).toBe(401);
  });
  it('is rate limited', async () => {
    const { NextResponse } = await import('next/server');
    lim.mockResolvedValue(NextResponse.json({ error: 'Too many requests' }, { status: 429 }));
    expect((await POST(req({ location: 'Cairo' }))).status).toBe(429);
  });
  it('needs a location', async () => {
    expect((await POST(req({ location: '  ' }))).status).toBe(400);
  });
  it('answers with the spot, or 404 when nothing is found', async () => {
    _resetGeocodeCache();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [{ lat: '25.2', lon: '55.27', display_name: 'Dubai' }] })));
    const ok = await POST(req({ location: 'Dubai Marina', country: 'ae' }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ lat: 25.2, lng: 55.27, label: 'Dubai' });
    _resetGeocodeCache();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [] })));
    expect((await POST(req({ location: 'zzzz qqqq' }))).status).toBe(404);
  });
});

describe('wiring', () => {
  it('the property form has the button and warns before saving without coordinates', () => {
    const f = readFileSync('components/admin/property-form.tsx', 'utf8');
    expect(f).toContain('/api/admin/geocode');
    expect(f).toContain('hasValidCoords');
  });
});
