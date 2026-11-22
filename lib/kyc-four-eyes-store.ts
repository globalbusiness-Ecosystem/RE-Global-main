import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { cleanFourEyes, type Decision, type Proposal } from '@/lib/kyc-four-eyes';

// settings/kycFourEyes { enabled } and the recommendation kept on the identity record: kyc/<uid>.proposal
const okId = (id: string) => !!id && !id.includes('/') && id.length <= 140;

export async function getFourEyes(): Promise<{ enabled: boolean }> {
  try { return cleanFourEyes((await adminDb.collection('settings').doc('kycFourEyes').get()).data()); }
  catch { return { enabled: true }; } // when unreadable, keep the stricter rule
}
export async function setFourEyes(enabled: boolean): Promise<void> {
  await adminDb.collection('settings').doc('kycFourEyes').set({ enabled });
}

export async function getProposal(uid: string): Promise<Proposal | null> {
  if (!okId(uid)) return null;
  const p = (await adminDb.collection('kyc').doc(uid).get()).data()?.proposal;
  if (!p || (p.decision !== 'approved' && p.decision !== 'rejected')) return null;
  return { decision: p.decision, reason: String(p.reason ?? ''), by: String(p.by ?? ''), byName: String(p.byName ?? p.by ?? ''), at: p.at?.toDate ? p.at.toDate().toISOString() : null };
}

/** Keeps a recommendation on a pending request. A person's new recommendation replaces their old one. False when the request is not pending. */
export async function saveProposal(uid: string, p: { decision: Decision; reason: string; by: string; byName: string }): Promise<boolean> {
  if (!okId(uid)) return false;
  const ref = adminDb.collection('kyc').doc(uid);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists || s.data()?.status !== 'pending') return false;
    tx.update(ref, { proposal: { ...p, reason: p.reason.slice(0, 500), at: Timestamp.now() } });
    return true;
  });
}
export async function clearProposal(uid: string): Promise<void> {
  if (okId(uid)) await adminDb.collection('kyc').doc(uid).set({ proposal: FieldValue.delete() }, { merge: true }).catch(() => {});
}
