import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
const busy = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: () => '1.2.3.4' }));
vi.mock('@/lib/booking-calendar', () => ({ busyRanges: (...a: unknown[]) => busy(...a) }));

import { GET } from '@/app/api/bookings/availability/route';

const req = (id: string) => ({ headers: new Headers(), nextUrl: new URL(`http://x/api/bookings/availability?propertyId=${id}`) }) as never;

describe('GET /api/bookings/availability', () => {
  beforeEach(() => { consume.mockReset(); busy.mockReset(); });

  it('answers with the busy days and a short CDN cache', async () => {
    consume.mockResolvedValue({ ok: true, retryAfter: 0 });
    busy.mockResolvedValue([{ start: '2026-11-01', end: '2026-11-03' }]);
    const res = await GET(req('p1'));
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=10');
    expect(await res.json()).toEqual({ busy: [{ start: '2026-11-01', end: '2026-11-03' }] });
    expect(consume).toHaveBeenCalledWith('avail:1.2.3.4', 120, 600000);
  });

  it('refuses with 429 (and never reads the calendar) when the IP is over the limit', async () => {
    consume.mockResolvedValue({ ok: false, retryAfter: 30 });
    const res = await GET(req('p1'));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    expect(busy).not.toHaveBeenCalled();
  });

  it('never caches a failure', async () => {
    consume.mockResolvedValue({ ok: true, retryAfter: 0 });
    busy.mockRejectedValue(new Error('down'));
    const res = await GET(req('p1'));
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({ busy: [] });
  });
});
