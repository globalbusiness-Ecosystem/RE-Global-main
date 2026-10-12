'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, inputCls, TYPE_LABELS, STATUS_LABELS, GOLD } from './admin-ui';
import PropertyForm from './property-form';

const PAGE = 20;

export default function PropertiesTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [view, setView] = useState('all');
  const [shown, setShown] = useState(PAGE);
  const [editing, setEditing] = useState<any | null | undefined>(undefined); // undefined = closed, null = new

  const fail = useCallback((e: any) => (e instanceof UnauthorizedError ? onUnauthorized() : alert('❌ ' + e.message)), [onUnauthorized]);

  const load = useCallback(() => {
    adminApi<{ properties: any[] }>('/api/admin/properties')
      .then((d) => { setItems(d.properties); setError(''); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (items || []).filter((p) => {
      if (type !== 'all' && p.type !== type) return false;
      if (view === 'hidden' && p.hidden !== true) return false;
      if (view === 'visible' && p.hidden === true) return false;
      if (view === 'featured' && p.featured !== true) return false;
      if (view === 'sold' && p.status !== 'sold') return false;
      return !s || [p.title, p.location, p.id].some((v) => String(v || '').toLowerCase().includes(s));
    });
  }, [items, q, type, view]);

  const patch = (id: string, p: Record<string, unknown>) =>
    adminApi('/api/admin/properties?id=' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify({ patch: p }) })
      .then(() => setItems((cur) => (cur || []).map((x) => (x.id === id ? { ...x, ...p } : x))))
      .catch(fail);

  const remove = (p: any) => {
    if (!confirm(`تأكيد حذف "${p.title}" نهائياً؟ (لو عايز بس تخفيه، استخدم زرار الإخفاء)`)) return;
    adminApi('/api/admin/properties?id=' + encodeURIComponent(p.id), { method: 'DELETE' })
      .then(() => setItems((cur) => (cur || []).filter((x) => x.id !== p.id)))
      .catch(fail);
  };

  if (editing !== undefined) {
    return <PropertyForm initial={editing} onCancel={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />;
  }

  return (
    <div className="space-y-3">
      <Card title={`العقارات (${items?.length ?? '…'})`} right={<Btn small onClick={() => setEditing(null)}>➕ عقار جديد</Btn>}>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className={inputCls} placeholder="🔍 بحث بالعنوان أو الموقع أو المعرّف" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} />
          <select className={inputCls} value={type} onChange={(e) => { setType(e.target.value); setShown(PAGE); }}>
            <option value="all">كل الأنواع</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select className={inputCls} value={view} onChange={(e) => { setView(e.target.value); setShown(PAGE); }}>
            <option value="all">الكل</option><option value="visible">ظاهر للزوار</option><option value="hidden">مخفي</option>
            <option value="featured">مميز</option><option value="sold">مباع</option>
          </select>
        </div>
      </Card>

      {error && <Empty>❌ {error}</Empty>}
      {!items && !error && <Empty>...جاري التحميل</Empty>}
      {items && filtered.length === 0 && <Empty>{items.length === 0 ? 'لسه مفيش عقارات. اضغط "عقار جديد" لإضافة أول عقار.' : 'مفيش نتائج مطابقة.'}</Empty>}

      {filtered.slice(0, shown).map((p) => (
        <div key={p.id} className={`flex gap-3 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-3 ${p.hidden ? 'opacity-60' : ''}`}>
          {p.image ? <img src={p.image} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" /> : <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-[#1f1f1f] text-2xl">🏠</div>}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-white">{p.title}</p>
            <p className="truncate text-xs text-gray-400">{p.location} · <span style={{ color: GOLD }}>{p.price} {p.currency}</span></p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge tone="gold">{TYPE_LABELS[p.type] || p.type}</Badge>
              <Badge tone={p.status === 'sold' ? 'red' : 'green'}>{STATUS_LABELS[p.status] || p.status}</Badge>
              {p.featured && <Badge tone="gold">⭐ مميز</Badge>}
              {p.hidden && <Badge tone="red">🙈 مخفي</Badge>}
              {p.tokenized && <Badge tone="blue">Tokenized</Badge>}
              {p.vrUrl && <Badge tone="blue">🥽 VR</Badge>}
              {p.contractUrl && <Badge>📄 عقد</Badge>}
              {!(p.lat !== undefined && p.lng !== undefined) && <Badge>بدون موقع خريطة</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Btn small kind="ghost" onClick={() => setEditing(p)}>✏️ تعديل</Btn>
              <Btn small kind="ghost" onClick={() => patch(p.id, { featured: !p.featured })}>{p.featured ? 'إلغاء التمييز' : '⭐ تمييز'}</Btn>
              <Btn small kind="ghost" onClick={() => patch(p.id, { hidden: !p.hidden })}>{p.hidden ? '👁 إظهار' : '🙈 إخفاء'}</Btn>
              <Btn small kind="ghost" onClick={() => patch(p.id, { status: p.status === 'sold' ? 'available' : 'sold' })}>{p.status === 'sold' ? 'تعيين متاح' : 'تعيين مباع'}</Btn>
              <Btn small kind="danger" onClick={() => remove(p)}>حذف</Btn>
            </div>
          </div>
        </div>
      ))}
      {filtered.length > shown && <div className="text-center"><Btn kind="ghost" onClick={() => setShown(shown + PAGE)}>عرض المزيد ({filtered.length - shown})</Btn></div>}
    </div>
  );
}
