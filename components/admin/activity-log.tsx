'use client';

import { useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Empty, inputCls, fmtDate } from './admin-ui';
import { AUDIT_LABELS, auditLabel, auditSummary } from '@/lib/audit-labels';
import { downloadCsv } from '@/lib/csv-download';

type Row = { id: string; action: string; detail: Record<string, unknown>; at: string | null };

// The full admin activity log (last 200 actions): who changed what and when. Opens on demand, filter by action, export to CSV.
export default function ActivityLog({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState('all');

  const show = () => {
    setOpen(true);
    if (rows) return;
    adminApi<{ rows: Row[] }>('/api/admin/audit')
      .then((d) => setRows(d.rows))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  };

  if (!open) return <div className="text-center"><Btn kind="ghost" onClick={show}>📜 سجل النشاط الكامل</Btn></div>;
  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return <Empty>...جاري التحميل</Empty>;

  const shown = rows.filter((r) => action === 'all' || r.action === action);
  const used = [...new Set(rows.map((r) => r.action))];
  return (
    <Card
      title={`📜 سجل النشاط (${shown.length})`}
      right={<Btn small kind="ghost" disabled={!shown.length} onClick={() => downloadCsv('admin-activity', ['date', 'action', 'details'], shown.map((r) => [r.at ?? '', auditLabel(r.action), auditSummary(r.action, r.detail)]))}>⬇️ CSV</Btn>}
    >
      <select className={inputCls} value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="all">كل العمليات</option>
        {used.map((a) => <option key={a} value={a}>{AUDIT_LABELS[a] ?? a}</option>)}
      </select>
      <div className="mt-2">
        {shown.length === 0 ? <Empty>مفيش عمليات مطابقة.</Empty> : shown.map((r) => (
          <div key={r.id} className="border-b border-[#222] py-2 text-sm last:border-0">
            <span className="text-white">{auditLabel(r.action)}</span>
            <span className="mx-2 text-xs text-gray-500">{auditSummary(r.action, r.detail)}</span>
            <span className="block text-xs text-gray-600">{fmtDate(r.at)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
