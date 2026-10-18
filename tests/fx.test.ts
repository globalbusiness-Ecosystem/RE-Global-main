import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: () => '1.2.3.4' }));

import { parseRates, fiatHint, formatFiat, isFxCurrency, FX_CURRENCIES } from '@/lib/fx';
import { getFxRates, _resetFxCache } from '@/lib/fx-server';
import { GET } from '@/app/api/fx/route';

const body = (rates: Record<string, unknown>, result = 'success') => ({ result, rates });
const GOOD = { EUR: 0.92, GBP: 0.79, EGP: 48.5, SAR: 3.75, AED: 3.67, JPY: 150, XYZ: 5 };

describe('parseRates', () => {
  it('keeps only supported currencies with sane numbers, and adds USD = 1', () => {
    const r = parseRates(body(GOOD))!;
    expect(r.USD).toBe(1);
    expect(r.EGP).toBe(48.5);
    expect((r as Record<string, number>).XYZ).toBeUndefined();
  });
  it('refuses answers that do not look right', () => {
    expect(parseRates(body(GOOD, 'error'))).toBeNull();
    expect(parseRates(null)).toBeNull();
    expect(parseRates({ result: 'success' })).toBeNull();
    expect(parseRates(body({ EUR: 0.9 }))).toBeNull();
    const bad = parseRates(body({ ...GOOD, EUR: 0, GBP: -1, SAR: 'x', AED: Infinity }));
    expect(bad === null || (bad.EUR === undefined && bad.GBP === undefined && bad.SAR === undefined && bad.AED === undefined)).toBe(true);
    expect(isFxCurrency('EGP')).toBe(true);
    expect(isFxCurrency('XYZ')).toBe(false);
    expect(FX_CURRENCIES.length).toBe(18);
  });
});

describe('fiatHint', () => {
  const rates = parseRates(body(GOOD))!;
  it('keeps the dollar hint exactly as before', () => {
    expect(fiatHint({ price: 1000, currency: 'PI' }, 0.5, 'USD', rates)).toBe('≈ $500');
    expect(fiatHint({ price: 1000, currency: 'USD' }, 0.5, 'USD', rates)).toBeNull();
  });
  it('shows Pi and dollar listings in the chosen currency', () => {
    const eur = fiatHint({ price: 1000, currency: 'PI' }, 0.5, 'EUR', rates)!;
    expect(eur.startsWith('≈ ')).toBe(true);
    expect(eur).toContain('460');
    expect(fiatHint({ price: 1000, currency: 'USD' }, null, 'EUR', rates)).toContain('920');
    expect(fiatHint({ price: 10, currency: 'PI' }, 0.5, 'EGP', rates)).toMatch(/^≈ .*243/);
  });
  it('stays silent without data, for odd currencies and for bad prices', () => {
    expect(fiatHint({ price: 1000, currency: 'PI' }, null, 'EUR', rates)).toBeNull();
    expect(fiatHint({ price: 1000, currency: 'PI' }, 0.5, 'EUR', null)).toBeNull();
    expect(fiatHint({ price: 1000, currency: 'PI' }, 0.5, 'KWD', rates)).toBeNull();
    expect(fiatHint({ price: 1000, currency: 'OUSD' }, 0.5, 'EUR', rates)).toBeNull();
    expect(fiatHint({ price: 'abc', currency: 'PI' }, 0.5, 'EUR', rates)).toBeNull();
    expect(fiatHint({ price: -5, currency: 'PI' }, 0.5, 'EUR', rates)).toBeNull();
  });
  it('writes digits as 0-9 in every language', () => {
    for (const l of ['en', 'ar', 'ur', 'fr', 'zh']) expect(formatFiat(1234.5, 'EGP', l)).toMatch(/1.?235/);
    expect(formatFiat(1234.5, 'EGP', 'ar')).not.toMatch(/[٠-٩]/);
  });
});

describe('getFxRates', () => {
  beforeEach(() => { _resetFxCache(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-18T10:00:00Z')); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  const stub = (impl: () => unknown) => { const f = vi.fn(impl); vi.stubGlobal('fetch', f); return f; };
  const ok = () => ({ ok: true, json: async () => body(GOOD) });

  it('fetches once and then answers from the cache', async () => {
    const f = stub(ok);
    expect((await getFxRates())!.rates.EGP).toBe(48.5);
    await getFxRates();
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('asks again after 6 hours, and keeps the last good answer if the source is down', async () => {
    const f = stub(ok);
    await getFxRates();
    vi.setSystemTime(new Date('2026-10-18T17:00:00Z'));
    f.mockImplementation(() => { throw new Error('down'); });
    const r = await getFxRates();
    expect(f).toHaveBeenCalledTimes(2);
    expect(r!.rates.EGP).toBe(48.5);
  });
  it('gives null when there is nothing good to show', async () => {
    stub(() => { throw new Error('down'); });
    expect(await getFxRates()).toBeNull();
    stub(() => ({ ok: true, json: async () => ({ result: 'error' }) }));
    expect(await getFxRates()).toBeNull();
    stub(() => ({ ok: false, json: async () => ({}) }));
    expect(await getFxRates()).toBeNull();
  });
});

describe('GET /api/fx', () => {
  beforeEach(() => { consume.mockReset(); consume.mockResolvedValue({ ok: true, retryAfter: 0 }); _resetFxCache(); });
  afterEach(() => vi.unstubAllGlobals());
  const req = { headers: new Headers() } as never;

  it('answers with rates and a CDN cache', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => body(GOOD) })));
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=3600');
    expect((await res.json()).rates.EUR).toBe(0.92);
  });
  it('answers 503 (never cached) when no rates are available, and 429 when over the limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    const res = await GET(req);
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    consume.mockResolvedValue({ ok: false, retryAfter: 30 });
    expect((await GET(req)).status).toBe(429);
  });
});
