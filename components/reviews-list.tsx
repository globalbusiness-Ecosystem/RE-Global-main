'use client';

import { useEffect, useState } from 'react';
import { formatDay } from '@/lib/booking-i18n';
import { replyLabel } from '@/lib/review-reply';
import { reviewReportStrings } from '@/lib/review-report';
import { reviewCount, reviewStrings, starsText } from '@/lib/stay-reviews';

type Data = { summary: { count: number; avg: number }; reviews: { rid?: string; rating: number; comment: string; name: string; date: string; reply?: string }[] };

// Verified guest reviews of a hotel / rental: average first, then the latest comments. Hidden when there are none.
function ReportButton({ propertyId, rid, language }: { propertyId: string; rid: string; language: string }) {
  const t = reviewReportStrings(language);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const send = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/reviews/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId, rid }) });
      setState(res.ok ? 'done' : 'error');
    } catch { setState('error'); }
  };
  if (state === 'done') return <span className="text-[10px] text-gray-400" role="status">{t.done}</span>;
  return (
    <button type="button" onClick={send} disabled={state === 'sending'} className="text-[10px] text-gray-500 underline disabled:opacity-50">
      {state === 'sending' ? t.sending : state === 'error' ? t.error : `🚩 ${t.report}`}
    </button>
  );
}

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
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-[10px] text-green-400">✓ {t.verified}</p>
            {r.rid && <ReportButton propertyId={propertyId} rid={r.rid} language={language} />}
          </div>
          {r.reply && (
            <div className="mt-2 rounded-md border-s-2 border-yellow-500/60 bg-white/5 ps-2 py-1">
              <p className="text-[10px] font-bold text-yellow-400">{replyLabel(language)}</p>
              <p className="whitespace-pre-line break-words">{r.reply}</p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
