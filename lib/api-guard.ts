import 'server-only';
import { NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';

// Best-effort per-instance rate limit (resets on cold start).
const buckets = new Map<string, { n: number; reset: number }>();

export interface GuardedUser {
  uid: string;
  username: string;
}

export async function guardApi(
  req: Request,
  opts: { scope: string; limit?: number; windowMs?: number }
): Promise<GuardedUser | NextResponse> {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  let user;
  try {
    user = await verifyPiAccessToken(token);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Authentication required' }, { status });
  }

  const limit = opts.limit ?? 20;
  const windowMs = opts.windowMs ?? 10 * 60 * 1000;
  const key = `${opts.scope}:${user.uid}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
  } else if (b.n >= limit) {
    return NextResponse.json(
      { error: 'Too many requests, try again later' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((b.reset - now) / 1000)) } }
    );
  } else {
    b.n++;
  }
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  }

  return { uid: user.uid, username: user.username };
}
