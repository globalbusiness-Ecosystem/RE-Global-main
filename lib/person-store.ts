import 'server-only';
import { randomInt } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import {
  LINK_CODE_TTL_MS, afterUnlink, linkCodeExpired, mergeAccounts, parseLinkCode, primaryOf, randomLinkCode, type AccountRef,
} from '@/lib/person-link';

const PERSONS = 'persons';
const OF = 'personOf';
const CODES = 'linkCodes';
const rand = () => randomInt(0, 1_000_000) / 1_000_000;

export type Person = { id: string; accounts: AccountRef[]; primaryUid: string | null };

const readAccounts = (v: unknown): AccountRef[] =>
  Array.isArray(v) ? v.filter((a): a is AccountRef => !!a && typeof a.uid === 'string' && typeof a.username === 'string') : [];

/** The linked person this account belongs to, or null when it stands alone. */
export async function getPerson(uid: string): Promise<Person | null> {
  if (!uid || uid.includes('/')) return null;
  const link = await adminDb.collection(OF).doc(uid).get();
  const id = link.exists ? String(link.data()?.personId ?? '') : '';
  if (!id) return null;
  const p = await adminDb.collection(PERSONS).doc(id).get();
  if (!p.exists) return null;
  const accounts = readAccounts(p.data()?.accounts);
  return accounts.length > 1 ? { id, accounts, primaryUid: typeof p.data()?.primaryUid === 'string' ? (p.data()?.primaryUid as string) : null } : null;
}

/** All accounts of this person, including this one. Falls back to this account alone if the lookup fails, so rewards never break. */
export async function personAccounts(uid: string, username: string): Promise<AccountRef[]> {
  try {
    const p = await getPerson(uid);
    return p ? p.accounts : [{ uid, username }];
  } catch {
    return [{ uid, username }];
  }
}

export async function createLinkCode(uid: string, username: string): Promise<{ code: string; expiresAt: number }> {
  if (!uid || !username || username.includes('/')) throw new Error('bad account');
  for (let i = 0; i < 6; i++) {
    const code = randomLinkCode(rand);
    const ref = adminDb.collection(CODES).doc(code);
    const expiresAt = Date.now() + LINK_CODE_TTL_MS;
    const ok = await adminDb.runTransaction(async (tx): Promise<boolean> => {
      const s = await tx.get(ref);
      if (s.exists && !linkCodeExpired(s.data()?.expiresAt?.toMillis?.() ?? 0)) return false;
      tx.set(ref, { uid, username, expiresAt: Timestamp.fromMillis(expiresAt) });
      return true;
    });
    if (ok) return { code, expiresAt };
  }
  throw new Error('no free link code');
}

type LinkResult = { ok: true } | { ok: false; error: 'invalid' | 'self' | 'already' | 'both_linked' | 'limit' };

/** The code was made by account A (the owner); the caller is account B. Joins them into one person. */
export async function redeemLinkCode(uid: string, username: string, raw: unknown): Promise<LinkResult> {
  const code = parseLinkCode(raw);
  if (!code || !uid || !username || username.includes('/')) return { ok: false, error: 'invalid' };
  const codeRef = adminDb.collection(CODES).doc(code);
  return adminDb.runTransaction(async (tx): Promise<LinkResult> => {
    const c = await tx.get(codeRef);
    const d = c.data();
    if (!c.exists || !d || linkCodeExpired(d.expiresAt?.toMillis?.() ?? 0)) return { ok: false, error: 'invalid' };
    const owner: AccountRef = { uid: String(d.uid), username: String(d.username) };
    if (owner.uid === uid) return { ok: false, error: 'self' };
    const me: AccountRef = { uid, username };
    const [ownerLink, myLink] = await Promise.all([tx.get(adminDb.collection(OF).doc(owner.uid)), tx.get(adminDb.collection(OF).doc(uid))]);
    const ownerPid = ownerLink.exists ? String(ownerLink.data()?.personId ?? '') : '';
    const myPid = myLink.exists ? String(myLink.data()?.personId ?? '') : '';
    if (ownerPid && myPid && ownerPid === myPid) return { ok: false, error: 'already' };
    if (ownerPid && myPid) return { ok: false, error: 'both_linked' };
    const pid = ownerPid || myPid;
    let existing: AccountRef[] = [];
    let primaryUid: string | null = owner.uid;
    if (pid) {
      const ps = await tx.get(adminDb.collection(PERSONS).doc(pid));
      existing = readAccounts(ps.data()?.accounts);
      primaryUid = typeof ps.data()?.primaryUid === 'string' ? (ps.data()?.primaryUid as string) : existing[0]?.uid ?? owner.uid;
    }
    const merged = mergeAccounts(existing, [owner, me]);
    if (!merged) return { ok: false, error: 'limit' };
    const id = pid || adminDb.collection(PERSONS).doc().id;
    tx.set(adminDb.collection(PERSONS).doc(id), { accounts: merged, primaryUid, updatedAt: Timestamp.now() }, { merge: true });
    for (const a of merged) tx.set(adminDb.collection(OF).doc(a.uid), { personId: id });
    tx.delete(codeRef);
    return { ok: true };
  });
}

/** This account leaves its person. If only one account would remain, the link is removed completely. */
export async function unlinkAccount(uid: string): Promise<boolean> {
  return adminDb.runTransaction(async (tx): Promise<boolean> => {
    const link = await tx.get(adminDb.collection(OF).doc(uid));
    const pid = link.exists ? String(link.data()?.personId ?? '') : '';
    if (!pid) return false;
    const pRef = adminDb.collection(PERSONS).doc(pid);
    const ps = await tx.get(pRef);
    const accounts = readAccounts(ps.data()?.accounts);
    const primaryUid = typeof ps.data()?.primaryUid === 'string' ? (ps.data()?.primaryUid as string) : null;
    const left = afterUnlink(accounts, primaryUid, uid);
    tx.delete(adminDb.collection(OF).doc(uid));
    if (left.accounts.length === 0) {
      for (const a of accounts) tx.delete(adminDb.collection(OF).doc(a.uid));
      tx.delete(pRef);
    } else {
      tx.set(pRef, { accounts: left.accounts, primaryUid: left.primaryUid, updatedAt: Timestamp.now() }, { merge: true });
    }
    return true;
  });
}

/** Makes this account the main one: the invite code of the main account is the code the whole person shares. */
export async function setPrimary(uid: string): Promise<boolean> {
  return adminDb.runTransaction(async (tx): Promise<boolean> => {
    const link = await tx.get(adminDb.collection(OF).doc(uid));
    const pid = link.exists ? String(link.data()?.personId ?? '') : '';
    if (!pid) return false;
    const pRef = adminDb.collection(PERSONS).doc(pid);
    const ps = await tx.get(pRef);
    if (!readAccounts(ps.data()?.accounts).some((a) => a.uid === uid)) return false;
    tx.set(pRef, { primaryUid: uid, updatedAt: Timestamp.now() }, { merge: true });
    return true;
  });
}

export { primaryOf };
