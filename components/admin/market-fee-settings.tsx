'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls } from './admin-ui';
import { parseFeePct } from '@/lib/market-rules';

export default function MarketFeeSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [pct, setPct] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ resaleFeePct: number }>('/api/admin/market-settings')
      .then((d) => { setPct(String(d.resaleFeePct)); setLoaded(true); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const n = parseFeePct(pct);

  const save = async () => {
    if (n === null) return;
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/market-settings', { method: 'PUT', body: JSON.stringify({ resaleFeePct: n }) });
      setMsg('✅ اتحفظ. العروض الجديدة بس هتتحاسب بالنسبة دي.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally { setBusy(false); }
  };

  return (
    <Card title="📈 عمولة سوق الحصص">
      <p className="mb-3 text-xs text-gray-400">النسبة اللي المنصة بتاخدها من سعر بيع الحصص بين المستخدمين (من 0 لـ 20%). العروض اللي معروضة بالفعل بتفضل على النسبة اللي اتعرضت بيها.</p>
      <Field label="العمولة %">
        <input className={inputCls} type="number" step="0.01" min="0" max="20" dir="ltr" value={pct} onChange={(e) => setPct(e.target.value)} disabled={!loaded} />
      </Field>
      <div className="mt-3"><Btn onClick={save} disabled={busy || n === null || !loaded}>{busy ? '...' : '💾 حفظ'}</Btn></div>
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
