import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { readStay, type ApplyResult, type CardOrder } from './order';

const okId = (id: string) => !!id && !id.includes('/') && id.length <= 128;

// Reads the order, lets `fn` decide, and saves the result in one transaction (two notifications at once cannot both win).
export async function applyToOrder(orderId: string, fn: (o: CardOrder) => ApplyResult): Promise<ApplyResult | 'missing'> {
  if (!okId(orderId)) return 'missing';
  const ref = adminDb.collection('card_orders').doc(orderId);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return 'missing' as const;
    const d = snap.data() as Partial<CardOrder>;
    const order: CardOrder = {
      id: orderId, uid: String(d.uid ?? ''), propertyId: typeof d.propertyId === 'string' ? d.propertyId : undefined, amountMinor: Number(d.amountMinor), currency: d.currency as CardOrder['currency'],
      status: d.status as CardOrder['status'], providerRef: d.providerRef, booking: readStay(d.booking), seenEvents: Array.isArray(d.seenEvents) ? d.seenEvents.map(String).slice(-50) : [],
    };
    const r = fn(order);
    if (r.ok && (r.changed || r.order.seenEvents.length !== order.seenEvents.length)) {
      tx.update(ref, { status: r.order.status, providerRef: r.order.providerRef ?? null, seenEvents: r.order.seenEvents.slice(-50) });
    }
    return r;
  });
}

// Creates a pending order for a person and a listing, at the price the server worked out.
export async function createOrder(a: { uid: string; propertyId: string; amountMinor: number; currency: string; providerId: string; booking?: CardOrder['booking'] }): Promise<string> {
  const ref = adminDb.collection('card_orders').doc();
  await ref.set({
    uid: a.uid, propertyId: a.propertyId, amountMinor: a.amountMinor, currency: a.currency, providerId: a.providerId,
    status: 'pending', seenEvents: [], createdAt: Timestamp.now(), ...(a.booking ? { booking: a.booking } : {}),
  });
  return ref.id;
}

export async function setProviderRef(orderId: string, providerRef: string): Promise<void> {
  await adminDb.collection('card_orders').doc(orderId).update({ providerRef });
}

// Removes an order that never reached the payment company (for example when the property could not be held).
export async function deleteOrder(orderId: string): Promise<void> {
  await adminDb.collection('card_orders').doc(orderId).delete();
}

export async function getOrder(orderId: string): Promise<CardOrder | null> {
  if (!okId(orderId)) return null;
  const snap = await adminDb.collection('card_orders').doc(orderId).get();
  if (!snap.exists) return null;
  const d = snap.data() as Partial<CardOrder>;
  return {
    id: orderId, uid: String(d.uid ?? ''), propertyId: typeof d.propertyId === 'string' ? d.propertyId : undefined,
    amountMinor: Number(d.amountMinor), currency: d.currency as CardOrder['currency'], status: d.status as CardOrder['status'],
    providerRef: d.providerRef, booking: readStay(d.booking), seenEvents: [],
  };
}
