'use client';

import { useEffect, useMemo, useState } from 'react';
import { bookingTotal, overlaps, validateBooking, type BookingDates } from '@/lib/booking-rules';

// Check-in / check-out dates for a rent or hotel listing, with the taken days and the total in Pi.
// Calls onChange with the chosen dates and total only when they are valid and free.
export function BookingPicker({ propertyId, type, unitPi, language, onChange }: {
  propertyId: string;
  type: 'rent' | 'hotel';
  unitPi: number | null;
  language: string;
  onChange: (v: { booking: BookingDates; total: number } | null) => void;
}) {
  const ar = language === 'ar';
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
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

  const result = useMemo(() => {
    if (!start || !end) return { error: '' as string, value: null as null | { booking: BookingDates; total: number } };
    const v = validateBooking(type, { start, end }, Date.now());
    if (!v.ok) return { error: v.error, value: null };
    if (busy.some((b) => overlaps(b, v))) return { error: ar ? 'التواريخ دي محجوزة' : 'These dates are taken', value: null };
    const total = unitPi ? bookingTotal(type, unitPi, v.nights) : null;
    if (total === null) return { error: ar ? 'السعر مش متاح' : 'Price unavailable', value: null };
    return { error: '', value: { booking: { start: v.start, end: v.end }, total } };
  }, [start, end, busy, type, unitPi, ar]);

  useEffect(() => { onChange(result.value); }, [result.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = 'w-full rounded-lg bg-black/30 border border-white/10 p-2 text-sm text-white';
  const nights = result.value ? Math.round((Date.parse(result.value.booking.end) - Date.parse(result.value.booking.start)) / 86400000) : 0;
  return (
    <div className="space-y-2 rounded-xl border border-accent/20 p-3">
      <p className="text-sm font-semibold text-white">
        {type === 'hotel' ? (ar ? 'تواريخ الإقامة' : 'Stay dates') : (ar ? 'مدة الإيجار (30 ليلة أو أكتر)' : 'Rental period (30 nights or more)')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-400">{type === 'hotel' ? (ar ? 'دخول' : 'Check-in') : (ar ? 'من' : 'From')}
          <input type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} className={cls} />
        </label>
        <label className="text-xs text-gray-400">{type === 'hotel' ? (ar ? 'خروج' : 'Check-out') : (ar ? 'إلى' : 'To')}
          <input type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} className={cls} />
        </label>
      </div>
      {result.error && <p className="text-xs text-red-400">{result.error}</p>}
      {result.value && (
        <p className="text-sm text-accent font-bold">{nights} {ar ? 'ليلة' : 'nights'} · {result.value.total} π</p>
      )}
      {busy.length > 0 && (
        <p className="text-[11px] text-gray-500">{ar ? 'محجوز:' : 'Taken:'} {busy.map((b) => `${b.start}→${b.end}`).join(' · ')}</p>
      )}
    </div>
  );
}
