'use client';

import { useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Empty, fmtDate } from './admin-ui';

type Row = { id: string; listingId: string; reason: string; details: string; email: string; createdAt: string | null };
const REASON: Record<string, string> = { illegal: 'محتوى مخالف للقانون', scam: 'شكله نصب', misleading: 'معلومات مضللة', inappropriate: 'محتوى غير لائق', copyright: 'حقوق/ملكية', other: 'حاجة تانية' };

// Reports visitors sent about listings. Open the listing, decide, then close the report.
export default function ListingReportsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const fail = (e: unknown) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e instanceof Error ? e.message : 'خطأ'));
  const show = () => {
    setOpen(true);
    if (rows) return;
    adminApi<{ rows: Row[] }>('/api/admin/listing-reports').then((d) => setRows(d.rows)).catch(fail);
  };
  const close = (id: string, status: 'resolved' | 'dismissed') => {
    adminApi('/api/admin/listing-reports', { method: 'PATCH', body: JSON.stringify({ id, status }) })
      .then(() => setRows((r) => (r ? r.filter((x) => x.id !== id) : r)))
      .catch(fail);
  };

  if (!open) return <div className="text-center"><Btn kind="ghost" onClick={show}>🚩 بلاغات العقارات</Btn></div>;
  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return <Empty>...جاري التحميل</Empty>;
  return (
    <Card title="🚩 بلاغات العقارات">
      <p className="mb-2 text-[11px] text-gray-500">أي زائر يقدر يبلّغ عن عقار من صفحته العامة. افتح العقار، قرر، وبعدين اقفل البلاغ (بيتسجل في سجل النشاط).</p>
      {rows.length === 0 ? <Empty>مفيش بلاغات مفتوحة. 👌</Empty> : rows.map((r) => (
        <div key={r.id} className="border-b border-[#222] py-2 text-sm last:border-0">
          <a href={`/p/${r.listingId}`} target="_blank" rel="noopener noreferrer" className="text-white underline" dir="ltr">{r.listingId}</a>
          <span className="mx-2 text-xs text-gray-500">{REASON[r.reason] ?? r.reason} · {fmtDate(r.createdAt)}</span>
          {r.details && <p className="mt-1 text-xs text-gray-400">{r.details}</p>}
          {r.email && <p className="text-xs text-gray-600" dir="ltr">{r.email}</p>}
          <div className="mt-2 flex gap-2">
            <Btn small onClick={() => close(r.id, 'resolved')}>تم التعامل</Btn>
            <Btn small kind="ghost" onClick={() => close(r.id, 'dismissed')}>تجاهل</Btn>
          </div>
        </div>
      ))}
    </Card>
  );
}
