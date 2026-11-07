'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/api-token';
import { pm } from '@/lib/pay-method-labels';

// Outside the Pi Browser, for a signed-in person: a "Pay by card" button when this listing can be paid by card,
// otherwise the "coming soon" note. The person is sent to the payment company's own page; no card data is handled here.
export function CardPayButton({ propertyId, transactionType, language, className = '' }: { propertyId: string; transactionType: string; language: string; className?: string }) {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const eligible = transactionType === 'buy';

  useEffect(() => {
    if (!eligible) return;
    let live = true;
    fetch(`/api/card/config?propertyId=${encodeURIComponent(propertyId)}`)
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((j) => { if (live) setAvailable(j?.available === true); })
      .catch(() => {});
    return () => { live = false; };
  }, [propertyId, eligible]);

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
      const r = await fetch('/api/card/checkout', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ propertyId }) });
      const j = await r.json().catch(() => ({}));
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
        {pm('payByCard', language)}
      </button>
      {failed && <p role="alert" className="mt-1 text-center text-xs text-red-400">{pm('cardFailed', language)}</p>}
    </div>
  );
}
