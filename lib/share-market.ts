import 'server-only';
import { Timestamp, type Transaction } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { canCancelHolding, holdingTotals } from '@/lib/share-rules';
import {
  LISTING_RESERVE_MS, availableToList, feePctOf, marketTotals, decideBuy, decideSettle, feeSplit, listingTotal, ownedShares, parseListingInput,
} from '@/lib/market-rules';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;
const num = (v: unknown) => Number(v) || 0;
const sum = (docs: { data(): Record<string, unknown> }[], key: string, pred: (d: Record<string, unknown>) => boolean = () => true) =>
  docs.reduce((a, d) => { const x = d.data(); return pred(x) ? a + num(x[key]) : a; }, 0);

// Owned and already-listed shares of one user in one property (read inside a transaction).
async function readPosition(tx: Transaction, uid: string, propertyId: string) {
  const db = adminDb;
  const [h, tin, tout, lst] = await Promise.all([
    tx.get(db.collection('share_holdings').where('uid', '==', uid).where('propertyId', '==', propertyId)),
    tx.get(db.collection('share_transfers').where('toUid', '==', uid).where('propertyId', '==', propertyId)),
    tx.get(db.collection('share_transfers').where('fromUid', '==', uid).where('propertyId', '==', propertyId)),
    tx.get(db.collection('share_listings').where('sellerUid', '==', uid).where('propertyId', '==', propertyId)),
  ]);
  const confirmed = (d: Record<string, unknown>) => d.status === 'confirmed';
  const owned = ownedShares(sum(h.docs, 'shares', confirmed), sum(tin.docs, 'shares', confirmed), sum(tout.docs, 'shares', confirmed));
  const listed = sum(lst.docs, 'shares', (d) => d.status === 'open');
  return { owned, listed, available: availableToList(owned, listed) };
}

export async function createListing(a: { uid: string; username: string; propertyId: string; shares: unknown; pricePerShare: unknown }) {
  if (!okId(a.propertyId)) return { ok: false as const, status: 400, error: 'Invalid property' };
  const lockRef = adminDb.collection('share_locks').doc(`${a.uid}_${a.propertyId}`);
  const propRef = adminDb.collection('properties').doc(a.propertyId);
  return adminDb.runTransaction(async (tx) => {
    const [lock, prop, pos, set] = await Promise.all([tx.get(lockRef), tx.get(propRef), readPosition(tx, a.uid, a.propertyId), tx.get(adminDb.collection('settings').doc('market'))]);
    void lock;
    if (!prop.exists) return { ok: false as const, status: 404, error: 'Property not found' };
    const parsed = parseListingInput({ shares: a.shares, pricePerShare: a.pricePerShare }, pos.available);
    if (!parsed.ok) return { ok: false as const, status: 400, error: parsed.error };
    const ref = adminDb.collection('share_listings').doc();
    tx.set(lockRef, { updatedAt: Timestamp.now() });
    tx.set(ref, {
      sellerUid: a.uid, sellerName: a.username, propertyId: a.propertyId,
      propertyTitle: String(prop.data()?.title ?? '').slice(0, 150),
      shares: parsed.shares, pricePerShare: parsed.pricePerShare, feePct: feePctOf(set.exists ? set.data()?.resaleFeePct : undefined), status: 'open', createdAt: Timestamp.now(),
    });
    return { ok: true as const, id: ref.id };
  });
}

export async function cancelListing(uid: string, listingId: string) {
  if (!okId(listingId)) return { ok: false as const, status: 400, error: 'Invalid listing' };
  const ref = adminDb.collection('share_listings').doc(listingId);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists || s.data()?.sellerUid !== uid) return { ok: false as const, status: 404, error: 'Listing not found' };
    const d = s.data() as Record<string, unknown>;
    if (d.status !== 'open') return { ok: false as const, status: 409, error: 'Listing is not open' };
    if (d.reservedBy && num(d.reservedUntilMs) > Date.now()) return { ok: false as const, status: 409, error: 'A buyer is paying for this listing right now' };
    tx.update(ref, { status: 'cancelled', cancelledAt: Timestamp.now() });
    return { ok: true as const };
  });
}

