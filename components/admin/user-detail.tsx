'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Badge, TYPE_LABELS, fmtDate } from './admin-ui';

type Row = { id: string; propertyTitle?: string; amount?: number; status?: string; createdAt: string | null; [k: string]: any };
type Detail = { owed: number; contracts: Row[]; bookings: Row[]; holdings: Row[]; listings: Row[]; payouts: Row[] };

function Section({ title, rows, line }: { title: string; rows: Row[]; line: (r: Row) => string }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-bold text-gray-300">{title} ({rows.length})</p>
      {rows.slice(0, 10).map((r) => (
        <p key={r.id} className="border-b border-[#222] py-1 text-xs text-gray-400 last:border-0">{line(r)} <span className="text-gray-600">· {fmtDate(r.createdAt)}</span></p>
      ))}
    </div>
  );
}

// Support view of one user: what they bought, booked, listed, and what the platform still owes them.
export default function UserDetail({ username, onUnauthorized }: { username: string; onUnauthorized: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi<Detail>(`/api/admin/user-detail?username=${encodeURIComponent(username)}`)
      .then(setD)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [username, onUnauthorized]);

  if (error) return <p className="text-xs text-red-300">❌ {error}</p>;
  if (!d) return <p className="text-xs text-gray-500">...جاري التحميل</p>;
  const empty = !d.contracts.length && !d.bookings.length && !d.holdings.length && !d.listings.length && !d.payouts.length;
  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
      {d.owed > 0 && <Badge tone="gold">مستحق له {d.owed} π (قيد التحويل)</Badge>}
      {empty && <p className="text-xs text-gray-500">مفيش نشاط مسجّل للمستخدم ده.</p>}
      <Section title="العقود" rows={d.contracts} line={(r) => `${TYPE_LABELS[r.type] ?? r.type} · ${r.propertyTitle} · ${r.amount} π`} />
      <Section title="الحجوزات" rows={d.bookings} line={(r) => `${r.propertyTitle} · ${r.start} → ${r.end} · ${r.amount} π · ${r.status}`} />
      <Section title="مشتريات الحصص" rows={d.holdings} line={(r) => `${r.propertyTitle} · ${r.shares} حصة · ${r.amount} π · ${r.status}`} />
      <Section title="عروض البيع" rows={d.listings} line={(r) => `${r.propertyTitle} · ${r.shares} × ${r.pricePerShare} π · ${r.status}`} />
      <Section title="المستحقات" rows={d.payouts} line={(r) => `${r.kind === 'refund' ? 'استرداد' : 'حصيلة بيع'} · ${r.amount} π · ${r.status === 'paid' ? 'اتحوّل' : 'معلّق'}`} />
    </div>
  );
}
