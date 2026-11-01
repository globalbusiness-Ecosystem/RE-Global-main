'use client';

import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { formatPropertyPrice } from '@/lib/price-format';
import { formatDate } from '@/lib/format';
import { pendingOwed } from '@/lib/market-rules';
import { MyBookingsList, type Booked } from '@/components/my-bookings-list';
import type { AssetSection, AssetCounts } from '@/lib/contracts-tabs';
import { saveOfflineBookings, loadOfflineBookings, browserStore } from '@/lib/offline-bookings';
import { saveOfflineAssets, loadOfflineAssets, OFFLINE_COPY_I18N } from '@/lib/offline-assets';
import type { NavLanguage } from '@/lib/nav-i18n';

type Owned = { id: string; propertyTitle: string; location?: string | null; amount: number; currency: string; status: string; createdAt: string | null; paymentId: string };

// The signed-in user's purchased properties.

type Payout = { id: string; kind: string; amount: number; status: string };

type Holding = { id: string; propertyTitle: string; shares: number; totalShares: number; amount: number; status: string };

// `section` picks what to show: one section, nothing (null, only loads and reports counts), or everything (undefined).
export function MyProperties({ language, section, onCounts }: { language: string; section?: AssetSection | null; onCounts?: (c: AssetCounts) => void }) {
  const { accessToken, user } = usePiAuth();
  const uid = user?.uid ?? '';
  const [offlineAt, setOfflineAt] = useState<number | null>(null);
  const [items, setItems] = useState<Owned[] | null>(null);
  const [bookings, setBookings] = useState<Booked[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const ar = language === 'ar';
  const show = (s: AssetSection) => section === undefined || section === s;

  useEffect(() => {
    if (!accessToken) { setItems(null); setBookings([]); setHoldings([]); setPayouts([]); setOfflineAt(null); return; }
    let alive = true;
    fetch('/api/my-properties', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => { if (alive) { setOfflineAt(null); setItems(Array.isArray(d.items) ? d.items : []); setBookings(Array.isArray(d.bookings) ? d.bookings : []); { const st = browserStore(); if (st && uid && Array.isArray(d.bookings)) saveOfflineBookings(st, uid, d.bookings, Date.now()); } setHoldings(Array.isArray(d.holdings) ? d.holdings : []); setPayouts(Array.isArray(d.payouts) ? d.payouts : []); { const st = browserStore(); if (st && uid && Array.isArray(d.holdings) && Array.isArray(d.payouts)) saveOfflineAssets(st, uid, { holdings: d.holdings, payouts: d.payouts }, Date.now()); } } })
      .catch(() => {
        if (!alive) return;
        // The network is down: show the last copy of this user's own bookings, clearly marked as old.
        const st = browserStore();
        const saved = st && uid ? loadOfflineBookings(st, uid, Date.now()) : null;
        setItems([]);
        const savedAssets = st && uid ? loadOfflineAssets(st, uid, Date.now()) : null;
        if (saved) { setBookings(saved.bookings); setOfflineAt(saved.at); }
        if (savedAssets) { setHoldings(savedAssets.holdings as Holding[]); setPayouts(savedAssets.payouts); setOfflineAt((prev) => Math.max(prev ?? 0, savedAssets.at)); }
      });
    return () => { alive = false; };
  }, [accessToken, uid]);

  useEffect(() => {
    onCounts?.({ bookings: bookings.length, properties: items?.length ?? 0, shares: holdings.length, owed: payouts.length });
  }, [items, bookings, holdings, payouts, onCounts]);

  if (section === null) return null;
  if (!items || (items.length === 0 && bookings.length === 0 && holdings.length === 0 && payouts.length === 0)) return null;
  return (
    <>
    {offlineAt !== null && (
      <p role="status" className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-2 text-xs text-yellow-300">
        {(OFFLINE_COPY_I18N[language as NavLanguage] ?? OFFLINE_COPY_I18N.en).replace('{date}', formatDate(new Date(offlineAt).toISOString(), language))}
      </p>
    )}
    {show('properties') && items.length > 0 && (
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
    {show('bookings') && bookings.length > 0 && <MyBookingsList bookings={bookings} language={language} />}
    {show('shares') && holdings.length > 0 && (
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
    {show('owed') && payouts.length > 0 && (
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
