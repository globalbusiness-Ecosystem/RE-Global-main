import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: () => '1.2.3.4' }));
const record = vi.fn();
vi.mock('@/lib/client-error-store', () => ({ recordClientError: (...a: unknown[]) => record(...a), listClientErrors: async () => [{ id: 'x' }] }));
const alert = vi.fn();
vi.mock('@/lib/admin-alert', () => ({ alertAdmin: (...a: unknown[]) => alert(...a) }));
const isAdmin = vi.fn();
vi.mock('@/lib/admin-guard', () => ({ isAdminRequest: (...a: unknown[]) => isAdmin(...a) }));

import { normalizeClientError, errorSignature, isNoise } from '@/lib/client-error';
import { ERROR_PAGE_I18N } from '@/lib/error-page-i18n';
import { POST } from '@/app/api/client-error/route';
import { GET } from '@/app/api/admin/client-errors/route';

const post = (body: unknown, raw?: string) => ({ headers: new Headers(), text: async () => raw ?? JSON.stringify(body) }) as never;

describe('normalizeClientError', () => {
  it('keeps a small safe record: no query strings, no e-mail addresses', () => {
    const r = normalizeClientError({ kind: 'render', message: 'Cannot read x of undefined for ann@example.com at /p/1?token=SECRET', stack: 'Error: x\n at f (https://a.com/b.js?v=SECRET:1:2)', page: '/buy?id=9#top' })!;
    expect(r.kind).toBe('render');
    expect(r.page).toBe('/buy');
    expect(JSON.stringify(r)).not.toContain('SECRET');
    expect(JSON.stringify(r)).not.toContain('ann@example.com');
  });
  it('limits the size and ignores browser noise and junk', () => {
    const long = normalizeClientError({ message: 'x'.repeat(1000), stack: Array(50).fill('at a (b.js:1:1)').join('\n'), page: '/' })!;
    expect(long.message.length).toBe(300);
    expect(long.stack.split('\n')).toHaveLength(6);
    expect(normalizeClientError({ message: 'ResizeObserver loop limit exceeded' })).toBeNull();
    expect(normalizeClientError({ message: 'Script error.' })).toBeNull();
    expect(normalizeClientError({ message: '' })).toBeNull();
    for (const bad of [null, 'x', 5, []]) expect(normalizeClientError(bad)).toBeNull();
    expect(normalizeClientError({ message: 'boom', kind: 'weird' })!.kind).toBe('script');
    expect(normalizeClientError({ message: 'boom', page: 'evil' })!.page).toBe('/');
    expect(isNoise('Failed to fetch')).toBe(true);
  });
});

describe('errorSignature', () => {
  it('is the same bug for different numbers and ids, different otherwise', () => {
    const a = normalizeClientError({ message: 'Item 12 failed id=abcdef123456', stack: 'Error\n at go (https://a.com/x.js:10:5)' })!;
    const b = normalizeClientError({ message: 'Item 99 failed id=123456abcdef', stack: 'Error\n at go (https://a.com/x.js:77:9)' })!;
    const c = normalizeClientError({ message: 'Something else failed', stack: 'Error\n at go (https://a.com/x.js:10:5)' })!;
    expect(errorSignature(a)).toBe(errorSignature(b));
    expect(errorSignature(a)).not.toBe(errorSignature(c));
  });
});

describe('error page texts', () => {
  it('every language has every text', () => {
    for (const lang of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const) {
      for (const v of Object.values(ERROR_PAGE_I18N[lang])) expect(v.trim().length).toBeGreaterThan(1);
    }
  });
});

describe('POST /api/client-error', () => {
  beforeEach(() => { consume.mockReset(); record.mockReset(); alert.mockReset(); consume.mockResolvedValue({ ok: true, retryAfter: 0 }); record.mockResolvedValue(false); alert.mockResolvedValue(true); });

  it('records a real error and answers 204', async () => {
    const res = await POST(post({ kind: 'render', message: 'boom', stack: '', page: '/' }));
    expect(res.status).toBe(204);
    expect(record).toHaveBeenCalledTimes(1);
    expect(alert).not.toHaveBeenCalled();
  });
  it('e-mails the owner only the first time an error is seen', async () => {
    record.mockResolvedValue(true);
    await POST(post({ kind: 'script', message: 'new bug', page: '/buy' }));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert.mock.calls[0][0]).toBe('client-error');
  });
  it('stays quiet for noise, junk, big bodies and rate-limited callers', async () => {
    expect((await POST(post({ message: 'ResizeObserver loop limit exceeded' }))).status).toBe(204);
    expect((await POST(post(null, 'not json'))).status).toBe(204);
    expect((await POST(post(null, 'x'.repeat(7000)))).status).toBe(204);
    consume.mockResolvedValue({ ok: false, retryAfter: 5 });
    expect((await POST(post({ message: 'boom' }))).status).toBe(204);
    expect(record).not.toHaveBeenCalled();
  });
  it('never fails the visitor even when the store is down', async () => {
    record.mockRejectedValue(new Error('db down'));
    expect((await POST(post({ message: 'boom' }))).status).toBe(204);
  });
});

describe('GET /api/admin/client-errors', () => {
  it('is for the admin only', async () => {
    isAdmin.mockResolvedValue(false);
    expect((await GET({} as never)).status).toBe(401);
    isAdmin.mockResolvedValue(true);
    const res = await GET({} as never);
    expect(res.status).toBe(200);
    expect((await res.json()).rows).toEqual([{ id: 'x' }]);
  });
});
