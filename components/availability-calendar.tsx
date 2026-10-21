'use client';

import { useMemo, useState } from 'react';
import type { BookingDates } from '@/lib/booking-rules';
import { applyPick, busyNights, calendarStrings, inRange, monthGrid, monthLabel, weekStartFor, weekdayLabels } from '@/lib/calendar-grid';

// A month calendar for picking check-in and check-out: taken nights are shaded and cannot start a stay.
export function AvailabilityCalendar({ busy, start, end, onPick, language, today }: {
  busy: BookingDates[]; start: string; end: string; onPick: (start: string, end: string) => void; language: string; today: string;
}) {
  const t = calendarStrings(language);
  const rtl = language === 'ar' || language === 'ur';
  const [view, setView] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const taken = useMemo(() => busyNights(busy), [busy]);
  const ws = weekStartFor(language);
  const weeks = useMemo(() => monthGrid(view.y, view.m, ws), [view, ws]);
  const heads = useMemo(() => weekdayLabels(language, ws), [language, ws]);
  const shift = (d: number) => setView((v) => { const n = v.y * 12 + v.m + d; return { y: Math.floor(n / 12), m: n % 12 }; });
  const sel = { start, end };
  const atNow = view.y * 12 + view.m <= Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1;
  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="rounded-lg border border-white/10 p-2">
      <div className="mb-1 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={atNow} aria-label={t.prev} className="px-2 text-accent disabled:opacity-30">{rtl ? '›' : '‹'}</button>
        <span className="text-sm font-semibold text-white">{monthLabel(view.y, view.m, language)}</span>
        <button type="button" onClick={() => shift(1)} aria-label={t.next} className="px-2 text-accent">{rtl ? '‹' : '›'}</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-gray-500">{heads.map((h, i) => <span key={i}>{h}</span>)}</div>
      <div className="mt-0.5 grid grid-cols-7 gap-0.5">
        {weeks.flat().map((d, i) => {
          if (!d) return <span key={i} />;
          const past = d < today;
          const busyDay = taken.has(d);
          const edge = d === start || d === end;
          const mid = inRange(d, sel);
          const cls = edge ? 'bg-accent text-black font-bold' : mid ? 'bg-accent/30 text-white' : busyDay ? 'bg-red-500/20 text-red-300 line-through' : past ? 'text-gray-600' : 'text-gray-200 hover:bg-white/10';
          return (
            <button key={i} type="button" disabled={past} aria-pressed={edge} aria-label={busyDay ? `${d} (${t.booked})` : d}
              onClick={() => { const n = applyPick(sel, d, taken, today); onPick(n.start, n.end); }}
              className={`h-8 rounded text-xs ${cls}`}>{Number(d.slice(8))}</button>
          );
        })}
      </div>
      <p className="mt-1 text-[10px] text-gray-500"><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-red-500/40 align-middle" /> {t.booked}</p>
    </div>
  );
}
