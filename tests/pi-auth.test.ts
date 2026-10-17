import { describe, it, expect, afterEach, vi } from 'vitest';
import { verifyPiAccessToken, AuthError, _clearPiAuthCache } from '@/lib/pi-auth';

const banned = new Set<string>();
vi.mock('@/lib/ban-list', () => ({ isBanned: async (u: string) => banned.has(u) }));

afterEach(() => {
  _clearPiAuthCache();
  banned.clear();
  vi.unstubAllGlobals();
});

function stubFetch(impl: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => impl(url, init));
  vi.stubGlobal('fetch', fn);
  return fn;
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('verifyPiAccessToken', () => {
  it('rejects missing / blank tokens without calling Pi', async () => {
    const f = stubFetch(() => json({}));
    for (const t of [undefined, null, '', '   ', 42]) {
      await expect(verifyPiAccessToken(t)).rejects.toMatchObject({ name: 'AuthError', status: 401 });
    }
    expect(f).not.toHaveBeenCalled();
  });

  it('returns uid + username for a valid token and sends it as a Bearer header', async () => {
    const f = stubFetch(() => json({ uid: 'u-1', username: 'alice' }));
    const user = await verifyPiAccessToken('tok123');
    expect(user.uid).toBe('u-1');
    expect(user.username).toBe('alice');
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('https://api.minepi.com/v2/me');
    expect((init!.headers as Record<string, string>).Authorization).toBe('Bearer tok123');
  });

  it('maps Pi 401 to 401, other statuses to 502, malformed body to 502', async () => {
    stubFetch(() => json({}, 401));
    await expect(verifyPiAccessToken('t')).rejects.toMatchObject({ status: 401 });
    stubFetch(() => json({}, 500));
    await expect(verifyPiAccessToken('t')).rejects.toMatchObject({ status: 502 });
    stubFetch(() => json({ uid: 'only-uid' }));
    await expect(verifyPiAccessToken('t')).rejects.toMatchObject({ status: 502 });
  });

  it('maps a network failure to 503', async () => {
    stubFetch(() => {
      throw new Error('network down');
    });
    const err = await verifyPiAccessToken('t').catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
    expect(err.status).toBe(503);
  });

  it('rejects a suspended account with 403', async () => {
    banned.add('mallory');
    stubFetch(() => json({ uid: 'u-9', username: 'mallory' }));
    await expect(verifyPiAccessToken('tok')).rejects.toMatchObject({ name: 'AuthError', status: 403 });
  });
});

describe('verifyPiAccessToken cache and timeout', () => {
  it('trusts a token Pi just vouched for, so a burst costs one request', async () => {
    const f = stubFetch(() => json({ uid: 'u-1', username: 'alice' }));
    await verifyPiAccessToken('burst-token');
    const again = await verifyPiAccessToken('burst-token');
    expect(again.username).toBe('alice');
    expect(f).toHaveBeenCalledTimes(1);
    await verifyPiAccessToken('another-token');
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('still blocks a suspended account while its token is cached', async () => {
    stubFetch(() => json({ uid: 'u-2', username: 'bob' }));
    await verifyPiAccessToken('bob-token');
    banned.add('bob');
    await expect(verifyPiAccessToken('bob-token')).rejects.toMatchObject({ status: 403 });
  });

  it('never caches a failed check', async () => {
    const f = stubFetch(() => json({}, 401));
    await expect(verifyPiAccessToken('bad-token')).rejects.toMatchObject({ status: 401 });
    await expect(verifyPiAccessToken('bad-token')).rejects.toMatchObject({ status: 401 });
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('gives up on a hanging Pi API instead of waiting forever', async () => {
    const f = stubFetch(() => json({ uid: 'u-3', username: 'carol' }));
    await verifyPiAccessToken('timeout-token');
    expect(f.mock.calls[0][1]!.signal).toBeInstanceOf(AbortSignal);
  });
});
