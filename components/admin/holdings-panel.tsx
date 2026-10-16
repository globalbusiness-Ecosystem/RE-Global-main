'use client';

import { useCallback, useEffect, useState } from 'react';
import { downloadCsv } from '@/lib/csv-download';
import { adminApi, UnauthorizedError, Btn, Card, Stat, Badge, fmtDate } from './admin-ui';

type Holding = { id: string; propertyTitle: string; username: string; shares: number; totalShares: number; amount: number; status: string; createdAt: string | null };
type Data = { totals: { confirmed: number; shares: number; volume: number; review: number }; holdings: Holding[] };

const LABEL: Record<string, string> = { confirmed: 'مؤكد', review: 'مراجعة', cancelled: 'ملغي' };

// Admin view of shares bought from the platform: totals, cases needing a look, and cancel + refund.
export default function HoldingsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    adminApi<Data>('/api/admin/holdings')
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (h: Holding) => {
    if (!window.confirm(`تلغي شراء @${h.username} (${h.shares} حصة) وترجّعله ${h.amount} π؟`)) return;
    setBusy(h.id); setError('');
    try {
      await adminApi('/api/admin/holdings', { method: 'PATCH', body: JSON.stringify({ id: h.id }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (!data) return error ? <p className="text-sm text-red-300">❌ {error}</p> : null;
  if (!data.holdings.length) return null;
  const { totals } = data;
  return (
    <Card title="🧩 مشتريات الحصص" right={<Btn small onClick={() => downloadCsv('share-purchases', ['id', 'property', 'buyer', 'shares', 'totalShares', 'amount', 'status', 'created'], data.holdings.map((x) => [x.id, x.propertyTitle, x.username, x.shares, x.totalShares, x.amount, x.status, x.createdAt ?? '']))}>⬇️ CSV</Btn>}>
      {error && <p className="mb-2 text-xs text-red-300">❌ {error}</p>}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="مشتريات مؤكدة" value={totals.confirmed} />
        <Stat label="حصص مباعة" value={totals.shares} />
        <Stat label="قيمة المشتريات" value={`${totals.volume} π`} />
      </div>
      {totals.review > 0 && (
        <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          ⚠️ {totals.review} شراء محتاج مراجعة (المشتري دفع بعد ما الحصص خلصت). الغيه عشان يتعمله استرداد.
        </div>
      )}
      <div className="space-y-2">
        {data.holdings.slice(0, 30).map((h) => (
          <div key={h.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate font-bold text-white">{h.propertyTitle}</p>
              <span className="shrink-0 text-xs text-gray-300">{h.amount} π</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
              <Badge tone={h.status === 'confirmed' ? 'green' : h.status === 'review' ? 'red' : 'gray'}>{LABEL[h.status] ?? h.status}</Badge>
              <span>@{h.username}</span>
              <span>{h.shares} / {h.totalShares} حصة</span>
              <span>{fmtDate(h.createdAt)}</span>
            </div>
            {(h.status === 'confirmed' || h.status === 'review') && (
              <div className="mt-2"><Btn small kind="danger" onClick={() => cancel(h)} disabled={busy === h.id}>إلغاء + استرداد</Btn></div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
