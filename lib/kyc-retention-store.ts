import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { logAdmin } from '@/lib/admin-audit';
import { deleteKycFiles } from '@/lib/kyc-files-store';
import { cleanRetention, cutoffMs, isDue, DEFAULT_RETENTION, type RetentionPolicy } from '@/lib/kyc-retention';

// settings/kycRetention { years, autoDelete }, written by the admin route only.
const col = () => adminDb.collection('kyc');
const okId = (id: string) => !!id && !id.includes('/') && id.length <= 140;
const ms = (v: any): number | null => (v?.toMillis ? v.toMillis() : null);

export async function getRetention(): Promise<RetentionPolicy> {
  try {
    const d = (await adminDb.collection('settings').doc('kycRetention').get()).data();
    return d ? cleanRetention(d) : DEFAULT_RETENTION;
  } catch {
    return DEFAULT_RETENTION;
  }
}
export async function setRetention(p: RetentionPolicy): Promise<void> {
  await adminDb.collection('settings').doc('kycRetention').set(cleanRetention(p));
}

/** Ids of identity records whose data is past the retention period (and not on legal hold). */
export async function dueUids(policy: RetentionPolicy, now: Date = new Date()): Promise<string[]> {
  const cutoff = cutoffMs(now, policy.years);
  const snap = await col().limit(500).get();
  return snap.docs
    .filter((d) => { const x = d.data(); return isDue({ status: x.status, decidedAtMs: ms(x.decidedAt), submittedAtMs: ms(x.submittedAt), hold: x.hold === true, purgedAt: x.purgedAt }, cutoff); })
    .map((d) => d.id);
}

/** Deletes one person's identity data: photos and every personal field. The record stays as an empty stub (status "none", purge date) so the person can verify again. Refuses a legal hold. */
export async function purgeKyc(uid: string, by: string): Promise<'purged' | 'hold' | 'missing'> {
  if (!okId(uid)) return 'missing';
  const ref = col().doc(uid);
  const s = await ref.get();
  if (!s.exists) return 'missing';
  if (s.data()?.hold === true) return 'hold';
  await deleteKycFiles(uid).catch(() => {});
  const gone = FieldValue.delete();
  await ref.update({
    status: 'none', legalName: gone, country: gone, phone: gone, docType: gone, idNumber: gone, idHash: gone, dupOf: gone, files: gone, screen: gone, review: gone,
    contractName: gone, rejectReason: gone, decidedAt: gone, submittedAt: gone, consent: gone, purgedAt: Timestamp.now(),
  });
  await logAdmin('kyc.purge', { uid, by });
  return 'purged';
}

/** Legal hold: while on, the person's data is never deleted (by the daily job or by hand). */
export async function setHold(uid: string, hold: boolean): Promise<boolean> {
  if (!okId(uid)) return false;
  const ref = col().doc(uid);
  if (!(await ref.get()).exists) return false;
  await ref.update({ hold });
  await logAdmin('kyc.hold', { uid, hold });
  return true;
}

/** Deletes every due record. The daily job calls it only when the team turned automatic deletion on. */
export async function runKycRetention(by: string, now: Date = new Date()): Promise<{ due: number; purged: number }> {
  const due = await dueUids(await getRetention(), now);
  let purged = 0;
  for (const uid of due) if ((await purgeKyc(uid, by).catch(() => 'missing')) === 'purged') purged++;
  return { due: due.length, purged };
}
