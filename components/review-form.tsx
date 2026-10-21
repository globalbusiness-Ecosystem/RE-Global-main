'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { REVIEW_COMMENT_MAX, reviewStrings } from '@/lib/stay-reviews';

// "Review this stay" for a finished booking: stars + an optional comment. One review per booking (the server enforces it).
export function ReviewForm({ bookingId, language, reviewed }: { bookingId: string; language: string; reviewed?: boolean }) {
  const { accessToken } = usePiAuth();
  const t = reviewStrings(language);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  if (reviewed || state === 'done') return <p className="text-xs text-green-400">✓ {state === 'done' ? t.thanks : t.reviewed}</p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="rounded border border-accent/50 px-2 py-0.5 text-xs text-accent hover:bg-accent/10">⭐ {t.button}</button>;

  const send = async () => {
    if (!accessToken || rating < 1) return;
    setState('sending'); setMsg('');
    try {
      const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ bookingId, rating, comment }) });
      if (r.ok || r.status === 409) { setState('done'); return; }
      setState('error'); setMsg(t.error);
    } catch { setState('error'); setMsg(t.error); }
  };

  return (
    <div className="space-y-2 rounded-md bg-white/5 p-2">
      <p className="text-xs text-gray-300">{t.rate}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={t.rate}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n}/5`} onClick={() => setRating(n)} className={`text-2xl leading-none ${n <= rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={REVIEW_COMMENT_MAX} rows={3} placeholder={t.placeholder} className="w-full rounded border border-white/10 bg-black/30 p-2 text-xs text-white" />
      {msg && <p className="text-xs text-red-400">{msg}</p>}
      <button type="button" onClick={send} disabled={rating < 1 || state === 'sending'} className="rounded bg-accent px-3 py-1 text-xs font-bold text-black disabled:opacity-50">{state === 'sending' ? t.sending : t.submit}</button>
    </div>
  );
}
