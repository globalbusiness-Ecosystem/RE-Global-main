import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { computeRun, confirmationOk, parsePeriod, payoutIdFor, periodsOverlap, shareDays, splitByKyc, type LedgerEvent, type Row, type Run } from '@/lib/distribution';
import { totalSharesOf } from '@/lib/share-rules';

// Reads the share ledger of one property and works out a distribution. Nothing here moves money or creates a payout:
// a saved run is a draft the admin can look at and export. Paying it comes in a later, separate step.

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;
const ms = (v: unknown): number => ((v as { toDate?: () => Date })?.toDate ? (v as { toDate: () => Date }).toDate().getTime() : NaN);
const num = (v: unknown) => Number(v) || 0;

/** Purchases from the platform (+) and confirmed transfers between users (+/-) for one property. Cancelled or held-for-review ones never count. */
export async function loadLedger(propertyId: string): Promise<LedgerEvent[]> {
  const [h, t] = await Promise.all([
    adminDb.collection('share_holdings').where('propertyId', '==', propertyId).get(),
    adminDb.collection('share_transfers').where('propertyId', '==', propertyId).get(),
  ]);
  const out: LedgerEvent[] = [];
  for (const d of h.docs) {
    const x = d.data();
    if (x.status !== 'confirmed') continue;
    out.push({ uid: String(x.uid ?? ''), username: String(x.username ?? ''), at: ms(x.createdAt), delta: num(x.shares) });
  }
  for (const d of t.docs) {
    const x = d.data();
    if (x.status !== 'confirmed') continue;
    const at = ms(x.createdAt);
    out.push({ uid: String(x.fromUid ?? ''), username: String(x.fromName ?? ''), at, delta: -num(x.shares) });
    out.push({ uid: String(x.toUid ?? ''), username: String(x.buyerName ?? ''), at, delta: num(x.shares) });
  }
  return out;
}

/** Paying a run needs this switch on in Vercel (DISTRIBUTIONS_ENABLED=1). Off by default, so nothing here can create a payout. */
export const distributionsUnlocked = (): boolean => process.env.DISTRIBUTIONS_ENABLED === '1';

export type RunRequest = { propertyId: unknown; start: unknown; end: unknown; gross: unknown; feePct: unknown };
export type Computed = { ok: true; propertyId: string; propertyTitle: string; start: string; end: string; run: Run } | { ok: false; status: number; error: string };

export async function computeForProperty(q: RunRequest): Promise<Computed> {
  if (!okId(q.propertyId)) return { ok: false, status: 400, error: 'Invalid property' };
  const per = parsePeriod(q.start, q.end);
  if (!per.ok) return { ok: false, status: 400, error: per.error };
  const snap = await adminDb.collection('properties').doc(q.propertyId).get();
  if (!snap.exists) return { ok: false, status: 404, error: 'Property not found' };
  const totalShares = totalSharesOf(snap.data() as { type?: unknown; totalShares?: unknown });
  if (!totalShares) return { ok: false, status: 400, error: 'This property does not sell Shares' };
  const holders = shareDays(await loadLedger(q.propertyId), per.period);
  const r = computeRun({ gross: q.gross, feePct: q.feePct, totalShares, period: per.period, holders });
  if (!r.ok) return { ok: false, status: 400, error: r.error };
  return { ok: true, propertyId: q.propertyId, propertyTitle: String(snap.data()?.title ?? '').slice(0, 150), start: per.period.start, end: per.period.end, run: r.run };
}

/** Saves a draft run. Refused when another run for the same property (not cancelled) covers one of the same days. */
export async function saveDraft(q: RunRequest, note: string) {
  const c = await computeForProperty(q);
  if (!c.ok) return c;
  const others = await adminDb.collection('distributions').where('propertyId', '==', c.propertyId).get();
  const clash = others.docs.find((d) => d.data().status !== 'cancelled' && periodsOverlap({ start: String(d.data().start), end: String(d.data().end) }, c));
  if (clash) return { ok: false as const, status: 409, error: `Another run (${clash.data().start} to ${clash.data().end}) already covers some of these days` };
  const ref = adminDb.collection('distributions').doc();
  await ref.set({ propertyId: c.propertyId, propertyTitle: c.propertyTitle, start: c.start, end: c.end, ...c.run, note, status: 'draft', createdAt: Timestamp.now() });
  return { ok: true as const, id: ref.id, run: c.run };
}

