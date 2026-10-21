'use client';

import { useEffect, useMemo, useState } from 'react';
import { bookingTotal, overlaps, validateBooking, type BookingDates } from '@/lib/booking-rules';
import { bookingErrorText, bookingStrings, formatDay, nightsLabel } from '@/lib/booking-i18n';
import { formatNumber } from '@/lib/format';
import { guestStrings } from '@/lib/guests';
import { AvailabilityCalendar } from '@/components/availability-calendar';

// Check-in / check-out dates for a rent or hotel listing, with the taken days and the total in Pi.
// Calls onChange with the chosen dates and total only when they are valid and free.
export function BookingPicker({ propertyId, type, unitPi, language, maxGuests, onChange }: {
  propertyId: string;
  type: 'rent' | 'hotel';
  unitPi: number | null;
  language: string;
  maxGuests?: number;
  onChange: (v: { booking: BookingDates; total: number } | null) => void;
}) {
  const t = bookingStrings(language);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [guests, setGuests] = useState(1);
  const [busy, setBusy] = useState<BookingDates[]>([]);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let alive = true;
    fetch(`/api/bookings/availability?propertyId=${encodeURIComponent(propertyId)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive && Array.isArray(d.busy)) setBusy(d.busy); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [propertyId]);

  const askGuests = Number.isInteger(maxGuests) && (maxGuests as number) >= 1;
  const result = useMemo(() => {
    if (!start || !end) return { error: '' as string, value: null as null | { booking: BookingDates; total: number; nights: number } };
    const v = validateBooking(type, { start, end }, Date.now());
    if (!v.ok) return { error: bookingErrorText(language, v.code, v.limit), value: null };
    if (busy.some((b) => overlaps(b, v))) return { error: t.unavailable, value: null };
    const total = unitPi ? bookingTotal(type, unitPi, v.nights) : null;
    if (total === null) return { error: t.noPrice, value: null };
    return { error: '', value: { booking: { start: v.start, end: v.end, ...(askGuests ? { guests } : {}) }, total, nights: v.nights } };
  }, [start, end, busy, type, unitPi, language, t, guests, askGuests]);

  useEffect(() => { onChange(result.value ? { booking: result.value.booking, total: result.value.total } : null); }, [result.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = 'w-full rounded-lg bg-black/30 border border-white/10 p-2 text-sm text-white';
  const hotel = type === 'hotel';
  return (
    <div className="space-y-2 rounded-xl border border-accent/20 p-3">
      <p className="text-sm font-semibold text-white">{hotel ? t.stayDates : t.rentalPeriod}</p>
      <AvailabilityCalendar busy={busy} start={start} end={end} language={language} today={today} onPick={(s, e) => { setStart(s); setEnd(e); }} />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-400">{hotel ? t.checkIn : t.from}
          <input type="date" lang="en" min={today} value={start} onChange={(e) => setStart(e.target.value)} className={cls} />
        </label>
        <label className="text-xs text-gray-400">{hotel ? t.checkOut : t.to}
          <input type="date" lang="en" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} className={cls} />
        </label>
      </div>
      {askGuests && (
        <label className="block text-xs text-gray-400">{guestStrings(language).label}
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={cls}>
            {Array.from({ length: maxGuests as number }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      )}
      {result.error && <p className="text-xs text-red-400" role="alert">{result.error}</p>}
      {result.value && (
        <div className="space-y-0.5">
          <p className="text-xs text-gray-300">{formatDay(result.value.booking.start, language)} → {formatDay(result.value.booking.end, language)}</p>
          <p className="text-sm text-accent font-bold">{nightsLabel(language, result.value.nights)} · {t.total}: {formatNumber(result.value.total, language, 2)} π</p>
        </div>
      )}
      {busy.length > 0 && (
        <p className="text-[11px] text-gray-500">{t.taken}: {busy.map((b) => `${formatDay(b.start, language)} → ${formatDay(b.end, language)}`).join(' · ')}</p>
      )}
    </div>
  );
}
