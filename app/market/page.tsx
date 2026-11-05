'use client';
import Link from "next/link";

import { useCallback, useEffect, useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useLanguage } from '@/contexts/language-context';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { feeSplit, listingTotal } from '@/lib/market-rules';
import { mk } from '@/lib/market-labels';

type Listing = { id: string; propertyId: string; propertyTitle: string; shares: number; pricePerShare: number; total: number | null; reserved: boolean };
type Position = { propertyId: string; title: string; owned: number; listed: number; available: number };
type Mine = { id: string; propertyTitle: string; shares: number; pricePerShare: number; status: string };
type Payout = { id: string; kind: string; amount: number; status: string };

export default function SharesMarketPage() {
  const { accessToken } = usePiAuth();
  const { language } = useLanguage();
  const dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';
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
      setMsg(mk('listedOk', language));
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
    <main dir={dir} className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-500">📈 {mk('title', language)}</h1>
          <Link href="/" className="text-sm underline text-gray-300">{mk('back', language)}</Link>
        </header>
        {msg && <p className="text-sm text-amber-400">{msg}</p>}

        <section className="space-y-3">
          <h2 className="font-semibold">{mk('forSale', language)}</h2>
          {listings.length === 0 && <p className="text-sm text-gray-400">{mk('nothingForSale', language)}</p>}
          {listings.map((l) => (
            <div key={l.id} className={card}>
              <p className="font-semibold">{l.propertyTitle}</p>
              <p className="text-sm text-gray-400">{l.shares} {mk('sharesWord', language)} × {l.pricePerShare} π = <span className="text-amber-400 font-bold">{l.total} π</span></p>
              {l.reserved
                ? <p className="text-xs text-yellow-400">{mk('someonePaying', language)}</p>
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
              <h2 className="font-semibold">{mk('myShares', language)}</h2>
              {me.positions.length === 0 && <p className="text-sm text-gray-400">{mk('noShares', language)}</p>}
              {me.positions.map((p) => (
                <div key={p.propertyId} className={card}>
                  <p className="font-semibold">{p.title || p.propertyId}</p>
                  <p className="text-sm text-gray-400">{mk('owned', language)}: {p.owned} · {mk('listed', language)}: {p.listed} · {mk('available', language)}: {p.available}</p>
                  {p.available > 0 && form?.propertyId !== p.propertyId && (
                    <button className="text-sm underline text-amber-400" onClick={() => setForm({ propertyId: p.propertyId, shares: String(p.available), price: '' })}>{mk('sell', language)}</button>
                  )}
                  {form?.propertyId === p.propertyId && (
                    <div className="space-y-2">
                      <label className="block text-xs text-gray-400">{mk('sharesLabel', language)}<input className={input} type="number" min={1} max={p.available} value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} /></label>
                      <label className="block text-xs text-gray-400">{mk('pricePerShare', language)}<input className={input} type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
                      {split && total && <p className="text-xs text-gray-400">{mk('totalLine', language, { total, fee: split.fee, proceeds: split.proceeds })}</p>}
                      <div className="flex gap-3">
                        <button className="rounded-lg bg-amber-500 text-black px-3 py-1.5 text-sm font-semibold disabled:opacity-50" disabled={!total} onClick={sell}>{mk('confirm', language)}</button>
                        <button className="text-sm underline text-gray-300" onClick={() => setForm(null)}>{mk('cancel', language)}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {me.listings.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold">{mk('myListings', language)}</h2>
                {me.listings.map((l) => (
                  <div key={l.id} className={`${card} flex items-center justify-between gap-3`}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{l.propertyTitle}</p>
                      <p className="text-xs text-gray-400">{l.shares} × {l.pricePerShare} π · {l.status}</p>
                    </div>
                    {l.status === 'open' && <button className="text-sm underline text-red-400" onClick={() => cancel(l.id)}>{mk('cancelListing', language)}</button>}
                  </div>
                ))}
              </section>
            )}

            {me.payouts.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold">{mk('owedToMe', language)}</h2>
                {me.payouts.map((p) => (
                  <div key={p.id} className={`${card} flex items-center justify-between`}>
                    <p className="text-sm">{p.kind === 'refund' ? (mk('refund', language)) : (mk('proceeds', language))} · {p.amount} π</p>
                    <span className={`text-xs ${p.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{p.status === 'paid' ? (mk('paid', language)) : (mk('pending', language))}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-500">{mk('manualNote', language)}</p>
              </section>
            )}
          </>
        )}
        {!accessToken && <p className="text-sm text-gray-400">{mk('signIn', language)}</p>}
      </div>
    </main>
  );
}
