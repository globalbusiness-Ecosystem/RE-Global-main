'use client';

import { useEffect, useMemo, useState } from 'react';
import PayoutsPanel from './payouts-panel';
import MarketFeeSettings from './market-fee-settings';
import MarketAdminPanel from './market-admin-panel';
import BookingsPanel from './bookings-panel';
import { adminApi, UnauthorizedError, Btn, Card, Stat, Empty, Badge, inputCls, TYPE_LABELS, fmtDate, GOLD } from './admin-ui';

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function PaymentsTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [shown, setShown] = useState(30);

  useEffect(() => {
    adminApi<{ contracts: any[] }>('/api/admin/contracts')
      .then((d) => setRows(d.contracts))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (rows || []).filter((c) => (type === 'all' || c.type === type) && (!s || [c.propertyTitle, c.buyerUsername, c.id, c.txid].some((v) => String(v || '').toLowerCase().includes(s))));
  }, [rows, q, type]);

  const total = filtered.reduce((n, c) => n + (Number(c.amount) || 0), 0);
  const types = [...new Set((rows || []).map((c) => c.type).filter(Boolean))];

  const exportCsv = () => {
    const head = ['contract_id', 'date', 'property', 'buyer', 'type', 'amount', 'currency', 'status', 'txid'];
    const lines = filtered.map((c) => [c.id, c.createdAt, c.propertyTitle, c.buyerUsername, c.type, c.amount, c.currency, c.status, c.txid].map(csvCell).join(','));
    const blob = new Blob(['﻿' + [head.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return <Empty>...جاري التحميل</Empty>;

  return (
    <div className="space-y-3">
      <PayoutsPanel onUnauthorized={onUnauthorized} />
      <BookingsPanel onUnauthorized={onUnauthorized} />
      <MarketAdminPanel onUnauthorized={onUnauthorized} />
      <MarketFeeSettings onUnauthorized={onUnauthorized} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="عدد المدفوعات" value={filtered.length} />
        <Stat label="الإجمالي" value={`${total} π`} />
        <Stat label="المتوسط" value={filtered.length ? `${(total / filtered.length).toFixed(1)} π` : '—'} />
      </div>
      <Card title="المدفوعات والعقود الموقّعة" right={<Btn small kind="ghost" onClick={exportCsv} disabled={!filtered.length}>⬇️ تصدير CSV</Btn>}>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={inputCls} placeholder="🔍 عقار / مشتري / رقم عقد / txid" value={q} onChange={(e) => { setQ(e.target.value); setShown(30); }} />
          <select className={inputCls} value={type} onChange={(e) => { setType(e.target.value); setShown(30); }}>
            <option value="all">كل الأنواع</option>
            {types.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
          </select>
        </div>
      </Card>
      {filtered.length === 0 && <Empty>مفيش مدفوعات مطابقة.</Empty>}
      {filtered.slice(0, shown).map((c) => (
        <div key={c.id} className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate font-bold text-white">{c.propertyTitle}</p>
            <span className="shrink-0 font-bold" style={{ color: GOLD }}>{c.amount} {c.currency}</span>
          </div>
          <p className="text-xs text-gray-400">@{c.buyerUsername} · {fmtDate(c.createdAt)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Badge tone="gold">{TYPE_LABELS[c.type] || c.type}</Badge>
            <Badge tone={c.status === 'completed' ? 'green' : 'gray'}>{c.status}</Badge>
            <a href={'/verify/' + c.id} target="_blank" rel="noreferrer" className="text-xs text-blue-400">فتح العقد ↗</a>
          </div>
          {c.txid && <p className="mt-1 truncate text-[10px] text-gray-600" dir="ltr">tx: {c.txid}</p>}
        </div>
      ))}
      {filtered.length > shown && <div className="text-center"><Btn kind="ghost" onClick={() => setShown(shown + 30)}>عرض المزيد ({filtered.length - shown})</Btn></div>}
    </div>
  );
}
