'use client';

import { bookingPhase, buildIcs, countdownText, daysUntil, myBookingStrings } from '@/lib/my-bookings';
import { formatDay, nightsLabel } from '@/lib/booking-i18n';
import { formatNumber } from '@/lib/format';
import { guestsText } from '@/lib/guests';
import { canReview } from '@/lib/stay-reviews';
import { ReviewForm } from '@/components/review-form';

export type Booked = { id: string; propertyTitle: string; propertyType: string; start: string; end: string; nights: number; amount: number; status: string; guests?: number; reviewed?: boolean };

function download(b: Booked) {
  const ics = buildIcs(b, new Date().toISOString());
  if (!ics) return;
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'booking.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// The signed-in user's stays: upcoming first, with a countdown, a readable status and an "add to calendar" file.
export function MyBookingsList({ bookings, language }: { bookings: Booked[]; language: string }) {
  const t = myBookingStrings(language);
  const today = new Date().toISOString().slice(0, 10);
  const rank = { current: 0, upcoming: 1, past: 2 } as const;
  const rows = bookings
    .map((b) => ({ b, phase: bookingPhase(b.start, b.end, today) }))
    .sort((x, y) => rank[x.phase] - rank[y.phase] || (x.phase === 'past' ? y.b.start.localeCompare(x.b.start) : x.b.start.localeCompare(y.b.start)));
  return (
    <section className="rounded-lg border border-accent/40 p-4 space-y-3" style={{ backgroundColor: '#1a2332' }}>
      <h2 className="text-sm font-bold text-accent">📅 {t.title} ({bookings.length})</h2>
      {rows.map(({ b, phase }) => {
        const cancelled = b.status === 'cancelled';
        const note = cancelled ? '' : phase === 'upcoming' ? countdownText(language, daysUntil(b.start, today)) : phase === 'current' ? t.current : t.past;
        return (
          <div key={b.id} className={`rounded-md border border-white/10 p-3 space-y-2 ${phase === 'past' || cancelled ? 'opacity-70' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{b.propertyTitle}</p>
                <p className="text-xs text-gray-400">{formatDay(b.start, language)} → {formatDay(b.end, language)} · {nightsLabel(language, b.nights)}{b.guests ? ` · ${guestsText(language, b.guests)}` : ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-accent text-sm font-bold">{formatNumber(b.amount, language, 2)} π</p>
                <p className={`text-[11px] ${b.status === 'review' ? 'text-yellow-400' : cancelled ? 'text-red-400' : 'text-green-400'}`}>
                  {b.status === 'review' ? t.review : cancelled ? t.cancelled : t.confirmed}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-300">{note}</span>
              {!cancelled && phase !== 'past' && (
                <button type="button" onClick={() => download(b)} className="rounded border border-accent/50 px-2 py-0.5 text-xs text-accent hover:bg-accent/10">📆 {t.addToCalendar}</button>
              )}
            </div>
            {canReview(b, today) && <ReviewForm bookingId={b.id} language={language} reviewed={b.reviewed} />}
          </div>
        );
      })}
    </section>
  );
}
