import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { parseHandle } from '@/lib/handle';

export type ClaimResult = { ok: true; handle: string; code: string } | { ok: false; error: 'invalid' | 'taken' | 'already' | 'not_web' };

/** The username a web account chose (and its invite code, which is the same word in capitals). Null when none was chosen yet. */
export async function getHandle(username: string): Promise<{ handle: string; code: string } | null> {
  if (!username || username.includes('/')) return null;
  const d = (await adminDb.collection('referrals').doc(username).get()).data();
  return typeof d?.handle === 'string' && d.handle ? { handle: d.handle, code: typeof d.code === 'string' && d.code ? d.code : d.handle.toUpperCase() } : null;
}

/**
 * A web account chooses its username, once. The same word becomes its invite code. It must be free (names and
 * codes are checked together, inside one transaction) and it never changes afterwards, so contracts that name
 * the person stay true and nobody can take over a name that was already shared.
 */
export async function claimHandle(uid: string, username: string, raw: unknown): Promise<ClaimResult> {
  if (!uid.startsWith('web_') || !username || username.includes('/')) return { ok: false, error: 'not_web' };
  const p = parseHandle(raw);
  if (!p) return { ok: false, error: 'invalid' };
  const hRef = adminDb.collection('handles').doc(p.key);
  const rRef = adminDb.collection('referrals').doc(username);
  const sameCode = adminDb.collection('referrals').where('code', '==', p.code).limit(2);
  return adminDb.runTransaction(async (tx): Promise<ClaimResult> => {
    const [h, r, c] = await Promise.all([tx.get(hRef), tx.get(rRef), tx.get(sameCode)]);
    if (r.exists && r.data()?.handle) return { ok: false, error: 'already' };
    if (h.exists || c.docs.some((d) => d.id !== username)) return { ok: false, error: 'taken' };
    tx.set(hRef, { uid, username, handle: p.handle, createdAt: Timestamp.now() });
    tx.set(rRef, { username, uid, code: p.code, handle: p.handle, ...(r.exists ? {} : { createdAt: Timestamp.now() }) }, { merge: true });
    return { ok: true, handle: p.handle, code: p.code };
  });
}
