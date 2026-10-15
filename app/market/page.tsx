'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useLanguage } from '@/contexts/language-context';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { feeSplit, listingTotal } from '@/lib/market-rules';

type Listing = { id: string; propertyId: string; propertyTitle: string; shares: number; pricePerShare: number; total: number | null; reserved: boolean };
type Position = { propertyId: string; title: string; owned: number; listed: number; available: number };
type Mine = { id: string; propertyTitle: string; shares: number; pricePerShare: number; status: string };
type Payout = { id: string; kind: string; amount: number; status: string };

export default function SharesMarketPage() {
  const { accessToken } = usePiAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [listings, setListings] = useState<Listing[]>([]);
  const [me, setMe] = useState<{ positions: Position[]; listings: Mine[]; payouts: Payout[] } | null>(null);
  const [form, setForm] = useState<{ propertyId: string; shares: string; price: string } | null>(null);
  const [msg, setMsg] = useState('');
  const [feePct, setFeePct] = useState(2);

  const load = useCallback(async () => {
    fetch('/api/market/listings', { cache: 'no-store' }).then((r) => r.json()).then((d) => { setListings(Array.isArray(d.listings) ? d.listings : []); if (typeof d.feePct === 'number') setFeePct(d.feePct); }).catch(() => undefined);
    if (!accessToken) { setMe(null); return; }
    fetch('/api/market/me', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null)).then((d) => setMe(d && Array.isArray(d.positions) ? d : null)).catch(() => undefined);
  }, [accessToken]);
  useEffect(() => { load(); }, [load]);

  const post = async (url: string, body: unknown) => {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken ?? ''}` }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.error || 'Error');
    return d;
  };

  const sell = async () => {
    if (!form) return;
    setMsg('');
    try {
      await post('/api/market/listings', { propertyId: form.propertyId, shares: Number(form.shares), pricePerShare: Number(form.price) });
      setForm(null);
      setMsg(ar ? 'اتعرضت للبيع ✅' : 'Listed for sale ✅');
      load();
    } catch (e) { setMsg((e as Error).message); }
  };
  const cancel = async (id: string) => {
    setMsg('');
    try { await post('/api/market/listings/cancel', { listingId: id }); load(); } catch (e) { setMsg((e as Error).message); }
  };

  const total = form ? listingTotal(Number(form.shares), Number(form.price)) : null;
  const split = total ? feeSplit(total, feePct) : null;
  const card = 'rounded-xl border border-white/10 p-3 space-y-2';
  const input = 'w-full rounded-lg bg-black/30 border border-white/10 p-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-500">📈 {ar ? 'سوق الحصص' : 'Shares market'}</h1>
          <a href="/" className="text-sm underline text-gray-300">{ar ? 'رجوع' : 'Back'}</a>
        </header>
        {msg && <p className="text-sm text-amber-400">{msg}</p>}

        <section className="space-y-3">
          <h2 className="font-semibold">{ar ? 'حصص للبيع' : 'Shares for sale'}</h2>
          {listings.length === 0 && <p className="text-sm text-gray-400">{ar ? 'مفيش حصص معروضة دلوقتي.' : 'Nothing is for sale right now.'}</p>}
          {listings.map((l) => (
            <div key={l.id} className={card}>
              <p className="font-semibold">{l.propertyTitle}</p>
              <p className="text-sm text-gray-400">{l.shares} {ar ? 'حصة' : 'shares'} × {l.pricePerShare} π = <span className="text-amber-400 font-bold">{l.total} π</span></p>
              {l.reserved
                ? <p className="text-xs text-yellow-400">{ar ? 'حد بيدفع فيها دلوقتي' : 'Someone is paying for this right now'}</p>
                : l.total !== null && (
                  <UnifiedPaymentButton
                    propertyId={l.propertyId} propertyTitle={l.propertyTitle} price={l.total} amountPi={l.total}
                    listingId={l.id} transactionType="resale" language={language} currency="PI"
                    disabled={!accessToken} onSuccess={() => setTimeout(load, 1500)}
                  />
                )}
            </div>
          ))}
        </section>

        {me && (
          <>
            <section className="space-y-3">
              <h2 className="font-semibold">{ar ? 'حصصي' : 'My shares'}</h2>
              {me.positions.length === 0 && <p className="text-sm text-gray-400">{ar ? 'ملكش حصص لسه.' : 'You do not own shares yet.'}</p>}
              {me.positions.map((p) => (
                <div key={p.propertyId} className={card}>
                  <p className="font-semibold">{p.title || p.propertyId}</p>
                  <p className="text-sm text-gray-400">{ar ? 'ملكك' : 'Owned'}: {p.owned} · {ar ? 'معروض' : 'Listed'}: {p.listed} · {ar ? 'متاح للبيع' : 'Available'}: {p.available}</p>
                  {p.available > 0 && form?.propertyId !== p.propertyId && (
                    <button className="text-sm underline text-amber-400" onClick={() => setForm({ propertyId: p.propertyId, shares: String(p.available), price: '' })}>{ar ? 'اعرض للبيع' : 'Sell'}</button>
                  )}
                  {form?.propertyId === p.propertyId && (
                    <div className="space-y-2">
                      <label className="block text-xs text-gray-400">{ar ? 'عدد الحصص' : 'Shares'}<input className={input} type="number" min={1} max={p.available} value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} /></label>
                      <label className="block text-xs text-gray-400">{ar ? 'سعر الحصة (π)' : 'Price per share (π)'}<input className={input} type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
                      {split && total && <p className="text-xs text-gray-400">{ar ? `الإجمالي ${total} π · عمولة ${split.fee} π · هتستلم ${split.proceeds} π` : `Total ${total} π · fee ${split.fee} π · you receive ${split.proceeds} π`}</p>}
                      <div className="flex gap-3">
                        <button className="rounded-lg bg-amber-500 text-black px-3 py-1.5 text-sm font-semibold disabled:opacity-50" disabled={!total} onClick={sell}>{ar ? 'تأكيد العرض' : 'Confirm'}</button>
                        <button className="text-sm underline text-gray-300" onClick={() => setForm(null)}>{ar ? 'إلغاء' : 'Cancel'}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {me.listings.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold">{ar ? 'عروضي' : 'My listings'}</h2>
                {me.listings.map((l) => (
                  <div key={l.id} className={`${card} flex items-center justify-between gap-3`}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{l.propertyTitle}</p>
                      <p className="text-xs text-gray-400">{l.shares} × {l.pricePerShare} π · {l.status}</p>
                    </div>
                    {l.status === 'open' && <button className="text-sm underline text-red-400" onClick={() => cancel(l.id)}>{ar ? 'إلغاء العرض' : 'Cancel'}</button>}
                  </div>
                ))}
              </section>
            )}

            {me.payouts.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold">{ar ? 'مستحقاتي' : 'Owed to me'}</h2>
                {me.payouts.map((p) => (
                  <div key={p.id} className={`${card} flex items-center justify-between`}>
                    <p className="text-sm">{p.kind === 'refund' ? (ar ? 'استرداد' : 'Refund') : (ar ? 'حصيلة بيع' : 'Sale proceeds')} · {p.amount} π</p>
                    <span className={`text-xs ${p.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{p.status === 'paid' ? (ar ? 'اتحوّلت' : 'Paid') : (ar ? 'قيد التحويل' : 'Pending')}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-500">{ar ? 'التحويل بيتم يدويًا من فريق المنصة.' : 'The platform team sends these by hand.'}</p>
              </section>
            )}
          </>
        )}
        {!accessToken && <p className="text-sm text-gray-400">{ar ? 'سجّل دخول بـ Pi من الصفحة الرئيسية عشان تشتري وتبيع.' : 'Sign in with Pi from the home page to buy and sell.'}</p>}
      </div>
    </main>
  );
}
