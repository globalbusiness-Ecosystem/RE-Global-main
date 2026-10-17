// Kill switch for admin sessions: every session issued before the stored moment stops working.
// Stored in a server-only collection; read through a short cache so admin calls stay fast.

const DOC = ['admin_login_attempts', '_revoke'] as const;
const CACHE_MS = 15_000;
let cache: { at: number; v: number } | null = null;
let memory = 0;

// The database handle is reached inside each try block (it is lazy and throws when Firebase is not configured).
async function doc() {
  return (await import('@/lib/firebase-admin')).adminDb.collection(DOC[0]).doc(DOC[1]);
}

/** Seconds since epoch: sessions issued at or before this are revoked (0 = nothing revoked). */
export async function revokedBefore(now = Date.now()): Promise<number> {
  if (cache && now - cache.at < CACHE_MS) return cache.v;
  let v = memory;
  try { v = Math.max(v, Number((await (await doc()).get()).data()?.before || 0)); } catch { /* keep memory value */ }
  cache = { at: now, v };
  return v;
}

/** Revoke every session issued up to now. Returns the cut-off (seconds). */
export async function revokeAllSessions(now = Date.now()): Promise<number> {
  const before = Math.floor(now / 1000);
  memory = Math.max(memory, before);
  try { await (await doc()).set({ before, updatedAt: now }); } catch (e) { console.error('[admin-revoke] store failed:', e); }
  cache = { at: now, v: memory };
  return before;
}

export function _resetRevokeCache() { cache = null; memory = 0; }
