import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getKyc } from '@/lib/kyc-store';
import { accountKind } from '@/lib/person-link';
import { personAccounts } from '@/lib/person-store';
import type { LinkedVerification } from '@/lib/verification-level';

const COL = 'piVerified';          // piVerified/{uid} -> { username, firstAt, lastSeenAt }
const REFRESH_MS = 12 * 60 * 60 * 1000;

/**
 * Remembers that this Pi account signed in through Pi (the server checked the token with Pi itself).
 * Written at most every 12 hours per account. Only call it for an account the server has just authenticated.
 */
export async function markPiVerified(uid: string, username: string): Promise<void> {
  if (accountKind(uid) !== 'pi' || !uid || uid.includes('/')) return;
  try {
    const ref = adminDb.collection(COL).doc(uid);
    const s = await ref.get();
    const last = s.data()?.lastSeenAt?.toMillis?.() ?? 0;
    if (s.exists && Date.now() - last < REFRESH_MS) return;
    await ref.set({ username, lastSeenAt: Timestamp.now(), ...(s.exists ? {} : { firstAt: Timestamp.now() }) }, { merge: true });
  } catch { /* remembering is a convenience, never block the request */ }
}

/** What the accounts linked to this person prove together. */
export async function personVerification(uid: string, username: string): Promise<LinkedVerification> {
  const accounts = await personAccounts(uid, username);
  const results = await Promise.all(accounts.map(async (a) => {
    try {
      if (accountKind(a.uid) === 'pi') return { pi: (await adminDb.collection(COL).doc(a.uid).get()).exists, kyc: false };
      return { pi: false, kyc: (await getKyc(a.uid)).status === 'approved' };
    } catch {
      return { pi: false, kyc: false };
    }
  }));
  return { pi: results.some((r) => r.pi), kyc: results.some((r) => r.kyc) };
}
