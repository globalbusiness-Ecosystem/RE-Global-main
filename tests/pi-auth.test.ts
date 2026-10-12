import { describe, it, expect, afterEach, vi } from 'vitest';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';

const banned = new Set<string>();
vi.mock('@/lib/ban-list', () => ({ isBanned: async (u: string) => banned.has(u) }));

afterEach(() => {
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
