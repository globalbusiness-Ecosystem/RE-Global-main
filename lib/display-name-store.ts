import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { cooldownLeftMs, nameCooldownMs, nameKey, parseDisplayName } from '@/lib/display-name';
import { getFounder, getFounderUids } from '@/lib/founder-server';
import { getPerson } from '@/lib/person-store';

const BY_USER = 'userNames';      // userNames/{uid} -> { name, key, changedAt }
const BY_KEY = 'displayNames';    // displayNames/{key} -> { uid, name }

export type MyName = { name: string | null; nextChangeAt: number | null; isFounder: boolean };

export async function getDisplayName(uid: string): Promise<MyName> {
  if (!uid || uid.includes('/')) return { name: null, nextChangeAt: null, isFounder: false };
  const [snap, founderUids] = await Promise.all([adminDb.collection(BY_USER).doc(uid).get(), getFounderUids()]);
  const d = snap.data();
  const isFounder = founderUids.includes(uid);
  let name = typeof d?.name === 'string' && d.name ? d.name : null;
  if (!name) {
    // A linked account shows the person's name from another account that has chosen one.
    try {
      const person = await getPerson(uid);
      for (const a of person?.accounts ?? []) {
        if (a.uid === uid) continue;
        const n = (await adminDb.collection(BY_USER).doc(a.uid).get()).data()?.name;
        if (typeof n === 'string' && n) { name = n; break; }
      }
    } catch { /* keep no name */ }
  }
  const at = d?.changedAt?.toMillis?.() ?? null;
  const left = cooldownLeftMs(at, Date.now(), nameCooldownMs(isFounder));
  return { name, nextChangeAt: left > 0 ? Date.now() + left : null, isFounder };
}

export type ClaimNameResult = { ok: true; name: string } | { ok: false; error: 'invalid' | 'taken' | 'cooldown'; nextChangeAt?: number };

/**
 * Chooses (or changes) the name. Inside one transaction: the name must be free, the person must not have changed it in
 * the last 7 days, and the founder's own name is kept for the founder's accounts. The old name is released.
 */
export async function claimDisplayName(uid: string, raw: unknown): Promise<ClaimNameResult> {
  if (!uid || uid.includes('/')) return { ok: false, error: 'invalid' };
  const p = parseDisplayName(raw);
  if (!p) return { ok: false, error: 'invalid' };

  // The founder's name belongs to the founder's accounts only.
  const [founder, founderUids] = await Promise.all([getFounder(), getFounderUids()]);
  if (founder.name && nameKey(founder.name) === p.key && !founderUids.includes(uid)) return { ok: false, error: 'taken' };

  const isFounder = founderUids.includes(uid);
  const userRef = adminDb.collection(BY_USER).doc(uid);
  const keyRef = adminDb.collection(BY_KEY).doc(p.key);
  return adminDb.runTransaction(async (tx): Promise<ClaimNameResult> => {
    const [u, k] = await Promise.all([tx.get(userRef), tx.get(keyRef)]);
    const cur = u.data();
    if (k.exists && k.data()?.uid !== uid) return { ok: false, error: 'taken' };
    if (cur?.key === p.key) {
      // Same name, maybe different capitals: allowed, and it does not start a new waiting period.
      tx.set(userRef, { name: p.name, key: p.key, changedAt: cur.changedAt ?? Timestamp.now() });
      tx.set(keyRef, { uid, name: p.name });
      return { ok: true, name: p.name };
    }
    const left = cooldownLeftMs(cur?.changedAt?.toMillis?.() ?? null, Date.now(), nameCooldownMs(isFounder));
    if (left > 0) return { ok: false, error: 'cooldown', nextChangeAt: Date.now() + left };
    if (typeof cur?.key === 'string' && cur.key) tx.delete(adminDb.collection(BY_KEY).doc(cur.key));
    tx.set(keyRef, { uid, name: p.name });
    tx.set(userRef, { name: p.name, key: p.key, changedAt: Timestamp.now() });
    return { ok: true, name: p.name };
  });
}
