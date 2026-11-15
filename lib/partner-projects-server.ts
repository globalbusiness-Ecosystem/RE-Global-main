import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getPartner } from '@/lib/partners-server';
import { MAX_PROJECTS, installmentSchedule, isPartnerImage, lowestMonthly, statusAfterSave, type InstallmentPlan, type ProjectInput, type ProjectStatus } from '@/lib/partner-projects';

type Doc = Record<string, any>;
const COLLECTION = 'partnerProjects';
const ms = (v: any): number => (v?.toMillis ? v.toMillis() : 0);
const iso = (v: any): string | null => (ms(v) ? new Date(ms(v)).toISOString() : null);
const storageBase = () => (process.env.SUPABASE_URL || '').trim();

// What a project looks like to its owner and to the admin (everything but the account id).
export function projectView(id: string, d: Doc) {
  const price = Number(d.price) || 0;
  const plans: InstallmentPlan[] = Array.isArray(d.installments) ? d.installments : [];
  return {
    id, owner: String(d.owner ?? ''), company: String(d.company ?? ''), role: d.role, title: d.title, description: d.description, kind: d.kind, country: d.country, city: d.city,
    price, currency: d.currency, images: Array.isArray(d.images) ? d.images : [], contact: d.contact ?? '', installments: plans,
    plansView: plans.map((p) => ({ ...p, ...installmentSchedule(price, p) })), lowestMonthly: lowestMonthly(price, plans),
    status: d.status as ProjectStatus, note: typeof d.note === 'string' ? d.note : '',
    createdAt: iso(d.createdAt), updatedAt: iso(d.updatedAt), submittedAt: iso(d.submittedAt), reviewedAt: iso(d.reviewedAt), approvedAt: iso(d.approvedAt),
  };
}

export async function listMyProjects(username: string) {
  const s = await adminDb.collection(COLLECTION).where('owner', '==', username).limit(MAX_PROJECTS + 5).get();
  return s.docs.map((d: any) => projectView(d.id, d.data())).sort((a: any, b: any) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export type SaveResult = { ok: true; id: string; status: ProjectStatus } | { ok: false; status: number; error: 'not_partner' | 'limit' | 'not_found' | 'locked' | 'no_images' | 'bad_images' };

/** Creates (no id) or updates (id) a project of an approved partner. Needs a photo before it can be sent for review. */
export async function saveProject(uid: string, username: string, input: ProjectInput, opts: { id?: string; submit: boolean }): Promise<SaveResult> {
  const partner = await getPartner(username);
  if (!partner || partner.status !== 'approved') return { ok: false, status: 403, error: 'not_partner' };
  if (!input.images.every((u) => isPartnerImage(u, storageBase()))) return { ok: false, status: 400, error: 'bad_images' };
  if (opts.submit && input.images.length === 0) return { ok: false, status: 400, error: 'no_images' };
  const now = Timestamp.now();
  const fields = { ...input, owner: username, uid, company: partner.company, role: partner.role, updatedAt: now };
  if (!opts.id) {
    const count = (await adminDb.collection(COLLECTION).where('owner', '==', username).limit(MAX_PROJECTS + 1).get()).size;
    if (count >= MAX_PROJECTS) return { ok: false, status: 409, error: 'limit' };
    const status: ProjectStatus = opts.submit ? 'pending' : 'draft';
    const ref = await adminDb.collection(COLLECTION).add({ ...fields, status, note: '', createdAt: now, ...(opts.submit ? { submittedAt: now } : {}) });
    return { ok: true, id: ref.id, status };
  }
  const ref = adminDb.collection(COLLECTION).doc(opts.id);
  return adminDb.runTransaction(async (tx: any): Promise<SaveResult> => {
    const snap = await tx.get(ref);
    const cur = snap.exists ? (snap.data() as Doc) : null;
    if (!cur || cur.owner !== username) return { ok: false, status: 404, error: 'not_found' };
    const status = statusAfterSave(cur.status, opts.submit);
    if (!status) return { ok: false, status: 409, error: 'locked' };
    tx.update(ref, { ...fields, status, ...(status === 'pending' && cur.status !== 'pending' ? { submittedAt: now, note: '' } : {}) });
    return { ok: true, id: opts.id!, status };
  });
}

export async function deleteProject(username: string, id: string): Promise<boolean> {
  const ref = adminDb.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists || (snap.data() as Doc).owner !== username) return false;
  await ref.delete();
  return true;
}

// The public showcase: approved projects of partners who are still approved. Contact details are only what the partner chose to show.
export function publicProject(id: string, d: Doc, full: boolean) {
  const v = projectView(id, d);
  return {
    id: v.id, company: v.company, role: v.role, title: v.title, description: full ? v.description : String(v.description).slice(0, 180), kind: v.kind, country: v.country, city: v.city,
    price: v.price, currency: v.currency, images: full ? v.images : v.images.slice(0, 1), lowestMonthly: v.lowestMonthly, hasInstallments: v.installments.length > 0,
    ...(full ? { contact: v.contact, plansView: v.plansView } : {}), approvedAt: v.approvedAt,
  };
}

export async function showcase(opts: { id?: string } = {}) {
  const partners = await adminDb.collection('partners').where('status', '==', 'approved').limit(300).get();
  const active = new Set(partners.docs.map((d: any) => d.id));
  if (opts.id) {
    const s = await adminDb.collection(COLLECTION).doc(opts.id).get();
    const d = s.exists ? (s.data() as Doc) : null;
    return d && d.status === 'approved' && active.has(d.owner) ? publicProject(s.id, d, true) : null;
  }
  const s = await adminDb.collection(COLLECTION).where('status', '==', 'approved').limit(300).get();
  return s.docs.filter((d: any) => active.has((d.data() as Doc).owner)).map((d: any) => publicProject(d.id, d.data(), false))
    .sort((a: any, b: any) => String(b.approvedAt).localeCompare(String(a.approvedAt)));
}
