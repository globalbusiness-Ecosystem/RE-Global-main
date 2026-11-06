'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, TrendingUp } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useLanguage } from '@/contexts/language-context';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { feeSplit, listingTotal } from '@/lib/market-rules';
import { mk } from '@/lib/market-labels';

type Listing = { id: string; propertyId: string; propertyTitle: string; shares: number; pricePerShare: number; total: number | null; reserved: boolean };
type Position = { propertyId: string; title: string; owned: number; listed: number; available: number };
type Mine = { id: string; propertyTitle: string; shares: number; pricePerShare: number; status: string };
type Payout = { id: string; kind: string; amount: number; status: string };
type Tab = 'market' | 'shares' | 'listings' | 'payouts';

// Numbers and π amounts are always laid out left-to-right (and isolated), so they never get scrambled inside Arabic or Urdu text.
function Pi({ value }: { value: number | string }) {
  return <bdi dir="ltr" className="tabular-nums whitespace-nowrap">{value} π</bdi>;
}
function Num({ value }: { value: number | string }) {
  return <bdi dir="ltr" className="tabular-nums">{value}</bdi>;
}
function Stat({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="min-w-0 text-center">
      <dt className="text-[11px] leading-tight text-gray-400 mb-1">{label}</dt>
      <dd className={`text-base font-bold ${accent ? 'text-amber-400' : 'text-white'}`}>{children}</dd>
    </div>
  );
}
function PropertyHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center" aria-hidden="true"><Building2 className="w-5 h-5" /></div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug line-clamp-2 text-start">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function SharesMarketPage() {
  const { accessToken } = usePiAuth();
  const { language } = useLanguage();
  const dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';
  const Back = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const [listings, setListings] = useState<Listing[]>([]);
  const [me, setMe] = useState<{ positions: Position[]; listings: Mine[]; payouts: Payout[] } | null>(null);
  const [form, setForm] = useState<{ propertyId: string; shares: string; price: string } | null>(null);
  const [msg, setMsg] = useState('');
  const [feePct, setFeePct] = useState(2);
  const [tab, setTab] = useState<Tab>('market');

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
  const card = 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4';
  const tiles = 'grid grid-cols-3 gap-2 rounded-xl bg-black/40 border border-white/5 p-3';
  const input = 'w-full rounded-lg bg-black/40 border border-white/10 p-2.5 text-sm text-white mt-1 focus:outline-none focus:border-amber-500/60';
  const statusText = (s: string) => (s === 'open' ? mk('statusOpen', language) : s === 'sold' ? mk('statusSold', language) : s === 'cancelled' ? mk('statusCancelled', language) : s);

  const tabs: { id: Tab; label: string; count?: number }[] = [{ id: 'market', label: mk('forSale', language), count: listings.length }];
  if (me) {
    tabs.push({ id: 'shares', label: mk('myShares', language), count: me.positions.length });
    if (me.listings.length > 0) tabs.push({ id: 'listings', label: mk('myListings', language), count: me.listings.length });
    if (me.payouts.length > 0) tabs.push({ id: 'payouts', label: mk('owedToMe', language), count: me.payouts.length });
  }
  const active: Tab = tabs.some((t) => t.id === tab) ? tab : 'market';

  return (
    <main dir={dir} className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="max-w-2xl mx-auto flex items-center gap-2 px-4 h-14">
          <a href="/" aria-label={mk('back', language)} className="-ms-2 p-2 rounded-full text-gray-300 hover:bg-white/10"><Back className="w-5 h-5" /></a>
          <TrendingUp className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <h1 className="text-lg font-bold text-amber-500">{mk('title', language)}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {msg && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">{msg}</p>}

        <div role="tablist" className="flex gap-1 rounded-xl bg-white/5 p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id} role="tab" aria-selected={active === t.id} onClick={() => setTab(t.id)}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${active === t.id ? 'bg-amber-500 text-black' : 'text-gray-300 hover:bg-white/10'}`}
            >
              {t.label}{t.count ? <> <Num value={t.count} /></> : null}
            </button>
          ))}
        </div>

        {active === 'market' && (
          <section className="space-y-3">
            {listings.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-400">{mk('nothingForSale', language)}</p>}
            {listings.map((l) => (
              <article key={l.id} className={card}>
                <PropertyHead title={l.propertyTitle}>
                  {l.reserved && <p className="mt-1 text-xs text-yellow-400">{mk('someonePaying', language)}</p>}
                </PropertyHead>
                <dl className={tiles}>
                  <Stat label={mk('sharesLabel', language)}><Num value={l.shares} /> <span className="text-xs font-normal text-gray-400">{mk('sharesWord', language)}</span></Stat>
                  <Stat label={mk('perShare', language)}><Pi value={l.pricePerShare} /></Stat>
                  <Stat label={mk('totalWord', language)} accent>{l.total !== null ? <Pi value={l.total} /> : '—'}</Stat>
                </dl>
                {!l.reserved && l.total !== null && (
                  <UnifiedPaymentButton
                    propertyId={l.propertyId} propertyTitle={l.propertyTitle} price={l.total} amountPi={l.total}
                    listingId={l.id} transactionType="resale" language={language} currency="PI"
                    className="!py-3 !text-base"
                    disabled={!accessToken} onSuccess={() => setTimeout(load, 1500)}
                  />
                )}
              </article>
            ))}
          </section>
        )}

        {active === 'shares' && me && (
          <section className="space-y-3">
            {me.positions.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-400">{mk('noShares', language)}</p>}
            {me.positions.map((p) => (
              <article key={p.propertyId} className={card}>
                <PropertyHead title={p.title || p.propertyId} />
                <dl className={tiles}>
                  <Stat label={mk('owned', language)}><Num value={p.owned} /></Stat>
                  <Stat label={mk('listed', language)}><Num value={p.listed} /></Stat>
                  <Stat label={mk('available', language)} accent><Num value={p.available} /></Stat>
                </dl>
                {p.owned > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                    <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, Math.round((p.listed / p.owned) * 100))}%` }} />
                  </div>
                )}
                {p.available > 0 && form?.propertyId !== p.propertyId && (
                  <button className="w-full rounded-xl border border-amber-500/50 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/10" onClick={() => setForm({ propertyId: p.propertyId, shares: String(p.available), price: '' })}>{mk('sell', language)}</button>
                )}
                {form?.propertyId === p.propertyId && (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs text-gray-400">{mk('sharesLabel', language)}<input dir="ltr" className={input} type="number" inputMode="numeric" min={1} max={p.available} value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} /></label>
                      <label className="block text-xs text-gray-400">{mk('pricePerShare', language)}<input dir="ltr" className={input} type="number" inputMode="decimal" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
                    </div>
                    {split && total ? (
                      <>
                        <dl className="space-y-1.5 border-t border-white/10 pt-3 text-sm">
                          <div className="flex justify-between"><dt className="text-gray-400">{mk('totalWord', language)}</dt><dd><Pi value={total} /></dd></div>
                          <div className="flex justify-between"><dt className="text-gray-400">{mk('feeWord', language)} (<Num value={feePct} />%)</dt><dd><Pi value={split.fee} /></dd></div>
                          <div className="flex justify-between font-bold text-amber-400"><dt>{mk('youReceive', language)}</dt><dd><Pi value={split.proceeds} /></dd></div>
                        </dl>
                        <p className="sr-only" aria-live="polite">{mk('totalLine', language, { total, fee: split.fee, proceeds: split.proceeds })}</p>
                      </>
                    ) : null}
                    <div className="flex gap-3">
                      <button className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-black disabled:opacity-50" disabled={!total} onClick={sell}>{mk('confirm', language)}</button>
                      <button className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm text-gray-300 hover:bg-white/10" onClick={() => setForm(null)}>{mk('cancel', language)}</button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {active === 'listings' && me && (
          <section className="space-y-3">
            {me.listings.map((l) => (
              <article key={l.id} className={card}>
                <PropertyHead title={l.propertyTitle}>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${l.status === 'open' ? 'bg-emerald-500/15 text-emerald-400' : l.status === 'sold' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-gray-400'}`}>{statusText(l.status)}</span>
                </PropertyHead>
                <dl className={tiles}>
                  <Stat label={mk('sharesLabel', language)}><Num value={l.shares} /></Stat>
                  <Stat label={mk('perShare', language)}><Pi value={l.pricePerShare} /></Stat>
                  <Stat label={mk('totalWord', language)} accent><Pi value={Math.round(l.shares * l.pricePerShare * 100) / 100} /></Stat>
                </dl>
                {l.status === 'open' && <button className="w-full rounded-xl border border-red-500/40 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10" onClick={() => cancel(l.id)}>{mk('cancelListing', language)}</button>}
              </article>
            ))}
          </section>
        )}

        {active === 'payouts' && me && (
          <section className="space-y-3">
            {me.payouts.map((p) => (
              <article key={p.id} className={`${card} flex items-center justify-between gap-3 !space-y-0`}>
                <div>
                  <p className="text-sm text-gray-300">{p.kind === 'refund' ? mk('refund', language) : mk('proceeds', language)}</p>
                  <p className="text-lg font-bold text-white"><Pi value={p.amount} /></p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{p.status === 'paid' ? mk('paid', language) : mk('pending', language)}</span>
              </article>
            ))}
            <p className="text-xs text-gray-500">{mk('manualNote', language)}</p>
          </section>
        )}

        {!accessToken && <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-300">{mk('signIn', language)}</p>}
      </div>
    </main>
  );
}
