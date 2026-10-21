'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge } from './admin-ui';

type Review = { id: string; propertyTitle: string; name: string; rating: number; comment: string; hidden: boolean; date: string };

// Admin: guest reviews of stays. A review can be hidden from the public page (and shown again); nothing is deleted.
export default function ReviewsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Review[] | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    adminApi<{ reviews: Review[] }>('/api/admin/reviews')
      .then((d) => setRows(d.reviews || []))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (r: Review) => {
    setBusy(r.id); setError('');
    try {
      await adminApi('/api/admin/reviews', { method: 'PATCH', body: JSON.stringify({ id: r.id, hidden: !r.hidden }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (!rows) return error ? <p className="text-sm text-red-300">❌ {error}</p> : null;
  if (rows.length === 0) return null;
  return (
    <Card title={`⭐ تقييمات الضيوف (${rows.length})`}>
      {error && <p className="mb-2 text-xs text-red-300">❌ {error}</p>}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className={`rounded-xl border border-[#2a2a2a] bg-[#141414] p-3 text-xs text-gray-300 ${r.hidden ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate font-semibold text-white">{r.propertyTitle}</span>
              <span className="shrink-0 text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            {r.comment && <p className="mt-1 whitespace-pre-line break-words">{r.comment}</p>}
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-gray-500">{r.name} · {r.date}</span>
              <span className="flex items-center gap-2">
                {r.hidden && <Badge>مخفي</Badge>}
                <Btn small kind="ghost" onClick={() => toggle(r)} disabled={busy === r.id}>{r.hidden ? 'اظهر' : 'اخفي'}</Btn>
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
