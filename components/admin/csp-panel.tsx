'use client';

import { useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Empty, fmtDate } from './admin-ui';

type Row = { id: string; directive: string; blocked: string; page: string; count: number; lastAt: string | null };

// Report-only content security policy: shows which outside sources the site really loads. Nothing is blocked.
export default function CspPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const show = () => {
    setOpen(true);
    if (rows) return;
    adminApi<{ rows: Row[] }>('/api/admin/csp-reports')
      .then((d) => setRows(d.rows))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  };

  if (!open) return <div className="text-center"><Btn kind="ghost" onClick={show}>🛡️ تقرير سياسة الأمان (تجريبي)</Btn></div>;
  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return <Empty>...جاري التحميل</Empty>;
  return (
    <Card title="🛡️ تقرير سياسة الأمان (تجريبي)">
      <p className="mb-2 text-[11px] text-gray-500">المتصفحات بتبلّغ هنا عن المصادر اللي الموقع بيحمّل منها (سكريبتات، صور، اتصالات). مفيش حاجة بتتحجب. الهدف نعرف القائمة الحقيقية قبل ما نفعّل سياسة صارمة.</p>
      {rows.length === 0 ? <Empty>لسه مفيش بلاغات.</Empty> : rows.map((r) => (
        <div key={r.id} className="border-b border-[#222] py-2 text-sm last:border-0">
          <span className="text-white" dir="ltr">{r.blocked}</span>
          <span className="mx-2 text-xs text-gray-500" dir="ltr">{r.directive} · {r.count}×</span>
          <span className="block text-xs text-gray-600" dir="ltr">{r.page} · {fmtDate(r.lastAt)}</span>
        </div>
      ))}
    </Card>
  );
}
