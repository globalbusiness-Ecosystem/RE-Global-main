import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { alertReview } from '@/lib/admin-alert';
import { finalizeSale, releaseReservation } from '@/lib/property-reserve';
import { getProvider } from './provider';
import { applyToOrder } from './store';
import type { WebhookDeps } from './webhook';

// What happens for real when a payment company reports a payment (shared by the notification route and the test simulator).
export const cardWebhookDeps: WebhookDeps = {
  getProvider,
  applyToOrder,
  onPaid: async (o) => {
    // Mark the property sold to this order (a second payer for the same property is flagged for review).
    if (o.propertyId) {
      const snap = await adminDb.collection('properties').doc(o.propertyId).get();
      await finalizeSale({
        propertyId: o.propertyId, uid: o.uid, username: o.uid, paymentId: o.id, contractId: '',
        propertyTitle: String(snap.data()?.title ?? ''), amount: o.amountMinor / 100, currency: o.currency,
      });
    }
    // Handing the property over is still done by the team: tell them an order was paid by card.
    await alertReview('دفع ببطاقة', { 'رقم الطلب': o.id, 'المبلغ': `${(o.amountMinor / 100).toFixed(2)} ${o.currency}`, 'العميل': o.uid });
  },
  onFailed: async (o) => { if (o.propertyId) await releaseReservation(o.propertyId, o.uid); },
};
