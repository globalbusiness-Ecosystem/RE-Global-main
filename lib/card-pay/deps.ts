import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { alertReview } from '@/lib/admin-alert';
import { finalizeSale, releaseReservation } from '@/lib/property-reserve';
import { confirmBooking, releaseBooking } from '@/lib/booking-calendar';
import { createCardContract } from '@/lib/card-contract';
import { getProvider } from './provider';
import { applyToOrder } from './store';
import type { WebhookDeps } from './webhook';

// What happens for real when a payment company reports a payment (shared by the notification route and the test simulator).
export const cardWebhookDeps: WebhookDeps = {
  getProvider,
  applyToOrder,
  onPaid: async (o) => {
    // The signed contract (anchored on the blockchain) for this payment. Best effort: a problem here never blocks the sale.
    const contractId = (await createCardContract(o).catch((e) => { console.error('[card-contract] failed:', e instanceof Error ? e.message : 'unknown'); return null; })) ?? '';
    // Mark the property sold to this order (a second payer for the same property is flagged for review).
    if (o.propertyId && o.booking) {
      // A stay: turn the held dates into a confirmed booking (kept for review if the hold expired and the dates were taken).
      const snap = await adminDb.collection('properties').doc(o.propertyId).get();
      await confirmBooking({
        propertyId: o.propertyId, uid: o.uid, username: o.uid, paymentId: o.id, contractId,
        propertyTitle: String(snap.data()?.title ?? ''), propertyType: o.booking.type, start: o.booking.start, end: o.booking.end,
        nights: o.booking.nights, guests: o.booking.guests, amount: o.amountMinor / 100, currency: o.currency,
      });
    } else if (o.propertyId) {
      const snap = await adminDb.collection('properties').doc(o.propertyId).get();
      await finalizeSale({
        propertyId: o.propertyId, uid: o.uid, username: o.uid, paymentId: o.id, contractId,
        propertyTitle: String(snap.data()?.title ?? ''), amount: o.amountMinor / 100, currency: o.currency,
      });
    }
    // Handing the property over is still done by the team: tell them an order was paid by card.
    await alertReview('دفع ببطاقة', { 'رقم الطلب': o.id, 'المبلغ': `${(o.amountMinor / 100).toFixed(2)} ${o.currency}`, 'العميل': o.uid });
  },
  onFailed: async (o) => {
    if (!o.propertyId) return;
    if (o.booking) await releaseBooking(o.propertyId, o.id);
    else await releaseReservation(o.propertyId, o.uid);
  },
};