// Payment about to be approved: check the listing and hold it for this buyer. Returns the exact amount to charge.
export async function reserveListing(listingId: unknown, buyerUid: string, paymentId: string) {
  if (!okId(listingId)) return { ok: false as const, status: 400, error: 'Invalid listing' };
  const ref = adminDb.collection('share_listings').doc(listingId);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return { ok: false as const, status: 404, error: 'Listing not found' };
    const d = s.data() as Record<string, unknown>;
    const v = decideBuy(d, buyerUid, Date.now());
    if (!v.ok) return { ok: false as const, status: 409, code: v.code, error: v.code };
    const total = listingTotal(num(d.shares), num(d.pricePerShare));
    if (total === null) return { ok: false as const, status: 500, error: 'Bad listing price' };
    tx.update(ref, { reservedBy: buyerUid, reservedPaymentId: paymentId, reservedUntilMs: Date.now() + LISTING_RESERVE_MS });
    return { ok: true as const, total };
  });
}

export async function releaseListing(listingId: unknown, paymentId: string) {
  if (!okId(listingId)) return;
  const ref = adminDb.collection('share_listings').doc(listingId);
  await adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (s.exists && s.data()?.reservedPaymentId === paymentId) {
      tx.update(ref, { reservedBy: null, reservedPaymentId: null, reservedUntilMs: null });
    }
  });
}

export async function listingAmount(listingId: unknown): Promise<number | null> {
  if (!okId(listingId)) return null;
  const s = await adminDb.collection('share_listings').doc(listingId).get();
  return s.exists ? listingTotal(num(s.data()?.shares), num(s.data()?.pricePerShare)) : null;
}

// Payment verified: move the shares to the buyer and record what the seller is owed. Idempotent per payment.
// If the listing is no longer available (cancelled or sold to someone else), the buyer is owed a refund instead.
export async function settleResale(a: { paymentId: string; buyerUid: string; buyerName: string; listingId: string; amount: number }) {
  const lRef = adminDb.collection('share_listings').doc(a.listingId);
  const tRef = adminDb.collection('share_transfers').doc(a.paymentId);
  const pRef = adminDb.collection('payouts').doc(a.paymentId);
  return adminDb.runTransaction(async (tx) => {
    const [l, t] = await Promise.all([tx.get(lRef), tx.get(tRef)]);
    if (t.exists) return { recorded: true as const, status: t.data()?.status as string };
    if (!l.exists) return { recorded: false as const };
    const d = l.data() as Record<string, unknown>;
    const verdict = decideSettle(d, a.paymentId);
    const common = { buyerUid: a.buyerUid, buyerName: a.buyerName, listingId: a.listingId, propertyId: d.propertyId, paymentId: a.paymentId, createdAt: Timestamp.now() };
    if (verdict === 'conflict') {
      tx.set(tRef, { ...common, fromUid: d.sellerUid, toUid: a.buyerUid, shares: num(d.shares), amount: a.amount, status: 'review' });
      tx.set(pRef, { kind: 'refund', uid: a.buyerUid, username: a.buyerName, amount: a.amount, status: 'pending', listingId: a.listingId, paymentId: a.paymentId, createdAt: Timestamp.now() });
      return { recorded: true as const, status: 'review' };
    }
    const { fee, proceeds } = feeSplit(a.amount, feePctOf(d.feePct));
    if (verdict === 'mark') {
      tx.update(lRef, { status: 'sold', soldTo: a.buyerName, soldAt: Timestamp.now(), soldPaymentId: a.paymentId, reservedBy: null, reservedUntilMs: null });
    }
    tx.set(tRef, { ...common, fromUid: d.sellerUid, fromName: d.sellerName, toUid: a.buyerUid, shares: num(d.shares), amount: a.amount, fee, proceeds, status: 'confirmed' });
    tx.set(pRef, { kind: 'proceeds', uid: d.sellerUid, username: d.sellerName, amount: proceeds, fee, gross: a.amount, status: 'pending', listingId: a.listingId, paymentId: a.paymentId, createdAt: Timestamp.now() });
    return { recorded: true as const, status: 'confirmed' };
  });
}

