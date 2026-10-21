'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { cancelStrings, refundText } from '@/lib/cancellation';
import { formatNumber } from '@/lib/format';

type Quote = { pct: number; refund: number };

// "Cancel booking" for an upcoming stay: shows exactly what comes back under the policy, then asks to confirm.
export function CancelBooking({ bookingId, language, onDone }: { bookingId: string; language: string; onDone: () => void }) {
  const { accessToken } = usePiAuth();
  const t = cancelStrings(language);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'confirm' | 'working' | 'done' | 'error'>('idle');

  if (state === 'done') return <p className="text-xs text-green-400">✓ {t.done}</p>;

  const start = async () => {
    if (!accessToken) return;
    setState('loading');
    try {
      const r = await fetch(`/api/bookings/cancel?bookingId=${encodeURIComponent(bookingId)}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.allowed) { setState('error'); return; }
      setQuote({ pct: Number(d.pct) || 0, refund: Number(d.refund) || 0 });
      setState('confirm');
    } catch { setState('error'); }
  };

  const confirm = async () => {
    if (!accessToken) return;
    setState('working');
    try {
      const r = await fetch('/api/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ bookingId }) });
      if (!r.ok) { setState('error'); return; }
      setState('done');
      onDone();
    } catch { setState('error'); }
  };

  if (state === 'confirm' && quote) {
    return (
      <div className="space-y-2 rounded-md border border-red-500/30 bg-red-500/10 p-2">
        <p className="text-xs text-gray-200">{refundText(language, quote, formatNumber(quote.refund, language, 2))}</p>
        <div className="flex gap-2">
          <button type="button" onClick={confirm} className="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white">{t.confirm}</button>
          <button type="button" onClick={() => setState('idle')} className="rounded border border-white/20 px-3 py-1 text-xs text-gray-300">{t.keep}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <button type="button" onClick={start} disabled={state === 'loading' || state === 'working'} className="rounded border border-red-400/50 px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50">
        {state === 'working' ? t.working : t.button}
      </button>
      {state === 'error' && <p className="text-xs text-red-400">{t.error}</p>}
    </div>
  );
}
