import 'server-only';
import crypto from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

// Shared (cross-instance) rate limiter backed by Firestore collection `rate_limits`.
// On Vercel every serverless instance has its own memory, so an in-memory counter
// can be bypassed simply by hitting different instances. A Firestore transaction
// gives one counter for all of them.
//
// - Clients can't touch this collection (it is not listed in firestore.rules → denied).
// - Keys are hashed, so no usernames/IPs are stored in clear text.
// - Each doc carries `expireAt`; add a Firestore TTL policy on that field
//   (collection group `rate_limits`, field `expireAt`) so old docs delete themselves.
// - If Firestore is unreachable/unconfigured (local dev, outage) we fall back to a
//   per-instance in-memory counter instead of failing requests.

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (only meaningful when ok === false). */
  retryAfter: number;
}

const memory = new Map<string, { n: number; reset: number }>();

function consumeInMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = memory.get(key);
  let result: RateLimitResult;
  if (!b || b.reset < now) {
    memory.set(key, { n: 1, reset: now + windowMs });
    result = { ok: true, retryAfter: 0 };
  } else if (b.n >= limit) {
    result = { ok: false, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
  } else {
    b.n++;
    result = { ok: true, retryAfter: 0 };
  }
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
  }
  return result;
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const id = crypto.createHash('sha256').update(key).digest('hex').slice(0, 40);
  try {
    const ref = adminDb.collection('rate_limits').doc(id);
    return await Promise.race([
      adminDb.runTransaction<RateLimitResult>(async (tx) => {
        const now = Date.now();
        const snap = await tx.get(ref);
        const d = snap.exists ? snap.data()! : null;
        if (!d || Number(d.resetAt) < now) {
          tx.set(ref, {
            count: 1,
            resetAt: now + windowMs,
            expireAt: Timestamp.fromMillis(now + windowMs + 60 * 60 * 1000),
          });
          return { ok: true, retryAfter: 0 };
        }
        if (Number(d.count) >= limit) {
          return { ok: false, retryAfter: Math.max(1, Math.ceil((Number(d.resetAt) - now) / 1000)) };
        }
        tx.update(ref, { count: Number(d.count) + 1 });
        return { ok: true, retryAfter: 0 };
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('rate-limit timeout')), 1500)),
    ]);
  } catch {
    return consumeInMemory(key, limit, windowMs);
  }
}

/** Best-effort client IP for unauthenticated routes. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip')) || 'unknown';
}
