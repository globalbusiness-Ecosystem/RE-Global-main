'use client';

import { useCallback, useEffect, useState } from 'react';
import { downloadCsv } from '@/lib/csv-download';
import { WINDOWS } from '@/lib/occupancy';
import { adminApi, UnauthorizedError, Btn, Card, Stat } from './admin-ui';

type Row = { id: string; title: string; type: string; booked: number; blocked: number; free: number; sellable: number; rate: number | null; nextFree: string | null };
type Data = { days: number; from: string; overall: number | null; rows: Row[] };

const pct = (n: number | null) => (n === null ? '—' : `${n}%`);

// Admin: how full each hotel / rental is over the next 7, 30 or 90 days, with the first free night.
export default function OccupancyPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  const load = useCallback((d: number) => {
    setError('');
    adminApi<Data>(`/api/admin/occupancy?days=${d}`)
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(days); }, [days, load]);

  if (!data) return error ? <p className="text-sm text-red-300">❌ {error}</p> : null;
  if (!data.rows.length) return null;
  const booked = data.rows.reduce((n, r) => n + r.booked, 0);
  const blocked = data.rows.reduce((n, r) => n + r.blocked, 0);
  return (
    <Card
      title="📊 الإشغال"
      right={<Btn small onClick={() => downloadCsv('occupancy', ['id', 'title', 'type', 'days', 'booked', 'blocked', 'free', 'rate_pct', 'next_free'], data.rows.map((r) => [r.id, r.title, r.type, data.days, r.booked, r.blocked, r.free, r.rate ?? '', r.nextFree ?? '']))}>⬇️ CSV</Btn>}
    >
      <div className="mb-3 flex gap-2">
        {WINDOWS.map((w) => (
          <Btn key={w} small kind={w === days ? 'gold' : 'ghost'} onClick={() => setDays(w)}>{w} يوم</Btn>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat label="نسبة الإشغال" value={pct(data.overall)} />
        <Stat label="ليالي محجوزة" value={booked} />
        <Stat label="ليالي مقفولة" value={blocked} />
      </div>
      {error && <p className="mb-2 text-xs text-red-300">❌ {error}</p>}
      <div className="space-y-2">
        {data.rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3 text-xs text-gray-300">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate font-semibold text-white">{r.title}</span>
              <span className="shrink-0 font-bold text-[#d4af37]" dir="ltr">{pct(r.rate)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded bg-[#2a2a2a]">
              <div className="h-full bg-[#d4af37]" style={{ width: `${Math.min(100, r.rate ?? 0)}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-gray-400">
              <span>محجوز {r.booked}</span>
              <span>مقفول {r.blocked}</span>
              <span>فاضي {r.free}</span>
              <span dir="ltr">أول ليلة فاضية: {r.nextFree ?? '—'}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
