import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { referralCodeOf } from '@/lib/contract-identity';
import { referralStats } from '@/lib/referrals-server';
import {
  commissionAmount, isCommissionable, readProgramRules, type Application, type CommissionStatus, type PartnerStatus, type ProgramRules,
} from '@/lib/partners';

const LIMIT = 300;
type Doc = Record<string, any>;

export async function getProgramRules(): Promise<ProgramRules> {
  try {
    const snap = await adminDb.collection('settings').doc('partnerProgram').get();
    return snap.exists ? readProgramRules(snap.data()) : readProgramRules(null);
  } catch {
    return readProgramRules(null);
  }
}

const ms = (v: any): number => (v?.toMillis ? v.toMillis() : v instanceof Date ? v.getTime() : typeof v === 'string' ? Date.parse(v) || 0 : 0);
const iso = (v: any): string | null => (ms(v) ? new Date(ms(v)).toISOString() : null);

// What the partner (and the admin) see of a partner document: plain values only.
export function publicProfile(d: Doc) {
  return {
    username: String(d.username ?? ''), role: d.role, company: d.company, country: d.country, phone: d.phone, about: d.about,
    website: d.website ?? '', listed: d.listed === true, status: d.status as PartnerStatus, note: typeof d.note === 'string' ? d.note : '',
    createdAt: iso(d.createdAt), reviewedAt: iso(d.reviewedAt), approvedAt: iso(d.approvedAt),
  };
}

export async function getPartner(username: string): Promise<Doc | null> {
  const s = await adminDb.collection('partners').doc(username).get();
  return s.exists ? (s.data() as Doc) : null;
}

export type ApplyResult = { ok: true } | { ok: false; status: number; error: 'exists' };

// One application per account. A rejected one can be sent again; a pending, approved or suspended one cannot.
export async function applyPartner(uid: string, username: string, a: Application): Promise<ApplyResult> {
  const ref = adminDb.collection('partners').doc(username);
  try {
    await adminDb.runTransaction(async (tx: any) => {
      const snap = await tx.get(ref);
      if (snap.exists && (snap.data() as Doc).status !== 'rejected') throw new Error('exists');
      tx.set(ref, { ...a, username, uid, status: 'pending', note: '', createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    });
  } catch (err) {
    if ((err as Error).message === 'exists') return { ok: false, status: 409, error: 'exists' };
    throw err;
  }
  return { ok: true };
}

// Every partner has a personal invite code. It is the same one the account always had, written into the referral record.
export async function ensureInviteCode(username: string, uid: string): Promise<string> {
  const ref = adminDb.collection('referrals').doc(username);
  const snap = await ref.get();
  const existing = snap.exists ? (snap.data() as Doc).code : null;
  if (typeof existing === 'string' && existing) return existing;
  const code = referralCodeOf(username);
  await ref.set({ username, uid, code, createdAt: Timestamp.now() }, { merge: true });
  return code;
}

// Turns the completed purchases of the customers a partner brought in into commission lines. Each contract is counted once
// (the line has the contract's own id), only purchases made after the partner was approved count, and the percentage is
// the one in force when the line is first written.
export async function syncCommissions(username: string, p: Doc, nowMs = Date.now()): Promise<number> {
  const rules = await getProgramRules();
  const pct = rules.rates[p.role as keyof ProgramRules['rates']] ?? 0;
  const since = ms(p.approvedAt);
  if (!rules.enabled || p.status !== 'approved' || pct <= 0 || !since) return 0;
  const invited = await adminDb.collection('referrals').where('referredBy', '==', username).limit(200).get();
  const referees = invited.docs.map((d: any) => String((d.data() as Doc).username ?? '')).filter((u: string) => u && u !== username);
  let created = 0;
  for (let i = 0; i < referees.length; i += 10) {
    await Promise.all(referees.slice(i, i + 10).map(async (referee: string) => {
      const cs = await adminDb.collection('contracts').where('buyerUsername', '==', referee).limit(50).get();
      for (const c of cs.docs) {
        const d = c.data() as Doc;
        if (!isCommissionable(d) || ms(d.createdAt) < since) continue;
        try {
          await adminDb.collection('partnerCommissions').doc(c.id).create({
            partner: username, role: p.role, contractId: String(d.contractId ?? c.id), referee, base: d.amount, currency: String(d.currency ?? ''),
            rate: pct, amount: commissionAmount(d.amount, pct), status: 'accrued', createdAt: Timestamp.fromMillis(nowMs),
          });
          created++;
        } catch { /* already written */ }
      }
    }));
  }
  return created;
}

export function commissionRow(id: string, d: Doc) {
  return {
    id, partner: String(d.partner ?? ''), role: d.role, contractId: String(d.contractId ?? ''), base: d.base, currency: String(d.currency ?? ''),
    rate: d.rate, amount: d.amount, status: d.status as CommissionStatus, createdAt: iso(d.createdAt), paidAt: iso(d.paidAt), note: typeof d.note === 'string' ? d.note : '',
  };
}

// Totals per currency (so Pi and cash are never added together), plus the latest lines.
export function summarize(rows: ReturnType<typeof commissionRow>[]) {
  const totals: Record<string, { accrued: number; paid: number }> = {};
  for (const r of rows) {
    if (r.status === 'void') continue;
    const t = (totals[r.currency] ??= { accrued: 0, paid: 0 });
    t[r.status === 'paid' ? 'paid' : 'accrued'] = Math.round((t[r.status === 'paid' ? 'paid' : 'accrued'] + r.amount) * 100) / 100;
  }
  return Object.entries(totals).map(([currency, v]) => ({ currency, ...v }));
}

export async function myPartnerView(uid: string, username: string) {
  const [rules, profileDoc] = await Promise.all([getProgramRules(), getPartner(username)]);
  const profile = profileDoc ? publicProfile(profileDoc) : null;
  const publicRates = { enabled: rules.enabled, rates: rules.rates };
  if (!profileDoc || profileDoc.status !== 'approved') return { profile, program: publicRates, invite: null, commissions: null };
  await syncCommissions(username, profileDoc);
  const [code, stats, cs] = await Promise.all([
    ensureInviteCode(username, uid), referralStats(username),
    adminDb.collection('partnerCommissions').where('partner', '==', username).limit(LIMIT).get(),
  ]);
  const rows = cs.docs.map((d: any) => commissionRow(d.id, d.data())).sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return {
    profile, program: publicRates,
    invite: { code, invited: stats.invited, qualified: stats.qualified },
    commissions: { totals: summarize(rows), recent: rows.slice(0, 20) },
  };
}

// Approved partners who agreed to be listed. Never the account name, only what they wrote for the public.
export async function partnerDirectory() {
  const s = await adminDb.collection('partners').where('status', '==', 'approved').limit(LIMIT).get();
  return s.docs.map((d: any) => d.data() as Doc).filter((d: Doc) => d.listed === true)
    .map((d: Doc) => ({ role: d.role, company: d.company, country: d.country, about: String(d.about ?? '').slice(0, 300), website: d.website ?? '' }));
}
