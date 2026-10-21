'use client';

import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { formatPropertyPrice } from '@/lib/price-format';
import { formatDate } from '@/lib/format';
import { pendingOwed } from '@/lib/market-rules';
import { MyBookingsList, type Booked } from '@/components/my-bookings-list';

type Owned = { id: string; propertyTitle: string; location?: string | null; amount: number; currency: string; status: string; createdAt: string | null; paymentId: string };

// The signed-in user's purchased properties.

type Payout = { id: string; kind: string; amount: number; status: string };

type Holding = { id: string; propertyTitle: string; shares: number; totalShares: number; amount: number; status: string };

export function MyProperties({ language }: { language: string }) {
  const { accessToken } = usePiAuth();
  const [items, setItems] = useState<Owned[] | null>(null);
  const [bookings, setBookings] = useState<Booked[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const ar = language === 'ar';

  useEffect(() => {
    if (!accessToken) { setItems(null); setBookings([]); setHoldings([]); setPayouts([]); return; }
    let alive = true;
    fetch('/api/my-properties', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => { if (alive) { setItems(Array.isArray(d.items) ? d.items : []); setBookings(Array.isArray(d.bookings) ? d.bookings : []); setHoldings(Array.isArray(d.holdings) ? d.holdings : []); setPayouts(Array.isArray(d.payouts) ? d.payouts : []); } })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [accessToken]);

  if (!items || (items.length === 0 && bookings.length === 0 && holdings.length === 0 && payouts.length === 0)) return null;
  return (
    <>
    {items.length > 0 && (
    <section className="rounded-lg border border-accent/40 p-4 space-y-3" style={{ backgroundColor: '#1a2332' }}>
      <h2 className="text-sm font-bold text-accent flex items-center gap-2">
        <Home className="w-4 h-4" /> {ar ? 'ممتلكاتي' : 'My properties'} ({items.length})
      </h2>
      {items.map((o) => (
        <div key={o.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{o.propertyTitle}</p>
            {o.location && <p className="text-xs text-gray-400 truncate">{o.location}</p>}
            {o.createdAt && <p className="text-[11px] text-gray-500">{formatDate(o.createdAt, language)}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-accent text-sm font-bold">{formatPropertyPrice({ price: o.amount, currency: o.currency }, language)}</p>
            <p className={`text-[11px] ${o.status === 'review' ? 'text-yellow-400' : 'text-green-400'}`}>
              {o.status === 'review' ? (ar ? 'قيد المراجعة' : 'Under review') : (ar ? 'مؤكد' : 'Confirmed')}
            </p>
          </div>
        </div>
      ))}
    </section>
    )}
    {bookings.length > 0 && <MyBookingsList bookings={bookings} language={language} />}
    {holdings.length > 0 && (
      <section className="rounded-lg border border-accent/40 p-4 space-y-3" style={{ backgroundColor: '#1a2332' }}>
        <h2 className="text-sm font-bold text-accent flex items-center justify-between">
          <span>📈 {ar ? 'حصصي' : 'My shares'} ({holdings.length})</span>
          <a href="/market" className="text-xs underline">{ar ? 'سوق الحصص' : 'Shares market'}</a>
        </h2>
        {holdings.map((h) => (
          <div key={h.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{h.propertyTitle}</p>
              <p className="text-xs text-gray-400">{h.shares} / {h.totalShares} {ar ? 'حصة' : 'shares'} ({Math.round((h.shares / h.totalShares) * 10000) / 100}%)</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-accent text-sm font-bold">{h.amount} π</p>
              <p className={`text-[11px] ${h.status === 'review' ? 'text-yellow-400' : h.status === 'cancelled' ? 'text-red-400' : 'text-green-400'}`}>
                {h.status === 'review' ? (ar ? 'قيد المراجعة' : 'Under review') : h.status === 'cancelled' ? (ar ? 'ملغي واتسجل استرداد' : 'Cancelled, refund queued') : (ar ? 'مؤكد' : 'Confirmed')}
              </p>
            </div>
          </div>
        ))}
      </section>
    )}
    {payouts.length > 0 && (
      <section className="rounded-lg border border-accent/40 p-4 space-y-3" style={{ backgroundColor: '#1a2332' }}>
        <h2 className="text-sm font-bold text-accent flex items-center justify-between">
          <span>💸 {ar ? 'مستحقاتي' : 'Owed to me'}</span>
          {pendingOwed(payouts) > 0 && <span className="text-xs text-yellow-400">{ar ? 'قيد التحويل' : 'Pending'}: {pendingOwed(payouts)} π</span>}
        </h2>
        {payouts.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
            <p className="text-white text-sm">{p.kind === 'refund' ? (ar ? 'استرداد' : 'Refund') : (ar ? 'حصيلة بيع حصص' : 'Share sale proceeds')}</p>
            <div className="text-right shrink-0">
              <p className="text-accent text-sm font-bold">{p.amount} π</p>
              <p className={`text-[11px] ${p.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{p.status === 'paid' ? (ar ? 'اتحوّلت' : 'Paid') : (ar ? 'قيد التحويل' : 'Pending')}</p>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-gray-500">{ar ? 'التحويل بيتم يدويًا من فريق المنصة.' : 'The platform team sends these by hand.'}</p>
      </section>
    )}
    </>
  );
}
