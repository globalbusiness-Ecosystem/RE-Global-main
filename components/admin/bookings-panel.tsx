'use client';

import { useCallback, useEffect, useState } from 'react';
import { downloadCsv } from '@/lib/csv-download';
import { adminApi, UnauthorizedError, Btn, Card, Stat, Badge } from './admin-ui';

type Booking = { id: string; propertyTitle: string; propertyType: string; username: string; start: string; end: string; nights: number; amount: number; status: string; guests?: number };
type Data = { totals: { confirmed: number; upcoming: number; nights: number; revenue: number; review: number }; bookings: Booking[] };

const LABEL: Record<string, string> = { confirmed: 'مؤكد', review: 'مراجعة', cancelled: 'ملغي' };

// Admin view of dated bookings (rent / hotel): what is booked, what needs a look, and cancel + refund.
export default function BookingsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    adminApi<Data>('/api/admin/bookings')
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (b: Booking) => {
    if (!window.confirm(`تلغي حجز @${b.username} وترجّعله ${b.amount} π؟ الأيام هترجع متاحة.`)) return;
    setBusy(b.id); setError('');
    try {
      await adminApi('/api/admin/bookings', { method: 'PATCH', body: JSON.stringify({ id: b.id }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (!data) return error ? <p className="text-sm text-red-300">❌ {error}</p> : null;
  if (!data.bookings.length) return null;
  const { totals } = data;
  return (
    <Card title="🗓️ الحجوزات" right={<Btn small onClick={() => downloadCsv('bookings', ['id', 'property', 'guest', 'start', 'end', 'nights', 'amount', 'status'], data.bookings.map((x) => [x.id, x.propertyTitle, x.username, x.start, x.end, x.nights, x.amount, x.status]))}>⬇️ CSV</Btn>}>
      {error && <p className="mb-2 text-xs text-red-300">❌ {error}</p>}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="حجوزات مؤكدة" value={totals.confirmed} />
        <Stat label="قادمة" value={totals.upcoming} />
        <Stat label="إجمالي الليالي" value={totals.nights} />
        <Stat label="الإيراد" value={`${totals.revenue} π`} />
      </div>
      {totals.review > 0 && (
        <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          ⚠️ {totals.review} حجز محتاج مراجعة (الضيف دفع بعد ما الأيام اتاخدت). الغيه عشان يتعمله استرداد.
        </div>
      )}
      <div className="space-y-2">
        {data.bookings.slice(0, 30).map((b) => (
          <div key={b.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate font-bold text-white">{b.propertyTitle}</p>
              <span className="shrink-0 text-xs text-gray-300">{b.amount} π</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
              <Badge tone={b.status === 'confirmed' ? 'green' : b.status === 'review' ? 'red' : 'gray'}>{LABEL[b.status] ?? b.status}</Badge>
              <span>@{b.username}</span>
              <span dir="ltr">{b.start} → {b.end}</span>
              <span>· {b.nights} ليلة</span>
              {b.guests ? <span>· {b.guests} ضيف</span> : null}
            </div>
            {(b.status === 'confirmed' || b.status === 'review') && (
              <div className="mt-2"><Btn small kind="danger" onClick={() => cancel(b)} disabled={busy === b.id}>إلغاء + استرداد</Btn></div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
