import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { RESERVE_MS, decideReservation, decideSale, isExclusiveType } from '@/lib/property-lifecycle';

const okId = (id: string) => !!id && !id.includes('/') && id.length <= 128;

// Called when a payment is about to be approved. Holds the property for this buyer for 15 minutes.
// Demo listings (not in Firestore) and non-exclusive types pass straight through.
// Throws when Firestore cannot be reached, so the caller fails closed.
export async function reserveForPayment(propertyId: string, uid: string, username: string, paymentId: string) {
  if (!okId(propertyId)) return { ok: true as const };
  const propRef = adminDb.collection('properties').doc(propertyId);
  const resRef = adminDb.collection('property_reservations').doc(propertyId);
  return adminDb.runTransaction(async (tx) => {
    const [p, r] = await Promise.all([tx.get(propRef), tx.get(resRef)]);
    if (!p.exists) return { ok: true as const };
    const rd = r.exists ? (r.data() as { uid?: string; expiresAt?: Timestamp }) : null;
    const verdict = decideReservation(
      p.data() as { type?: unknown; status?: unknown },
      rd?.uid && rd.expiresAt ? { uid: rd.uid, expiresAtMs: rd.expiresAt.toMillis() } : null,
      uid,
      Date.now()
    );
    if (!verdict.ok) return verdict;
    if (isExclusiveType(p.data()?.type)) {
      tx.set(resRef, { uid, username, paymentId, expiresAt: Timestamp.fromMillis(Date.now() + RESERVE_MS), createdAt: Timestamp.now() });
    }
    return { ok: true as const };
  });
}

// Payment cancelled: free the property if this buyer was holding it.
export async function releaseReservation(propertyId: string, uid: string) {
  if (!okId(propertyId)) return;
  const resRef = adminDb.collection('property_reservations').doc(propertyId);
  await adminDb.runTransaction(async (tx) => {
    const r = await tx.get(resRef);
    if (r.exists && r.data()?.uid === uid) tx.delete(resRef);
  });
}

// After the contract is signed: mark the property sold and record who owns it. Idempotent per payment.
export async function finalizeSale(a: {
  propertyId: string; uid: string; username: string; paymentId: string;
  contractId: string; propertyTitle: string; amount: number; currency: string;
}) {
  if (!okId(a.propertyId)) return { recorded: false as const };
  const propRef = adminDb.collection('properties').doc(a.propertyId);
  const resRef = adminDb.collection('property_reservations').doc(a.propertyId);
  const ownRef = adminDb.collection('ownerships').doc(a.paymentId);
  return adminDb.runTransaction(async (tx) => {
    const [p, o, r] = await Promise.all([tx.get(propRef), tx.get(ownRef), tx.get(resRef)]);
    if (!p.exists || !isExclusiveType(p.data()?.type)) return { recorded: false as const };
    if (o.exists) return { recorded: true as const, status: o.data()?.status as string };
    const verdict = decideSale(p.data() as { status?: unknown; soldPaymentId?: unknown }, a.paymentId);
    const status = verdict === 'conflict' ? 'review' : 'confirmed';
    if (verdict === 'mark') {
      tx.update(propRef, { status: 'sold', soldTo: a.username, soldAt: Timestamp.now(), soldPaymentId: a.paymentId });
    }
    if (r.exists) tx.delete(resRef);
    tx.set(ownRef, {
      uid: a.uid, username: a.username, propertyId: a.propertyId, propertyTitle: a.propertyTitle,
      propertyType: p.data()?.type ?? null, location: p.data()?.location ?? null,
      amount: a.amount, currency: a.currency, paymentId: a.paymentId, contractId: a.contractId,
      status, createdAt: Timestamp.now(),
    });
    return { recorded: true as const, status };
  });
}
