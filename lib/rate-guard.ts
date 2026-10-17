import 'server-only';
import { NextResponse } from 'next/server';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';

// For routes that already know the user: returns a 429 response when the user is over the limit, otherwise null.
export async function rateLimited(scope: string, uid: string, limit: number, windowMs: number): Promise<NextResponse | null> {
  const rl = await consumeRateLimit(`${scope}:${uid}`, limit, windowMs);
  if (rl.ok) return null;
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(rl.retryAfter), 'Cache-Control': 'no-store' } },
  );
}

// For public routes (no user yet): same idea, keyed by the caller's IP.
export async function ipLimited(scope: string, req: Request, limit: number, windowMs: number): Promise<NextResponse | null> {
  return rateLimited(scope, clientIp(req), limit, windowMs);
}
