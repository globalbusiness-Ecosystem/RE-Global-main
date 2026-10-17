import 'server-only';
import crypto from 'crypto';
import { isBanned } from '@/lib/ban-list';

const BRAND: unique symbol = Symbol('AuthenticatedPiUser');

export interface AuthenticatedPiUser {
  readonly [BRAND]: true;
  readonly uid: string;
  readonly username: string;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

interface PiMeResponse {
  uid: string;
  username: string;
}

const PI_ME_ENDPOINT = 'https://api.minepi.com/v2/me';

// A token that Pi just vouched for is trusted for a few seconds on this instance, so a burst of calls
// (payment recovery, page loads) costs one request to Pi instead of one each. Bans are still re-checked every time.
const CACHE_MS = 20_000;
const CACHE_MAX = 500;
const cache = new Map<string, { uid: string; username: string; at: number }>();
const cacheKey = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
export function _clearPiAuthCache(): void { cache.clear(); }

export async function verifyPiAccessToken(accessToken: unknown): Promise<AuthenticatedPiUser> {
  if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
    throw new AuthError('Missing or malformed Pi access token');
  }

  const key = cacheKey(accessToken);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    if (await isBanned(hit.username)) throw new AuthError('This account has been suspended', 403);
    return { [BRAND]: true, uid: hit.uid, username: hit.username } as AuthenticatedPiUser;
  }

  let res: Response;
  try {
    res = await fetch(PI_ME_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    throw new AuthError('Could not reach Pi Platform API to verify identity', 503);
  }

  if (res.status === 401) {
    throw new AuthError('Pi access token is invalid or expired');
  }
  if (!res.ok) {
    throw new AuthError(`Pi Platform API returned an unexpected status: ${res.status}`, 502);
  }

  const me = (await res.json()) as Partial<PiMeResponse>;
  if (!me.uid || !me.username) {
    throw new AuthError('Pi Platform API returned a malformed /v2/me response', 502);
  }

  if (await isBanned(me.username)) {
    throw new AuthError('This account has been suspended', 403);
  }

  if (cache.size >= CACHE_MAX) {
    const now = Date.now();
    for (const [k, v] of cache) if (now - v.at >= CACHE_MS) cache.delete(k);
    if (cache.size >= CACHE_MAX) cache.clear();
  }
  cache.set(key, { uid: me.uid, username: me.username, at: Date.now() });
  return { [BRAND]: true, uid: me.uid, username: me.username } as AuthenticatedPiUser;
}