export async function cancelDraft(id: string) {
  if (!okId(id)) return { ok: false as const, status: 400, error: 'Invalid run' };
  const ref = adminDb.collection('distributions').doc(id);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return { ok: false as const, status: 404, error: 'Run not found' };
    if (s.data()?.status !== 'draft') return { ok: false as const, status: 409, error: 'Only a draft can be cancelled' };
    tx.update(ref, { status: 'cancelled', cancelledAt: Timestamp.now() });
    return { ok: true as const };
  });
}

/**
 * Approves a draft: creates one pending payout (kind 'distribution', paid by hand like the others) for each holder whose identity is
 * verified, and keeps the rest as held. Locked unless DISTRIBUTIONS_ENABLED=1. The admin must type the net amount.
 * Safe to repeat: a run left half done ('approving') is finished by approving it again; a payout that exists is never touched.
 */
export async function approveRun(id: string, typed: unknown) {
  if (!distributionsUnlocked()) return { ok: false as const, status: 403, error: 'Paying distributions is locked (set DISTRIBUTIONS_ENABLED=1)' };
  if (!okId(id)) return { ok: false as const, status: 400, error: 'Invalid run' };
  const ref = adminDb.collection('distributions').doc(id);
  const claim = await adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return { ok: false as const, status: 404, error: 'Run not found' };
    const d = s.data() as Record<string, unknown>;
    if (d.status !== 'draft' && d.status !== 'approving') return { ok: false as const, status: 409, error: 'Only a draft can be approved' };
    if (!confirmationOk(typed, num(d.net))) return { ok: false as const, status: 400, error: `Type the net amount (${num(d.net)}) to confirm` };
    if (d.status === 'draft') tx.update(ref, { status: 'approving', approvingAt: Timestamp.now() });
    return { ok: true as const, d };
  });
  if (!claim.ok) return claim;
  const d = claim.d;
  const rows = (Array.isArray(d.rows) ? d.rows : []) as Row[];
  const kyc = await Promise.all(rows.map((r) => (okId(r.uid) ? adminDb.collection('kyc').doc(r.uid).get() : Promise.resolve(null))));
  const approved = new Set(rows.filter((r, i) => kyc[i]?.exists && kyc[i]?.data()?.status === 'approved').map((r) => r.uid));
  const { pay, held } = splitByKyc(rows, approved);
  for (let i = 0; i < pay.length; i += 100) {
    await Promise.all(pay.slice(i, i + 100).map(async (r) => {
      try {
        await adminDb.collection('payouts').doc(payoutIdFor(id, r.uid)).create({
          kind: 'distribution', uid: r.uid, username: r.username, amount: r.amount, status: 'pending',
          runId: id, propertyId: d.propertyId, propertyTitle: d.propertyTitle, period: `${d.start} to ${d.end}`, createdAt: Timestamp.now(),
        });
      } catch (e) {
        if ((e as { code?: number }).code !== 6) throw e; // 6 = already exists: a repeat, leave it alone
      }
    }));
  }
  const sum = (l: Row[]) => Math.round(l.reduce((a, r) => a + Math.round(r.amount * 1e4), 0)) / 1e4;
  await ref.update({ status: 'approved', approvedAt: Timestamp.now(), paidRows: pay.length, paidAmount: sum(pay), held: held.map((h) => ({ uid: h.uid, username: h.username, amount: h.amount, reason: h.reason })), heldAmount: sum(held) });
  return { ok: true as const, paid: pay.length, paidAmount: sum(pay), held: held.length, heldAmount: sum(held) };
}

const iso = (v: unknown) => ((v as { toDate?: () => Date })?.toDate ? (v as { toDate: () => Date }).toDate().toISOString() : null);

export async function listRuns() {
  const s = await adminDb.collection('distributions').get();
  return s.docs
    .map((d) => { const x = d.data(); return { id: d.id, propertyId: x.propertyId, propertyTitle: x.propertyTitle, start: x.start, end: x.end, gross: x.gross, net: x.net, allocated: x.allocated, unallocated: x.unallocated, status: x.status, note: x.note ?? '', holders: Array.isArray(x.rows) ? x.rows.length : 0, paidRows: x.paidRows ?? null, heldRows: Array.isArray(x.held) ? x.held.length : null, createdAt: iso(x.createdAt) }; })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 50);
}

export async function getRun(id: string) {
  if (!okId(id)) return null;
  const s = await adminDb.collection('distributions').doc(id).get();
  return s.exists ? { id: s.id, ...s.data(), createdAt: iso(s.data()?.createdAt) } : null;
}
