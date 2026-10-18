'use client';

import { useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Empty, fmtDate } from './admin-ui';

type Row = { id: string; kind: string; message: string; stack: string; page: string; count: number; lastAt: string | null; firstAt: string | null };
const KIND: Record<string, string> = { render: 'تعطّل صفحة', script: 'خطأ سكريبت', promise: 'وعد مرفوض' };

// Errors that visitors' browsers hit: one row per kind of error, with how often and where.
export default function ClientErrorsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const show = () => {
    setOpen(true);
    if (rows) return;
    adminApi<{ rows: Row[] }>('/api/admin/client-errors')
      .then((d) => setRows(d.rows))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  };

  if (!open) return <div className="text-center"><Btn kind="ghost" onClick={show}>🐞 أخطاء المستخدمين</Btn></div>;
  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return <Empty>...جاري التحميل</Empty>;
  return (
    <Card title="🐞 أخطاء المستخدمين">
      <p className="mb-2 text-[11px] text-gray-500">أي صفحة بتتعطل عند مستخدم بتتسجل هنا (من غير بيانات شخصية). أول مرة يظهر خطأ جديد بتوصلك رسالة على الإيميل.</p>
      {rows.length === 0 ? <Empty>مفيش أخطاء متسجلة. 👌</Empty> : rows.map((r) => (
        <div key={r.id} className="border-b border-[#222] py-2 text-sm last:border-0">
          <span className="text-white" dir="ltr">{r.message}</span>
          <span className="mx-2 text-xs text-gray-500">{KIND[r.kind] ?? r.kind} · {r.count}×</span>
          <span className="block text-xs text-gray-600" dir="ltr">{r.page} · {fmtDate(r.lastAt)}</span>
          {r.stack && <pre className="mt-1 whitespace-pre-wrap text-[10px] text-gray-600" dir="ltr">{r.stack}</pre>}
        </div>
      ))}
    </Card>
  );
}
