import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (s: string) => createHash('sha256').update(s).digest();

// Vercel Cron calls the route with "Authorization: Bearer <CRON_SECRET>". Without a long enough secret the route is off.
export function isCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 16) return false;
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  return timingSafeEqual(digest(given), digest(secret));
}
