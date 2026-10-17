import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: (r: Request) => r.headers.get('x-forwarded-for') || 'unknown' }));

import { rateLimited, ipLimited } from '@/lib/rate-guard';

describe('rateLimited', () => {
  beforeEach(() => consume.mockReset());

  it('lets the request through while under the limit', async () => {
    consume.mockResolvedValue({ ok: true, retryAfter: 0 });
    expect(await rateLimited('mine', 'u1', 60, 1000)).toBeNull();
    expect(consume).toHaveBeenCalledWith('mine:u1', 60, 1000);
  });

  it('answers 429 with Retry-After when over the limit', async () => {
    consume.mockResolvedValue({ ok: false, retryAfter: 42 });
    const res = await rateLimited('mine', 'u1', 60, 1000);
    expect(res?.status).toBe(429);
    expect(res?.headers.get('Retry-After')).toBe('42');
    expect(await res?.json()).toEqual({ error: 'Too many requests' });
  });
});

describe('ipLimited', () => {
  beforeEach(() => consume.mockReset());

  it('counts per caller IP under its own scope', async () => {
    consume.mockResolvedValue({ ok: true, retryAfter: 0 });
    const req = new Request('http://x/y', { headers: { 'x-forwarded-for': '9.9.9.9' } });
    expect(await ipLimited('pub', req, 30, 1000)).toBeNull();
    expect(consume).toHaveBeenCalledWith('pub:9.9.9.9', 30, 1000);
  });

  it('answers 429 once the IP is over the limit', async () => {
    consume.mockResolvedValue({ ok: false, retryAfter: 7 });
    const res = await ipLimited('pub', new Request('http://x/y'), 30, 1000);
    expect(res?.status).toBe(429);
    expect(res?.headers.get('Retry-After')).toBe('7');
  });
});
