'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authHeaders } from '@/lib/api-token';
import { pm } from '@/lib/pay-method-labels';
import { kl } from '@/lib/kyc-labels';

function money(minor: number, currency: string, language: string): string {
  try { return new Intl.NumberFormat(language, { style: 'currency', currency }).format(minor / 100); } catch { return `${(minor / 100).toFixed(2)} ${currency}`; }
}

// Outside the Pi Browser, for a signed-in person: a "Pay by card" button when this listing can be paid by card,
// otherwise the "coming soon" note. The person is sent to the payment company's own page; no card data is handled here.
export function CardPayButton({ propertyId, transactionType, language, className = '', booking }: { propertyId: string; transactionType: string; language: string; className?: string; booking?: { start: string; end: string; guests?: number } }) {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [needKyc, setNeedKyc] = useState(false);
  const isStay = transactionType === 'rent' || transactionType === 'hotel';
  const eligible = transactionType === 'buy' || (isStay && Boolean(booking));
  const [amount, setAmount] = useState<{ minor: number; currency: string } | null>(null);
  const bStart = booking?.start;
  const bEnd = booking?.end;
  const bGuests = booking?.guests;

  useEffect(() => {
    if (!eligible) return;
    let live = true;
    const q = `propertyId=${encodeURIComponent(propertyId)}${isStay && bStart && bEnd ? `&start=${encodeURIComponent(bStart)}&end=${encodeURIComponent(bEnd)}${bGuests ? `&guests=${bGuests}` : ''}` : ''}`;
    fetch(`/api/card/config?${q}`)
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((j) => {
        if (!live) return;
        setAvailable(j?.available === true);
        setAmount(j?.available === true && Number.isInteger(j?.amountMinor) && typeof j?.currency === 'string' ? { minor: j.amountMinor, currency: j.currency } : null);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [propertyId, eligible, isStay, bStart, bEnd, bGuests]);

  if (!available) {
    return (
      <div className={`border border-border text-muted-foreground py-2 px-3 rounded-lg text-center text-xs w-full ${className}`}>
        <div className="font-semibold text-sm">{pm('cardSoon', language)}</div>
        <div className="mt-0.5">{pm('cardSoonNote', language)}</div>
      </div>
    );
  }

  const start = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const r = await fetch('/api/card/checkout', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ propertyId, ...(isStay && booking ? { booking: { start: booking.start, end: booking.end, ...(booking.guests ? { guests: booking.guests } : {}) } } : {}) }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 403 && j?.code === 'kyc_required') { setNeedKyc(true); setBusy(false); return; }
      if (!r.ok || typeof j?.redirectUrl !== 'string') throw new Error('checkout');
      window.location.href = j.redirectUrl;
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <button type="button" onClick={start} disabled={busy} className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50">
        {pm('payByCard', language)}{amount ? ` · ${money(amount.minor, amount.currency, language)}` : ''}
      </button>
      {needKyc && (
        <div role="alert" className="mt-2 text-center text-xs text-amber-300">
          <p>{kl('required', language)}</p>
          <Link href="/kyc" className="mt-1 inline-block rounded-lg border border-amber-300/60 px-3 py-1 font-semibold">{kl('verifyCta', language)}</Link>
        </div>
      )}
      {failed && <p role="alert" className="mt-1 text-center text-xs text-red-400">{pm('cardFailed', language)}</p>}
    </div>
  );
}
