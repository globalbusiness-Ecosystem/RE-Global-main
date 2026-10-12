import 'server-only';
import { adminDb } from '@/lib/firebase-admin';

// Suspended accounts live in Firestore collection "banned_users" (doc id = Pi
// username). Lookups are cached briefly so a burst of API calls costs one read.
const TTL_MS = 30_000;
const cache = new Map<string, { banned: boolean; at: number }>();

export function validUsername(u: unknown): u is string {
  return typeof u === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(u);
}

/** Fails OPEN (not banned) if Firestore is unreachable, so an outage never locks everyone out. */
export async function isBanned(username: string): Promise<boolean> {
  if (!validUsername(username)) return false;
  const hit = cache.get(username);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.banned;
  try {
    const snap = await Promise.race([
      adminDb.collection('banned_users').doc(username).get(),
      new Promise<null>((r) => setTimeout(() => r(null), 2500)),
    ]);
    if (snap === null) return false;
    const banned = snap.exists;
    cache.set(username, { banned, at: Date.now() });
    return banned;
  } catch {
    return false;
  }
}

export function forgetBan(username: string): void {
  cache.delete(username);
}
