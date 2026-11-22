'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge } from './admin-ui';

type Item = { id: string; title: string; location: string };

// The home "virtual tours" entry: switch it off for visitors, and see which listings are tours (the ones with a 360 link).
export default function ToursSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [demo, setDemo] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ enabled: boolean; demo: boolean; items: Item[] }>('/api/admin/tours')
      .then((d) => { setEnabled(d.enabled); setDemo(d.demo); setItems(d.items); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const toggle = async () => {
    if (enabled === null) return;
    const next = !enabled;
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/tours', { method: 'PUT', body: JSON.stringify({ enabled: next }) });
      setEnabled(next);
      setMsg('✅ اتحفظ. التغيير بيوصل للزوار خلال دقيقة تقريباً.');
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + (e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <Card title="🎥 الجولات الافتراضية 360°">
      <p className="mb-3 text-xs text-muted-foreground">زرار واحد في الرئيسية للجولات. اللي بيظهر فيه هو العقارات اللي ليها رابط جولة 360 (من تعديل العقار ← رابط جولة VR)، وبعدها الجولة التجريبية لو العقارات التجريبية ظاهرة.</p>
      <p className="mb-3 text-sm text-foreground">الحالة: {enabled === null ? '...' : enabled ? '👁 ظاهر للزوار' : '🙈 مخفي عن الزوار'}</p>
      <Btn onClick={toggle} disabled={busy || enabled === null}>{busy ? '...' : enabled ? '🙈 اخفيه' : '👁 اظهره'}</Btn>
      {msg && <p className="mt-2 text-xs text-foreground">{msg}</p>}
      <p className="mb-2 mt-4 text-sm font-semibold text-foreground">العقارات اللي ليها جولة ({items.length}){demo ? ' + الجولة التجريبية' : ''}</p>
      {items.length === 0 ? <p className="text-xs text-muted-foreground">مفيش عقار ليه رابط جولة لسه.</p> : (
        <ul className="space-y-1">
          {items.map((i) => <li key={i.id} className="flex flex-wrap items-center gap-2 text-sm text-foreground"><Badge tone="blue">🥽 360</Badge><span dir="auto">{i.title}</span><span className="text-xs text-muted-foreground" dir="auto">{i.location}</span></li>)}
        </ul>
      )}
    </Card>
  );
}
