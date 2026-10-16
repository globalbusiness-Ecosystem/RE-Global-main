import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { pendingOwed } from '@/lib/market-rules';

const num = (v: unknown) => Number(v) || 0;
const iso = (v: unknown) => ((v as { toDate?: () => Date })?.toDate ? (v as { toDate: () => Date }).toDate().toISOString() : null);
const byNewest = (a: { createdAt: string | null }, b: { createdAt: string | null }) => String(b.createdAt).localeCompare(String(a.createdAt));
const LIMIT = 50;

// Admin support view: everything one user has done on the platform, in one call (single-field queries only).
export async function adminUserDetail(username: string) {
  const col = (name: string, field: string) => adminDb.collection(name).where(field, '==', username).limit(LIMIT).get();
  const [contracts, bookings, holdings, payouts, listings] = await Promise.all([
    col('contracts', 'buyerUsername'), col('bookings', 'username'), col('share_holdings', 'username'),
    col('payouts', 'username'), col('share_listings', 'sellerName'),
  ]);
  const payoutRows = payouts.docs.map((d) => {
    const x = d.data();
    return { id: d.id, kind: String(x.kind ?? ''), amount: num(x.amount), status: String(x.status ?? ''), createdAt: iso(x.createdAt) };
  }).sort(byNewest);
  return {
    username,
    owed: pendingOwed(payoutRows),
    contracts: contracts.docs.map((d) => { const x = d.data(); return { id: d.id, type: String(x.type ?? ''), propertyTitle: String(x.propertyTitle ?? ''), amount: num(x.amount), createdAt: iso(x.createdAt) }; }).sort(byNewest),
    bookings: bookings.docs.map((d) => { const x = d.data(); return { id: d.id, propertyTitle: String(x.propertyTitle ?? ''), start: String(x.start ?? ''), end: String(x.end ?? ''), amount: num(x.amount), status: String(x.status ?? ''), createdAt: iso(x.createdAt) }; }).sort(byNewest),
    holdings: holdings.docs.map((d) => { const x = d.data(); return { id: d.id, propertyTitle: String(x.propertyTitle ?? ''), shares: num(x.shares), amount: num(x.amount), status: String(x.status ?? ''), createdAt: iso(x.createdAt) }; }).sort(byNewest),
    listings: listings.docs.map((d) => { const x = d.data(); return { id: d.id, propertyTitle: String(x.propertyTitle ?? ''), shares: num(x.shares), pricePerShare: num(x.pricePerShare), status: String(x.status ?? ''), createdAt: iso(x.createdAt) }; }).sort(byNewest),
    payouts: payoutRows,
  };
}
