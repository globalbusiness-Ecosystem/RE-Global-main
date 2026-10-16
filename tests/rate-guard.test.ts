import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a) }));

import { rateLimited } from '@/lib/rate-guard';

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
