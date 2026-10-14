'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls, GOLD } from './admin-ui';

export default function PricingSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rate, setRate] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ piUsdRate: number | null }>('/api/admin/pricing')
      .then((d) => { setRate(d.piUsdRate ? String(d.piUsdRate) : ''); setLoaded(true); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const n = Number(rate);
  const valid = Number.isFinite(n) && n >= 0.0001;

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/pricing', { method: 'PUT', body: JSON.stringify({ piUsdRate: n }) });
      setMsg('✅ اتحفظ. أي عقار بالدولار هيتحاسب بالسعر ده.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="💱 سعر Pi مقابل الدولار">
      <p className="mb-3 text-xs text-gray-400">
        العقار اللي تسعّره بالدولار (USD) بيفضل سعره ثابت، وبيدفع المشتري بالـ π حسب السعر اللي تكتبه هنا. غيّر الرقم متى شئت، والتغيير بيسري خلال دقيقة تقريباً. لو العقار فيه "المبلغ المطلوب دفعه بالـ π" بيتقدم عليه.
      </p>
      <Field label="1 π = كام دولار؟">
        <input className={inputCls} type="number" step="any" min="0" dir="ltr" placeholder="مثال: 0.20" value={rate} onChange={(e) => setRate(e.target.value)} disabled={!loaded} />
      </Field>
      {valid && <p className="mt-2 text-xs" style={{ color: GOLD }}>معنى كده: عقار بـ $1,000 = {(Math.ceil((1000 / n) * 100) / 100).toLocaleString()} π</p>}
      <p className="mt-2 text-[11px] text-red-300">⚠️ لو الرقم مش متحدد، مفيش حد يقدر يشتري عقار مسعّر بالدولار (الدفع بيتوقف لحد ما تكتبه).</p>
      <div className="mt-3"><Btn onClick={save} disabled={busy || !valid || !loaded}>{busy ? '...' : '💾 حفظ'}</Btn></div>
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
