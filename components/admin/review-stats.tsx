'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Card, Stat, Badge } from './admin-ui';
import { LOW_RATING, reviewOverview, type ReviewRow } from '@/lib/review-stats';

// Admin: a quick read on guest satisfaction, above the review list. Hidden until there is at least one review.
export default function ReviewStats({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<ReviewRow[] | null>(null);

  useEffect(() => {
    adminApi<{ reviews: ReviewRow[] }>('/api/admin/reviews')
      .then((d) => setRows(d.reviews || []))
      .catch((e) => { if (e instanceof UnauthorizedError) onUnauthorized(); });
  }, [onUnauthorized]);

  if (!rows) return null;
  const o = reviewOverview(rows);
  if (o.count === 0) return null;
  return (
    <Card title="📊 رضا الضيوف">
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat label="المتوسط" value={`${o.avg.toFixed(1)} ★`} />
        <Stat label="تقييمات ظاهرة" value={o.count} />
        <Stat label="بدون رد" value={o.unanswered} />
      </div>
      <p className="mb-2 text-xs text-gray-400">العقارات من الأقل تقييماً للأعلى (آخر 100 تقييم)</p>
      <div className="space-y-1">
        {o.properties.map((p) => (
          <div key={p.title} className="flex items-center justify-between gap-2 rounded-lg bg-[#141414] px-3 py-2 text-xs">
            <span className="min-w-0 truncate text-gray-200">{p.title}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-gray-500">{p.count} تقييم</span>
              <Badge tone={p.avg < LOW_RATING ? 'red' : 'green'}>{p.avg.toFixed(1)} ★</Badge>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
