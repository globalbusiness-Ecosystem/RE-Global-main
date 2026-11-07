'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { authHeaders } from '@/lib/api-token';
import { cr } from '@/lib/card-return-labels';

// Shown after the payment company's page. It never claims the payment succeeded: only the signed notification
// from the payment company marks an order as paid, so this page just says it is being confirmed.
// In test mode (?sandbox=1&order=...) it also offers two buttons to finish the pretend payment.
export default function CardReturnPage() {
  const { language } = useLanguage();
  const rtl = language === 'ar' || language === 'ur';
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sim, setSim] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const o = q.get('order');
    if (q.get('sandbox') === '1' && o) setOrderId(o);
  }, []);

  const simulate = async (outcome: 'paid' | 'failed') => {
    setSim('busy');
    try {
      const r = await fetch('/api/card/sandbox/complete', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ orderId, outcome }) });
      setSim(r.ok ? 'done' : 'error');
    } catch {
      setSim('error');
    }
  };

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-10 text-white">
      <h1 className="text-2xl font-bold">{cr('title', language)}</h1>
      <p className="text-sm text-gray-300">{cr('body', language)}</p>
      {orderId && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/15 p-3">
          <p className="text-xs text-gray-400">{cr('simNote', language)}</p>
          <button type="button" disabled={sim === 'busy'} onClick={() => simulate('paid')} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50">{cr('simPaid', language)}</button>
          <button type="button" disabled={sim === 'busy'} onClick={() => simulate('failed')} className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50">{cr('simFailed', language)}</button>
          {sim === 'done' && <p role="status" className="text-xs text-emerald-300">{cr('simDone', language)}</p>}
          {sim === 'error' && <p role="alert" className="text-xs text-red-300">{cr('simError', language)}</p>}
        </div>
      )}
      <Link href="/" className="text-sm text-gray-400 underline">{cr('home', language)}</Link>
    </main>
  );
}
