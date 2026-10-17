import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
const record = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: () => '9.9.9.9' }));
vi.mock('@/lib/csp-store', () => ({ recordCsp: (...a: unknown[]) => record(...a) }));

import { POST } from '@/app/api/csp-report/route';

const post = (body: string) => ({ headers: new Headers(), text: async () => body }) as never;
const good = JSON.stringify({ 'csp-report': { 'effective-directive': 'script-src', 'blocked-uri': 'https://cdn.test/a.js', 'document-uri': 'https://x.app/buy?id=1' } });

describe('POST /api/csp-report', () => {
  beforeEach(() => { consume.mockReset(); record.mockReset(); consume.mockResolvedValue({ ok: true, retryAfter: 0 }); });

  it('stores a clean record and answers 204', async () => {
    const res = await POST(post(good));
    expect(res.status).toBe(204);
    expect(record).toHaveBeenCalledWith({ directive: 'script-src', blocked: 'cdn.test', page: '/buy' });
  });
  it('answers 204 and stores nothing for junk, oversized bodies and rate-limited senders', async () => {
    expect((await POST(post('not json'))).status).toBe(204);
    expect((await POST(post('x'.repeat(9000)))).status).toBe(204);
    consume.mockResolvedValue({ ok: false, retryAfter: 5 });
    expect((await POST(post(good))).status).toBe(204);
    expect(record).not.toHaveBeenCalled();
  });
});
