import 'server-only';
import { NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { consumeRateLimit } from '@/lib/rate-limit';

export interface GuardedUser {
  uid: string;
  username: string;
}

// Authenticates the caller (Pi access token) and applies a shared per-user rate limit.
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
  const rl = await consumeRateLimit(`${opts.scope}:${user.uid}`, limit, windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests, try again later' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  return { uid: user.uid, username: user.username };
}
