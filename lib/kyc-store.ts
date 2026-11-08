import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { requiredKinds } from './kyc-files';
import { canMoveKyc, type KycRequestInput, type KycStatus } from './kyc-rules';

const okId = (id: string) => !!id && !id.includes('/') && id.length <= 140;
const col = () => adminDb.collection('kyc');

export interface KycRecord { status: KycStatus; rejectReason?: string }

export async function getKyc(uid: string): Promise<KycRecord> {
  if (!okId(uid)) return { status: 'none' };
  const s = await col().doc(uid).get();
  if (!s.exists) return { status: 'none' };
  const d = s.data() as { status?: string; rejectReason?: string };
  const status: KycStatus = d.status === 'pending' || d.status === 'approved' || d.status === 'rejected' ? d.status : 'none';
  return { status, rejectReason: status === 'rejected' ? d.rejectReason : undefined };
}

/** Saves a verification request; returns false when the current status does not allow a new one (already pending or approved). */
export async function submitKyc(uid: string, input: KycRequestInput, lang = 'en'): Promise<boolean> {
  const ref = col().doc(uid);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    const cur = (s.exists ? s.data()?.status : 'none') as KycStatus;
    if (!canMoveKyc(cur === 'pending' || cur === 'approved' || cur === 'rejected' ? cur : 'none', 'pending')) return false;
    tx.set(ref, { uid, status: 'pending', legalName: input.legalName, country: input.country, phone: input.phone, docType: input.docType, files: requiredKinds(input.docType), lang, submittedAt: Timestamp.now(), rejectReason: null });
    return true;
  });
}

/** Admin decision. Returns 404 when there is no request, 409 when the move is not allowed. */
export async function decideKyc(uid: string, to: 'approved' | 'rejected', reason: string): Promise<200 | 404 | 409> {
  if (!okId(uid)) return 404;
  const ref = col().doc(uid);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return 404 as const;
    const cur = s.data()?.status as KycStatus;
    if (!canMoveKyc(cur, to)) return 409 as const;
    tx.update(ref, { status: to, decidedAt: Timestamp.now(), rejectReason: to === 'rejected' ? reason : null });
    return 200 as const;
  });
}

export async function listKyc(status?: KycStatus): Promise<Record<string, unknown>[]> {
  const q = status ? col().where('status', '==', status) : col();
  const snap = await q.limit(200).get();
  const iso = (v: any) => (v?.toDate ? v.toDate().toISOString() : null);
  return snap.docs
    .map((d) => { const x = d.data(); return { uid: d.id, status: x.status, legalName: x.legalName ?? '', country: x.country ?? '', phone: x.phone ?? '', docType: x.docType ?? '', files: Array.isArray(x.files) ? x.files.filter((f: unknown) => typeof f === 'string') : [], submittedAt: iso(x.submittedAt), decidedAt: iso(x.decidedAt), rejectReason: x.rejectReason ?? '' }; })
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
}
