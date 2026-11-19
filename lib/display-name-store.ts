import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { cooldownLeftMs, nameCooldownMs, nameKey, parseDisplayName } from '@/lib/display-name';
import { getFounder, getFounderUids } from '@/lib/founder-server';
import { getPerson } from '@/lib/person-store';
import { accountKind, primaryOf } from '@/lib/person-link';

const BY_USER = 'userNames';      // userNames/{uid} -> { name, key, changedAt }
const BY_KEY = 'displayNames';    // displayNames/{key} -> { uid, name }

export type MyName = { name: string | null; nextChangeAt: number | null; isFounder: boolean };

export async function getDisplayName(uid: string): Promise<MyName> {
  if (!uid || uid.includes('/')) return { name: null, nextChangeAt: null, isFounder: false };
  const [snap, founderUids] = await Promise.all([adminDb.collection(BY_USER).doc(uid).get(), getFounderUids()]);
  const d = snap.data();
  const isFounder = founderUids.includes(uid);
  let name = typeof d?.name === 'string' && d.name ? d.name : null;
  // One investor, one name: accounts linked to the same person show the main account's name (the name it chose,
  // or, for a Pi account, its verified Pi name). If the main account is a web account with no chosen name, each keeps its own.
  try {
    const person = await getPerson(uid);
    const primary = person ? primaryOf(person.accounts, person.primaryUid) : null;
    if (primary && primary.uid !== uid) {
      const n = (await adminDb.collection(BY_USER).doc(primary.uid).get()).data()?.name;
      if (typeof n === 'string' && n) name = n;
      else if (accountKind(primary.uid) === 'pi') name = primary.username;
    }
  } catch { /* keep the own name */ }
  const at = d?.changedAt?.toMillis?.() ?? null;
  const left = cooldownLeftMs(at, Date.now(), nameCooldownMs(isFounder));
  return { name, nextChangeAt: left > 0 ? Date.now() + left : null, isFounder };
}

export type ClaimNameResult = { ok: true; name: string } | { ok: false; error: 'invalid' | 'taken' | 'cooldown' | 'use_primary'; nextChangeAt?: number };

/**
 * Chooses (or changes) the name. Inside one transaction: the name must be free, the person must not have changed it in
 * the last 7 days, and the founder's own name is kept for the founder's accounts. The old name is released.
 */
export async function claimDisplayName(uid: string, raw: unknown): Promise<ClaimNameResult> {
  if (!uid || uid.includes('/')) return { ok: false, error: 'invalid' };
  const p = parseDisplayName(raw);
  if (!p) return { ok: false, error: 'invalid' };

  // Linked accounts share the main account's name: change it from the main account (or make this one the main account).
  try {
    const person = await getPerson(uid);
    const primary = person ? primaryOf(person.accounts, person.primaryUid) : null;
    if (primary && primary.uid !== uid) return { ok: false, error: 'use_primary' };
  } catch { /* if the check fails, do not block */ }

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
