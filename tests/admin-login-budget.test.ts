import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a) }));

import { spendLoginAttempt, LOGIN_BUDGET, LOGIN_WINDOW_MS } from '@/lib/admin-login-budget';

describe('shared admin login budget', () => {
  beforeEach(() => consume.mockReset());

  it('counts every attempt against one shared key, whatever the IP', async () => {
    consume.mockResolvedValue({ ok: true, retryAfter: 0 });
    expect(await spendLoginAttempt()).toEqual({ ok: true, retryAfter: 0 });
    expect(consume).toHaveBeenCalledWith('admin-login-all', LOGIN_BUDGET, LOGIN_WINDOW_MS);
  });

  it('reports when the overall budget is used up', async () => {
    consume.mockResolvedValue({ ok: false, retryAfter: 600 });
    expect((await spendLoginAttempt()).ok).toBe(false);
  });

  it('keeps total guesses small: at most ~10,000 a day', () => {
    expect((LOGIN_BUDGET * 24 * 60 * 60 * 1000) / LOGIN_WINDOW_MS).toBeLessThanOrEqual(10000);
  });
});
