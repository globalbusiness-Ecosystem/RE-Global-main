'use client';

import { useEffect, useState } from 'react';
import { formatDay } from '@/lib/booking-i18n';
import { reviewCount, reviewStrings, starsText } from '@/lib/stay-reviews';

type Data = { summary: { count: number; avg: number }; reviews: { rating: number; comment: string; name: string; date: string }[] };

// Verified guest reviews of a hotel / rental: average first, then the latest comments. Hidden when there are none.
export function ReviewsList({ propertyId, language }: { propertyId: string; language: string }) {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    let alive = true;
    setData(null);
    fetch(`/api/reviews?propertyId=${encodeURIComponent(propertyId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d && d.summary) setData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [propertyId]);
  if (!data || data.summary.count === 0) return null;
  const t = reviewStrings(language);
  return (
    <section className="space-y-2 rounded-lg border border-white/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">{t.title}</h3>
        <p className="text-xs text-gray-300"><span className="text-yellow-400" aria-hidden>★</span> <span className="font-bold text-white">{data.summary.avg.toFixed(1)}</span> · {reviewCount(language, data.summary.count)}</p>
      </div>
      {data.reviews.map((r, i) => (
        <div key={i} className="rounded-md bg-white/5 p-2 text-xs text-gray-300">
          <div className="flex items-center justify-between gap-2">
            <span className="text-yellow-400" aria-label={`${r.rating}/5`}>{starsText(r.rating)}</span>
            <span className="text-[11px] text-gray-500">{r.name} · {r.date ? formatDay(r.date, language) : ''}</span>
          </div>
          {r.comment && <p className="mt-1 whitespace-pre-line break-words">{r.comment}</p>}
          <p className="mt-1 text-[10px] text-green-400">✓ {t.verified}</p>
        </div>
      ))}
    </section>
  );
}
