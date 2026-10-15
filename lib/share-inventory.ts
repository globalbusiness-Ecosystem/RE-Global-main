import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { SHARE_HOLD_MS, decideShares, liveHolds, totalSharesOf, type ShareHold } from '@/lib/share-rules';

const okId = (id: string) => !!id && !id.includes('/') && id.length <= 128;
const holdsRef = (id: string) => adminDb.collection('share_holds').doc(id);
const readHolds = (d: { exists: boolean; data(): unknown }): ShareHold[] => {
  const h = d.exists ? (d.data() as { holds?: ShareHold[] }).holds : [];
  return Array.isArray(h) ? h : [];
};

// Payment about to be approved: hold the shares for 15 minutes. Throws when Firestore is unreachable (fail closed).
export async function holdShares(a: { propertyId: string; uid: string; paymentId: string; count: number }) {
  if (!okId(a.propertyId)) return { ok: false as const, available: 0 };
  const pRef = adminDb.collection('properties').doc(a.propertyId);
  const hRef = holdsRef(a.propertyId);
  return adminDb.runTransaction(async (tx) => {
    const [p, h] = await Promise.all([tx.get(pRef), tx.get(hRef)]);
    const total = p.exists ? totalSharesOf(p.data() as { type?: unknown; totalShares?: unknown }) : null;
    if (!total) return { ok: false as const, available: 0 };
    const now = Date.now();
    const v = decideShares({ totalShares: total, sold: Number(p.data()?.sharesSold) || 0, holds: readHolds(h) }, a, now);
    if (!v.ok) return v;
    tx.set(hRef, { holds: [...v.holds, { paymentId: a.paymentId, uid: a.uid, count: a.count, expiresAtMs: now + SHARE_HOLD_MS }], updatedAt: Timestamp.now() });
    return { ok: true as const, available: v.available };
  });
}

// Payment cancelled: free the held shares.
export async function releaseShares(propertyId: string, paymentId: string) {
  if (!okId(propertyId)) return;
  const hRef = holdsRef(propertyId);
  await adminDb.runTransaction(async (tx) => {
    const holds = readHolds(await tx.get(hRef));
    const next = liveHolds(holds, Date.now()).filter((h) => h.paymentId !== paymentId);
    if (next.length !== holds.length) tx.set(hRef, { holds: next, updatedAt: Timestamp.now() });
  });
}

// Contract signed: count the shares as sold and record the holding. Idempotent per payment.
// If the hold had expired and the shares ran out meanwhile, the holding is kept as 'review' (manual refund).
export async function confirmShares(a: {
  propertyId: string; uid: string; username: string; paymentId: string; contractId: string;
  propertyTitle: string; propertyType: string; count: number; totalShares: number; amount: number;
}) {
  if (!okId(a.propertyId)) return { recorded: false as const };
  const pRef = adminDb.collection('properties').doc(a.propertyId);
  const hRef = holdsRef(a.propertyId);
  const oRef = adminDb.collection('share_holdings').doc(a.paymentId);
  return adminDb.runTransaction(async (tx) => {
    const [p, h, o] = await Promise.all([tx.get(pRef), tx.get(hRef), tx.get(oRef)]);
    if (o.exists) return { recorded: true as const, status: o.data()?.status as string };
    if (!p.exists) return { recorded: false as const };
    const sold = Number(p.data()?.sharesSold) || 0;
    const total = totalSharesOf(p.data() as { type?: unknown; totalShares?: unknown }) ?? a.totalShares;
    const v = decideShares({ totalShares: total, sold, holds: readHolds(h) }, a, Date.now());
    const status = v.ok ? 'confirmed' : 'review';
    if (v.ok) tx.update(pRef, { sharesSold: sold + a.count });
    const rest = readHolds(h).filter((x) => x.paymentId !== a.paymentId);
    if (rest.length !== readHolds(h).length) tx.set(hRef, { holds: liveHolds(rest, Date.now()), updatedAt: Timestamp.now() });
    tx.set(oRef, {
      uid: a.uid, username: a.username, propertyId: a.propertyId, propertyTitle: a.propertyTitle, propertyType: a.propertyType,
      shares: a.count, totalShares: a.totalShares, amount: a.amount, currency: 'Pi',
      paymentId: a.paymentId, contractId: a.contractId, status, createdAt: Timestamp.now(),
    });
    return { recorded: true as const, status };
  });
}