const iso = (v: unknown) => ((v as { toDate?: () => Date })?.toDate ? (v as { toDate: () => Date }).toDate().toISOString() : null);

// Public: open listings (no seller identity).
export async function listOpenListings(max = 200) {
  const s = await adminDb.collection('share_listings').where('status', '==', 'open').limit(max).get();
  return s.docs
    .map((d) => {
      const x = d.data();
      const total = listingTotal(num(x.shares), num(x.pricePerShare));
      return {
        id: d.id, propertyId: x.propertyId, propertyTitle: x.propertyTitle, shares: num(x.shares), pricePerShare: num(x.pricePerShare),
        total, reserved: !!x.reservedBy && num(x.reservedUntilMs) > Date.now(), createdAt: iso(x.createdAt),
      };
    })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

// The signed-in user's positions, listings and money owed to them.
export async function myMarket(uid: string) {
  const db = adminDb;
  const [h, tin, tout, lst, pay] = await Promise.all([
    db.collection('share_holdings').where('uid', '==', uid).get(),
    db.collection('share_transfers').where('toUid', '==', uid).get(),
    db.collection('share_transfers').where('fromUid', '==', uid).get(),
    db.collection('share_listings').where('sellerUid', '==', uid).get(),
    db.collection('payouts').where('uid', '==', uid).get(),
  ]);
  const confirmed = (d: Record<string, unknown>) => d.status === 'confirmed';
  const pos = new Map<string, { propertyId: string; title: string; bought: number; received: number; sold: number; listed: number }>();
  const get = (id: string, title: unknown) => {
    let p = pos.get(id);
    if (!p) { p = { propertyId: id, title: String(title ?? ''), bought: 0, received: 0, sold: 0, listed: 0 }; pos.set(id, p); }
    if (!p.title && title) p.title = String(title);
    return p;
  };
  h.docs.forEach((d) => { const x = d.data(); if (confirmed(x)) get(String(x.propertyId), x.propertyTitle).bought += num(x.shares); });
  tin.docs.forEach((d) => { const x = d.data(); if (confirmed(x)) get(String(x.propertyId), '').received += num(x.shares); });
  tout.docs.forEach((d) => { const x = d.data(); if (confirmed(x)) get(String(x.propertyId), '').sold += num(x.shares); });
  lst.docs.forEach((d) => { const x = d.data(); if (x.status === 'open') get(String(x.propertyId), x.propertyTitle).listed += num(x.shares); });
  const positions = [...pos.values()]
    .map((p) => { const owned = ownedShares(p.bought, p.received, p.sold); return { propertyId: p.propertyId, title: p.title, owned, listed: p.listed, available: availableToList(owned, p.listed) }; })
    .filter((p) => p.owned > 0 || p.listed > 0);
  const listings = lst.docs
    .map((d) => { const x = d.data(); return { id: d.id, propertyId: x.propertyId, propertyTitle: x.propertyTitle, shares: num(x.shares), pricePerShare: num(x.pricePerShare), status: x.status, createdAt: iso(x.createdAt) }; })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const payouts = pay.docs
    .map((d) => { const x = d.data(); return { id: d.id, kind: x.kind, amount: num(x.amount), status: x.status, createdAt: iso(x.createdAt) }; })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return { positions, listings, payouts };
}

// Admin: everything on the shares market in one view (recent first, capped).
export async function adminMarketOverview(max = 100) {
  const db = adminDb;
  const [ls, ts] = await Promise.all([
    db.collection('share_listings').get(),
    db.collection('share_transfers').get(),
  ]);
  const listings = ls.docs
    .map((d) => { const x = d.data(); return { id: d.id, propertyId: x.propertyId, propertyTitle: x.propertyTitle, sellerName: x.sellerName, shares: num(x.shares), pricePerShare: num(x.pricePerShare), feePct: x.feePct ?? null, status: x.status, reserved: !!x.reservedBy && num(x.reservedUntilMs) > Date.now(), soldTo: x.soldTo ?? null, createdAt: iso(x.createdAt) }; })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const transfers = ts.docs
    .map((d) => { const x = d.data(); return { id: d.id, propertyId: x.propertyId, fromName: x.fromName ?? null, buyerName: x.buyerName, shares: num(x.shares), amount: num(x.amount), fee: num(x.fee), status: x.status, createdAt: iso(x.createdAt) }; })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const totals = marketTotals(transfers, listings.filter((l) => l.status === 'open').length);
  return { totals, listings: listings.slice(0, max), transfers: transfers.slice(0, max) };
}

// Admin: take an open listing off the market (not while a buyer is paying for it).
export async function adminCancelListing(listingId: string) {
  if (!okId(listingId)) return { ok: false as const, status: 400, error: 'Invalid listing' };
  const ref = adminDb.collection('share_listings').doc(listingId);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return { ok: false as const, status: 404, error: 'Listing not found' };
    const d = s.data() as Record<string, unknown>;
    if (d.status !== 'open') return { ok: false as const, status: 409, error: 'Listing is not open' };
    if (d.reservedBy && num(d.reservedUntilMs) > Date.now()) return { ok: false as const, status: 409, error: 'A buyer is paying for this listing right now' };
    tx.update(ref, { status: 'cancelled', cancelledAt: Timestamp.now(), cancelledBy: 'admin' });
    return { ok: true as const, title: String(d.propertyTitle ?? ''), sellerName: String(d.sellerName ?? '') };
  });
}

