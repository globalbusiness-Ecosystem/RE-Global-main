import 'server-only';
import { randomInt } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { legacyInviteCode, randomInviteCode } from '@/lib/invite-code';
import { parseRefCode } from '@/lib/ref-code';
import { primaryOf } from '@/lib/person-link';
import { getPerson } from '@/lib/person-store';

export const CODES = 'inviteCodes';
const MAX_TRIES = 8;

/**
 * Gives an account its invite code, once, and guarantees that no other account has the same one (Pi and web share
 * one list). A code the account already has is kept when it is free. If someone else holds it (two Pi accounts could
 * end up with the same short code before this check existed) the later account gets a new unique code.
 */
export async function ensureInviteCode(uid: string, username: string): Promise<string> {
  if (!uid || !username || username.includes('/')) throw new Error('bad account');
  // Linked accounts share one invite code: the primary account's.
  const person = await getPerson(uid);
  const primary = person ? primaryOf(person.accounts, person.primaryUid) : null;
  if (primary && primary.uid !== uid) return ensureInviteCode(primary.uid, primary.username);
  const rRef = adminDb.collection('referrals').doc(username);
  const rand = () => randomInt(0, 1_000_000) / 1_000_000;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const done = await adminDb.runTransaction(async (tx): Promise<string | null> => {
      const r = await tx.get(rRef);
      const mine = parseRefCode(r.data()?.code) ?? (attempt === 0 ? legacyInviteCode(username) : null);
      const candidate = attempt === 0 && mine ? mine : randomInviteCode(rand);
      const cRef = adminDb.collection(CODES).doc(candidate);
      const [c, same] = await Promise.all([tx.get(cRef), tx.get(adminDb.collection('referrals').where('code', '==', candidate).limit(2))]);
      const heldByOther = (c.exists && c.data()?.username !== username) || same.docs.some((d) => d.id !== username);
      if (heldByOther) return null;
      const oldCode = parseRefCode(r.data()?.code);
      if (oldCode && oldCode !== candidate) tx.delete(adminDb.collection(CODES).doc(oldCode));
      tx.set(cRef, { username, uid, createdAt: c.exists ? c.data()?.createdAt ?? Timestamp.now() : Timestamp.now() });
      tx.set(rRef, { username, uid, code: candidate, ...(r.exists ? {} : { createdAt: Timestamp.now() }) }, { merge: true });
      return candidate;
    });
    if (done) return done;
  }
  throw new Error('no free invite code');
}
