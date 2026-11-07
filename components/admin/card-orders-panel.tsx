'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, fmtDate, GOLD } from './admin-ui';

type Order = { id: string; uid: string; propertyId: string | null; amountMinor: number; currency: string; status: string; providerId: string | null; createdAt: string | null; handedOverAt: string | null; note: string };

const STATUS: Record<string, { label: string; tone: 'green' | 'gold' | 'red' | 'blue' }> = {
  paid: { label: 'مدفوع', tone: 'green' },
  pending: { label: 'في الانتظار', tone: 'gold' },
  failed: { label: 'فشل', tone: 'red' },
  refunded: { label: 'مسترد', tone: 'blue' },
};

// Orders paid by card. Paid ones wait for the admin to hand the property over, then get marked as handed over.
export default function CardOrdersPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    adminApi<{ orders: Order[] }>('/api/admin/card-orders')
      .then((d) => setRows(d.orders))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const handOver = async (id: string) => {
    if (!window.confirm('تأكد إنك سلّمت العقار للمشتري قبل ما تعلّمه تم التسليم.')) return;
    const note = window.prompt('ملاحظة (اختياري):') ?? '';
    setBusy(id);
    try {
      await adminApi('/api/admin/card-orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, note }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return null;
  if (rows.length === 0) return <Empty>مفيش طلبات بطاقة لسه.</Empty>;
  const waiting = rows.filter((r) => r.status === 'paid' && !r.handedOverAt);
  const sorted = [...waiting, ...rows.filter((r) => !waiting.includes(r))];
  return (
    <Card title={`💳 طلبات البطاقة (${waiting.length} مدفوعة وفي انتظار التسليم)`}>
      <div className="space-y-2">
        {sorted.slice(0, 100).map((r) => {
          const st = STATUS[r.status] ?? { label: r.status, tone: 'gold' as const };
          return (
            <div key={r.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-xs text-gray-400" dir="ltr">{r.propertyId ?? '—'}</p>
                <span className="shrink-0 font-bold" style={{ color: GOLD }} dir="ltr">{(r.amountMinor / 100).toFixed(2)} {r.currency}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
                <Badge tone={st.tone}>{st.label}</Badge>
                {r.handedOverAt ? <Badge tone="green">تم التسليم</Badge> : null}
                <span>{fmtDate(r.createdAt)}</span>
                <span className="truncate" dir="ltr">{r.uid}</span>
              </div>
              {r.note ? <p className="mt-1 text-xs text-gray-500" dir="auto">📝 {r.note}</p> : null}
              {r.status === 'paid' && !r.handedOverAt && (
                <div className="mt-2"><Btn small onClick={() => handOver(r.id)} disabled={busy === r.id}>✅ تم تسليم العقار</Btn></div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
