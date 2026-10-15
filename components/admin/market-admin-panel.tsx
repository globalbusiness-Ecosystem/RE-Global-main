'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Stat, Badge, fmtDate } from './admin-ui';

type Listing = { id: string; propertyTitle: string; sellerName: string; shares: number; pricePerShare: number; feePct: number | null; status: string; reserved: boolean; soldTo: string | null; createdAt: string | null };
type Transfer = { id: string; propertyId: string; fromName: string | null; buyerName: string; shares: number; amount: number; fee: number; status: string; createdAt: string | null };
type Data = { totals: { open: number; sold: number; review: number; volume: number; fees: number }; listings: Listing[]; transfers: Transfer[] };

const L_LABEL: Record<string, string> = { open: 'معروض', sold: 'اتباع', cancelled: 'ملغي' };

// Admin view of the shares market: what is for sale, what was sold, what needs a manual look, and the fees earned.
export default function MarketAdminPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    adminApi<Data>('/api/admin/market')
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (id: string) => {
    if (!window.confirm('تشيل العرض ده من السوق؟')) return;
    setBusy(id); setError('');
    try {
      await adminApi('/api/admin/market', { method: 'PATCH', body: JSON.stringify({ listingId: id }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (!data) return error ? <p className="text-sm text-red-300">❌ {error}</p> : null;
  const { totals } = data;
  if (!data.listings.length && !data.transfers.length) return null;
  const review = data.transfers.filter((t) => t.status === 'review');
  return (
    <Card title="📈 سوق الحصص">
      {error && <p className="mb-2 text-xs text-red-300">❌ {error}</p>}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="معروض الآن" value={totals.open} />
        <Stat label="عمليات اتمّت" value={totals.sold} />
        <Stat label="حجم التداول" value={`${totals.volume} π`} />
        <Stat label="عمولات المنصة" value={`${totals.fees} π`} />
      </div>
      {review.length > 0 && (
        <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          ⚠️ {review.length} عملية محتاجة مراجعة (المشتري دفع والعرض اتلغى أو اتباع). في طلب استرداد معلّق ليها في "مستحقات سوق الحصص".
        </div>
      )}
      <div className="space-y-2">
        {data.listings.slice(0, 30).map((l) => (
          <div key={l.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate font-bold text-white">{l.propertyTitle}</p>
              <span className="shrink-0 text-xs text-gray-300">{l.shares} × {l.pricePerShare} π</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
              <Badge tone={l.status === 'open' ? 'gold' : l.status === 'sold' ? 'green' : 'gray'}>{L_LABEL[l.status] ?? l.status}</Badge>
              {l.reserved && <Badge tone="blue">حد بيدفع</Badge>}
              <span>@{l.sellerName}</span>
              {l.soldTo && <span>← @{l.soldTo}</span>}
              {l.feePct !== null && <span>· عمولة {l.feePct}%</span>}
              <span>{fmtDate(l.createdAt)}</span>
            </div>
            {l.status === 'open' && <div className="mt-2"><Btn small kind="danger" onClick={() => cancel(l.id)} disabled={busy === l.id || l.reserved}>إلغاء العرض</Btn></div>}
          </div>
        ))}
      </div>
    </Card>
  );
}
