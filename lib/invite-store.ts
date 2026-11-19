import 'server-only';
import { randomInt } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { legacyInviteCode, piNameCode, randomInviteCode } from '@/lib/invite-code';
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
      const existing = parseRefCode(r.data()?.code);
      // Best first: a Pi account gets its own Pi name; then the code it already has; then the code it always had; then a random one.
      const order = [uid.startsWith('web_') ? null : piNameCode(username), existing, legacyInviteCode(username)].filter((c, i, a): c is string => !!c && a.indexOf(c) === i);
      const candidate = order[attempt] ?? randomInviteCode(rand);
      const cRef = adminDb.collection(CODES).doc(candidate);
      const [c, same] = await Promise.all([tx.get(cRef), tx.get(adminDb.collection('referrals').where('code', '==', candidate).limit(2))]);
      const heldByOther = (c.exists && c.data()?.username !== username) || same.docs.some((d) => d.id !== username);
      if (heldByOther) return null;
      // The code it had before keeps working as an alias, so links already shared are not broken.
      if (existing && existing !== candidate) {
        const oldRef = adminDb.collection(CODES).doc(existing);
        const old = await tx.get(oldRef);
        if (!old.exists || old.data()?.username === username) tx.set(oldRef, { username, uid, alias: true, createdAt: old.data()?.createdAt ?? Timestamp.now() });
      }
      tx.set(cRef, { username, uid, createdAt: c.exists ? c.data()?.createdAt ?? Timestamp.now() : Timestamp.now() });
      tx.set(rRef, { username, uid, code: candidate, ...(r.exists ? {} : { createdAt: Timestamp.now() }) }, { merge: true });
      return candidate;
    });
    if (done) return done;
  }
  throw new Error('no free invite code');
}
