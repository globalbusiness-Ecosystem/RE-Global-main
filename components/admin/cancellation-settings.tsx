'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls } from './admin-ui';
import { parsePolicy, policyText } from '@/lib/cancellation';

// Admin: the cancellation policy of hotel and rental bookings (how much the guest gets back, by how early they cancel).
export default function CancellationSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [free, setFree] = useState('');
  const [partDays, setPartDays] = useState('');
  const [partPct, setPartPct] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ policy: { freeDays: number; partialDays: number; partialPct: number } }>('/api/admin/cancellation')
      .then((d) => { setFree(String(d.policy.freeDays)); setPartDays(String(d.policy.partialDays)); setPartPct(String(d.policy.partialPct)); setLoaded(true); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const p = parsePolicy({ freeDays: free, partialDays: partDays, partialPct: partPct });

  const save = async () => {
    if (!p) return;
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/cancellation', { method: 'PUT', body: JSON.stringify(p) });
      setMsg('✅ اتحفظت. بتتطبق على أي إلغاء من دلوقتي، وبتظهر للضيوف في صفحة الفندق.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally { setBusy(false); }
  };

  return (
    <Card title="↩️ سياسة إلغاء الحجز">
      <p className="mb-3 text-xs text-gray-400">الضيف يقدر يلغي حجزه بنفسه لحد اليوم اللي قبل الوصول. المبلغ اللي يرجعله بيتحسب حسب بدري قد إيه ألغى، وبيتسجل في المدفوعات كاسترداد مستني وإنت اللي بتدفعه.</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="استرداد كامل قبل الوصول بـ (يوم)"><input className={inputCls} type="number" min="1" max="90" dir="ltr" value={free} onChange={(e) => setFree(e.target.value)} disabled={!loaded} /></Field>
        <Field label="استرداد جزئي قبل الوصول بـ (يوم)"><input className={inputCls} type="number" min="0" dir="ltr" value={partDays} onChange={(e) => setPartDays(e.target.value)} disabled={!loaded} /></Field>
        <Field label="نسبة الاسترداد الجزئي % (0 = من غير جزئي)"><input className={inputCls} type="number" min="0" max="99" dir="ltr" value={partPct} onChange={(e) => setPartPct(e.target.value)} disabled={!loaded} /></Field>
      </div>
      {p && <p className="mt-2 rounded-lg bg-[#141414] p-2 text-xs text-gray-300">الضيف هيشوف: {policyText('ar', p)}</p>}
      <div className="mt-3"><Btn onClick={save} disabled={busy || !p || !loaded}>{busy ? '...' : '💾 حفظ'}</Btn></div>
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
