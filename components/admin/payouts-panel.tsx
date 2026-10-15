'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, fmtDate, GOLD } from './admin-ui';

type Payout = { id: string; kind: string; uid: string; username: string; amount: number; fee?: number; gross?: number; status: string; createdAt: string | null; paidAt: string | null; paymentId?: string };

// Money the platform owes after share resales: seller proceeds and refunds. The admin sends the Pi by hand, then marks it paid.
export default function PayoutsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Payout[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    adminApi<{ payouts: Payout[] }>('/api/admin/payouts')
      .then((d) => setRows(d.payouts))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const markPaid = async (id: string) => {
    if (!window.confirm('تأكد إنك حوّلت المبلغ للمستخدم قبل ما تعلّمه مدفوع.')) return;
    setBusy(id);
    try {
      await adminApi('/api/admin/payouts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return null;
  if (rows.length === 0) return null;
  const pending = rows.filter((r) => r.status === 'pending');
  const owed = pending.reduce((n, r) => n + (Number(r.amount) || 0), 0);
  return (
    <Card title={`💸 مستحقات سوق الحصص (${pending.length} معلّقة · ${Math.round(owed * 100) / 100} π)`}>
      <div className="space-y-2">
        {rows.slice(0, 50).map((r) => (
          <div key={r.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate font-bold text-white">@{r.username}</p>
              <span className="shrink-0 font-bold" style={{ color: GOLD }}>{r.amount} π</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
              <Badge tone={r.kind === 'refund' ? 'red' : 'blue'}>{r.kind === 'refund' ? 'استرداد' : 'حصيلة بيع'}</Badge>
              <Badge tone={r.status === 'paid' ? 'green' : 'gold'}>{r.status === 'paid' ? 'اتحوّل' : 'معلّق'}</Badge>
              <span>{fmtDate(r.createdAt)}</span>
              {r.fee ? <span>· عمولة {r.fee} π</span> : null}
              <span className="truncate" dir="ltr">uid: {r.uid}</span>
            </div>
            {r.status === 'pending' && (
              <div className="mt-2"><Btn small onClick={() => markPaid(r.id)} disabled={busy === r.id}>✅ تم التحويل</Btn></div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
