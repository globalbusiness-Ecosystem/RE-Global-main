import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { REFERRAL_CAP, countPurchases, countStays, normalizeReferralCode, type ReferralError } from '@/lib/rewards';

const LIMIT = 1000;

const rows = async (col: string, field: string, value: string, limit = LIMIT) => {
  const s = await adminDb.collection(col).where(field, '==', value).limit(limit).get();
  return s.docs.map((d: { data(): unknown }) => d.data() as Record<string, unknown>);
};

// Has this person already booked or bought something? Referral codes are for new customers only.
async function hasActivity(uid: string, username: string): Promise<boolean> {
  const [b, c] = await Promise.all([rows('bookings', 'uid', uid, 20), rows('contracts', 'buyerUsername', username, 20)]);
  return b.some((x) => x.status === 'confirmed') || c.some((x) => x.status === 'completed');
}

export type RedeemResult = { ok: true } | { ok: false; status: number; error: ReferralError };

// A new customer enters a friend's code once. The server checks everything: the code exists, it is not their
// own, they have not used one, they have no bookings or purchases yet, and the friend did not use their code.
export async function redeemReferral(uid: string, username: string, rawCode: unknown): Promise<RedeemResult> {
  const code = normalizeReferralCode(rawCode);
  if (!code) return { ok: false, status: 400, error: 'invalid' };
  const found = await adminDb.collection('referrals').where('code', '==', code).limit(2).get();
  if (found.docs.length === 0) return { ok: false, status: 404, error: 'notFound' };
  const owner = found.docs[0];
  const ownerName = String((owner.data() as Record<string, unknown>).username ?? owner.id);
  if (ownerName === username) return { ok: false, status: 400, error: 'own' };
  if ((owner.data() as Record<string, unknown>).referredBy === username) return { ok: false, status: 400, error: 'mutual' };
  if (await hasActivity(uid, username)) return { ok: false, status: 409, error: 'notNew' };

  const ref = adminDb.collection('referrals').doc(username);
  try {
    await adminDb.runTransaction(async (tx: any) => {
      const snap = await tx.get(ref);
      if (snap.exists && (snap.data() as Record<string, unknown>).referredBy) throw new Error('already');
      tx.set(ref, { username, uid, referredBy: ownerName, referredAt: Timestamp.now() }, { merge: true });
    });
  } catch (err) {
    if ((err as Error).message === 'already') return { ok: false, status: 409, error: 'already' };
    throw err;
  }
  return { ok: true };
}

// Friends this member invited: how many, and how many of them completed a stay or a purchase.
export async function referralStats(username: string, nowMs = Date.now()): Promise<{ invited: number; qualified: number; referredBy: boolean }> {
  const today = new Date(nowMs).toISOString().slice(0, 10);
  const [invitedDocs, own] = await Promise.all([
    rows('referrals', 'referredBy', username, 200),
    adminDb.collection('referrals').doc(username).get(),
  ]);
  const referredBy = own.exists && !!(own.data() as Record<string, unknown>)?.referredBy;
  const checked = invitedDocs.filter((d) => d.username !== username).slice(0, REFERRAL_CAP);
  const flags = await Promise.all(checked.map(async (d) => {
    const [b, c] = await Promise.all([
      typeof d.uid === 'string' && d.uid ? rows('bookings', 'uid', d.uid, 50) : Promise.resolve([]),
      typeof d.username === 'string' && d.username ? rows('contracts', 'buyerUsername', d.username, 50) : Promise.resolve([]),
    ]);
    return countStays(b, today) > 0 || countPurchases(c) > 0;
  }));
  return { invited: invitedDocs.length, qualified: flags.filter(Boolean).length, referredBy };
}
