'use client';

import { useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Empty } from './admin-ui';

// Download a collection as a JSON file (properties, contracts, shares, payouts...). Opens on demand.
export default function BackupPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [list, setList] = useState<Record<string, string> | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const fail = (e: unknown) => (e instanceof UnauthorizedError ? onUnauthorized() : setError((e as Error).message));

  const show = () => {
    setOpen(true);
    if (list) return;
    adminApi<{ collections: Record<string, string> }>('/api/admin/backup').then((d) => setList(d.collections)).catch(fail);
  };

  const download = async (name: string) => {
    setBusy(name); setError('');
    try {
      const res = await fetch('/api/admin/backup?c=' + encodeURIComponent(name), { credentials: 'same-origin' });
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) throw new Error(res.status === 429 ? 'محاولات كتير، استنى شوية.' : 'فشل التنزيل');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = 're-global-' + name + '-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { fail(e); } finally { setBusy(''); }
  };

  if (!open) return <div className="text-center"><Btn kind="ghost" onClick={show}>💾 نسخة احتياطية (JSON)</Btn></div>;
  if (!list) return error ? <Empty>❌ {error}</Empty> : <Empty>...جاري التحميل</Empty>;
  return (
    <Card title="💾 نسخة احتياطية (JSON)">
      <p className="mb-2 text-[11px] text-gray-500">نزّل أي مجموعة بيانات كملف. بيانات الأعمال بس (من غير إيميلات أو أكواد). احتفظ بالملفات في مكان آمن.</p>
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {Object.entries(list).map(([k, label]) => (
          <Btn key={k} small kind="ghost" disabled={busy !== ''} onClick={() => download(k)}>{busy === k ? '...' : '⬇️ ' + label}</Btn>
        ))}
      </div>
    </Card>
  );
}
