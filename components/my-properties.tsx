'use client';

import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { formatPropertyPrice } from '@/lib/price-format';

type Owned = { id: string; propertyTitle: string; location?: string | null; amount: number; currency: string; status: string; createdAt: string | null; paymentId: string };

// The signed-in user's purchased properties.
type Booked = { id: string; propertyTitle: string; propertyType: string; start: string; end: string; nights: number; amount: number; status: string };

type Holding = { id: string; propertyTitle: string; shares: number; totalShares: number; amount: number; status: string };

export function MyProperties({ language }: { language: string }) {
  const { accessToken } = usePiAuth();
  const [items, setItems] = useState<Owned[] | null>(null);
  const [bookings, setBookings] = useState<Booked[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const ar = language === 'ar';

  useEffect(() => {
    if (!accessToken) { setItems(null); setBookings([]); setHoldings([]); return; }
    let alive = true;
    fetch('/api/my-properties', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => { if (alive) { setItems(Array.isArray(d.items) ? d.items : []); setBookings(Array.isArray(d.bookings) ? d.bookings : []); setHoldings(Array.isArray(d.holdings) ? d.holdings : []); } })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [accessToken]);

  if (!items || (items.length === 0 && bookings.length === 0 && holdings.length === 0)) return null;
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
            {o.createdAt && <p className="text-[11px] text-gray-500">{new Date(o.createdAt).toLocaleDateString(ar ? 'ar-EG' : 'en-US')}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-accent text-sm font-bold">{formatPropertyPrice({ price: o.amount, currency: o.currency })}</p>
            <p className={`text-[11px] ${o.status === 'review' ? 'text-yellow-400' : 'text-green-400'}`}>
              {o.status === 'review' ? (ar ? 'قيد المراجعة' : 'Under review') : (ar ? 'مؤكد' : 'Confirmed')}
            </p>
          </div>
        </div>
      ))}
    </section>
    )}
    {bookings.length > 0 && (
      <section className="rounded-lg border border-accent/40 p-4 space-y-3" style={{ backgroundColor: '#1a2332' }}>
        <h2 className="text-sm font-bold text-accent">📅 {ar ? 'حجوزاتي' : 'My bookings'} ({bookings.length})</h2>
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{b.propertyTitle}</p>
              <p className="text-xs text-gray-400">{b.start} → {b.end} · {b.nights} {ar ? 'ليلة' : 'nights'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-accent text-sm font-bold">{b.amount} π</p>
              <p className={`text-[11px] ${b.status === 'review' ? 'text-yellow-400' : 'text-green-400'}`}>
                {b.status === 'review' ? (ar ? 'قيد المراجعة' : 'Under review') : (ar ? 'مؤكد' : 'Confirmed')}
              </p>
            </div>
          </div>
        ))}
      </section>
    )}
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
              <p className={`text-[11px] ${h.status === 'review' ? 'text-yellow-400' : 'text-green-400'}`}>
                {h.status === 'review' ? (ar ? 'قيد المراجعة' : 'Under review') : (ar ? 'مؤكد' : 'Confirmed')}
              </p>
            </div>
          </div>
        ))}
      </section>
    )}
    </>
  );
}