// Admin: every purchase of shares from the platform, with totals.
export async function adminHoldings(max = 100) {
  const snap = await adminDb.collection('share_holdings').get();
  const rows = snap.docs
    .map((d) => { const x = d.data(); return { id: d.id, propertyId: x.propertyId, propertyTitle: x.propertyTitle, username: x.username, shares: num(x.shares), totalShares: num(x.totalShares), amount: num(x.amount), status: x.status, createdAt: iso(x.createdAt) }; })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return { totals: holdingTotals(rows), holdings: rows.slice(0, max) };
}

// Admin: cancel a share purchase and queue a refund. A confirmed purchase gives its shares back to the property;
// one held for review never took any. Refused when the buyer already resold or listed the shares.
export async function adminCancelHolding(paymentId: string) {
  if (!okId(paymentId)) return { ok: false as const, status: 400, error: 'Invalid purchase' };
  const hRef = adminDb.collection('share_holdings').doc(paymentId);
  const pRef = adminDb.collection('payouts').doc(`refund-${paymentId}`);
  return adminDb.runTransaction(async (tx) => {
    const h = await tx.get(hRef);
    if (!h.exists) return { ok: false as const, status: 404, error: 'Purchase not found' };
    const d = h.data() as Record<string, unknown>;
    const propertyId = String(d.propertyId ?? '');
    const shares = num(d.shares);
    const prop = okId(propertyId) ? await tx.get(adminDb.collection('properties').doc(propertyId)) : null;
    const pos = d.status === 'confirmed' && okId(propertyId) ? await readPosition(tx, String(d.uid), propertyId) : null;
    const verdict = canCancelHolding(d.status, shares, pos ? pos.available : 0);
    if (!verdict.ok) return { ok: false as const, status: 409, error: verdict.error };
    if (verdict.returnsShares && prop && prop.exists) {
      tx.update(prop.ref, { sharesSold: Math.max(0, num(prop.data()?.sharesSold) - shares) });
    }
    tx.update(hRef, { status: 'cancelled', cancelledAt: Timestamp.now(), cancelledBy: 'admin' });
    tx.set(pRef, { kind: 'refund', uid: d.uid, username: d.username, amount: num(d.amount), status: 'pending', paymentId, holdingId: paymentId, createdAt: Timestamp.now() });
    return { ok: true as const, title: String(d.propertyTitle ?? ''), username: String(d.username ?? ''), amount: num(d.amount), shares };
  });
}
