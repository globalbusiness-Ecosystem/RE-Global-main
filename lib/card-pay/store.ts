import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import type { ApplyResult, CardOrder } from './order';

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
      id: orderId, uid: String(d.uid ?? ''), amountMinor: Number(d.amountMinor), currency: d.currency as CardOrder['currency'],
      status: d.status as CardOrder['status'], providerRef: d.providerRef, seenEvents: Array.isArray(d.seenEvents) ? d.seenEvents.map(String).slice(-50) : [],
    };
    const r = fn(order);
    if (r.ok && (r.changed || r.order.seenEvents.length !== order.seenEvents.length)) {
      tx.update(ref, { status: r.order.status, providerRef: r.order.providerRef ?? null, seenEvents: r.order.seenEvents.slice(-50) });
    }
    return r;
  });
}
