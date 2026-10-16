import 'server-only';
import { NextResponse } from 'next/server';
import { consumeRateLimit } from '@/lib/rate-limit';

// For routes that already know the user: returns a 429 response when the user is over the limit, otherwise null.
export async function rateLimited(scope: string, uid: string, limit: number, windowMs: number): Promise<NextResponse | null> {
  const rl = await consumeRateLimit(`${scope}:${uid}`, limit, windowMs);
  if (rl.ok) return null;
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(rl.retryAfter), 'Cache-Control': 'no-store' } },
  );
}
