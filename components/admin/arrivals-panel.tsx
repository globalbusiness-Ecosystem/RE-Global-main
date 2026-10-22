'use client';

import { useCallback, useEffect, useState } from 'react';
import { downloadCsv } from '@/lib/csv-download';
import { ARRIVAL_WINDOWS, type ArrivalDay, type StayRow } from '@/lib/arrivals';
import { adminApi, UnauthorizedError, Btn, Card, Stat, Badge } from './admin-ui';

type Data = { from: string; days: number; groups: ArrivalDay[]; totals: { arrivals: number; departures: number; guests: number } };

function Row({ r, kind }: { r: StayRow; kind: 'in' | 'out' }) {
  return (
    <div className="rounded-lg bg-[#1a1a1a] p-2 text-xs text-gray-300">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-semibold text-white">{r.propertyTitle}</span>
        <span className="shrink-0 text-gray-400">@{r.username}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 text-gray-400">
        <span>{r.nights} ليلة</span>
        {r.guests ? <span>{r.guests} ضيف</span> : null}
        <span dir="ltr">{kind === 'in' ? `→ ${r.end}` : `${r.start} →`}</span>
      </div>
      {r.note ? <p className="mt-1 whitespace-pre-line break-words text-yellow-200">💬 {r.note}</p> : null}
    </div>
  );
}

// Admin: who arrives and who leaves over the next few days, with the guests' special requests.
export default function ArrivalsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  const load = useCallback((d: number) => {
    setError('');
    adminApi<Data>(`/api/admin/arrivals?days=${d}`)
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(days); }, [days, load]);

  if (!data) return error ? <p className="text-sm text-red-300">❌ {error}</p> : null;
  const csv = data.groups.flatMap((g) => [
    ...g.arrivals.map((r) => [g.day, 'arrival', r.propertyTitle, r.username, r.nights, r.guests ?? '', r.note ?? '']),
    ...g.departures.map((r) => [g.day, 'departure', r.propertyTitle, r.username, r.nights, r.guests ?? '', '']),
  ]);
  return (
    <Card title="🛎️ الوصول والمغادرة" right={csv.length ? <Btn small onClick={() => downloadCsv('arrivals', ['day', 'type', 'property', 'guest', 'nights', 'guests', 'request'], csv)}>⬇️ CSV</Btn> : null}>
      <div className="mb-3 flex gap-2">
        {ARRIVAL_WINDOWS.map((w) => (
          <Btn key={w} small kind={w === days ? 'gold' : 'ghost'} onClick={() => setDays(w)}>{w} أيام</Btn>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat label="وصول" value={data.totals.arrivals} />
        <Stat label="مغادرة" value={data.totals.departures} />
        <Stat label="ضيوف واصلين" value={data.totals.guests} />
      </div>
      {error && <p className="mb-2 text-xs text-red-300">❌ {error}</p>}
      {data.groups.length === 0 ? (
        <p className="text-xs text-gray-400">مفيش وصول ولا مغادرة في الفترة دي.</p>
      ) : (
        <div className="space-y-3">
          {data.groups.map((g) => (
            <div key={g.day} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-white" dir="ltr">{g.day}{g.day === data.from ? <Badge tone="gold">النهارده</Badge> : null}</p>
              <div className="space-y-2">
                {g.arrivals.length > 0 && <p className="text-xs font-semibold text-green-300">⬇️ وصول ({g.arrivals.length})</p>}
                {g.arrivals.map((r) => <Row key={`in-${r.id}`} r={r} kind="in" />)}
                {g.departures.length > 0 && <p className="text-xs font-semibold text-orange-300">⬆️ مغادرة ({g.departures.length})</p>}
                {g.departures.map((r) => <Row key={`out-${r.id}`} r={r} kind="out" />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
