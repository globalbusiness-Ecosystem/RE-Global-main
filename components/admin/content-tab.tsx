'use client';

import { useCallback, useEffect, useState } from 'react';
import TextsEditor from './texts-editor';
import PricingSettings from './pricing-settings';
import LegalSettings from './legal-settings';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, Field, inputCls, GOLD } from './admin-ui';

type Kind = 'banners' | 'partners';
type FieldDef = { k: string; label: string; type?: 'text' | 'textarea' | 'number' | 'image' | 'select'; opts?: Record<string, string> };

const PAGES: Record<string, string> = {
  '': 'بدون زرار', buy: 'شراء', rent: 'إيجار', hotel: 'فنادق', invest: 'استثمار', tokenized: 'رمزية',
  abroad: 'عقارات الخارج', offplan: 'أوف بلان', map: 'الخريطة', partners: 'الشركاء',
};

const CONFIG: Record<Kind, { title: string; hint: string; empty: string; fields: FieldDef[]; nameKey: string; imgKey: string }> = {
  banners: {
    title: '🖼️ بانرات الصفحة الرئيسية',
    hint: 'لو ضفت بانر واحد على الأقل، الشرائح الافتراضية بتختفي ويظهر بانراتك بالترتيب. لو مسحتهم كلهم الافتراضي يرجع.',
    empty: 'مفيش بانرات. الموقع بيعرض الشرائح الافتراضية.',
    nameKey: 'title', imgKey: 'image',
    fields: [
      { k: 'title', label: 'العنوان (English)' }, { k: 'titleAr', label: 'العنوان (عربي)' },
      { k: 'subtitle', label: 'الوصف (English)', type: 'textarea' }, { k: 'subtitleAr', label: 'الوصف (عربي)', type: 'textarea' },
      { k: 'image', label: 'صورة البانر', type: 'image' },
      { k: 'buttonLabel', label: 'نص الزرار (English) اختياري' }, { k: 'buttonLabelAr', label: 'نص الزرار (عربي)' },
      { k: 'link', label: 'الزرار يفتح أنهي صفحة؟', type: 'select', opts: PAGES },
      { k: 'order', label: 'الترتيب (الأصغر الأول)', type: 'number' },
    ],
  },
  partners: {
    title: '🤝 الشركاء',
    hint: 'الشركاء اللي تضيفهم هنا هم اللي بيظهروا في صفحة الشركاء.',
    empty: 'مفيش شركاء لسه. صفحة الشركاء بتعرض "قريباً".',
    nameKey: 'name', imgKey: 'logo',
    fields: [
      { k: 'name', label: 'الاسم (English)' }, { k: 'nameAr', label: 'الاسم (عربي)' },
      { k: 'description', label: 'الوصف (English)', type: 'textarea' }, { k: 'descriptionAr', label: 'الوصف (عربي)', type: 'textarea' },
      { k: 'logo', label: 'اللوجو / الصورة', type: 'image' },
      { k: 'contact', label: 'التواصل (إيميل أو تليفون)' }, { k: 'website', label: 'الموقع (رابط) اختياري' },
      { k: 'order', label: 'الترتيب (الأصغر الأول)', type: 'number' },
    ],
  },
};

// Shrinks a photo in the browser so it uploads fast on mobile data.
function shrink(file: File, maxDim = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(src);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('تعذر قراءة الصورة'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    img.src = src;
  });
}

function ItemForm({ kind, initial, onSaved, onCancel, fail }: { kind: Kind; initial: any | null; onSaved: () => void; onCancel: () => void; fail: (e: any) => void }) {
  const cfg = CONFIG[kind];
  const editing = !!initial?.id;
  const [form, setForm] = useState<Record<string, any>>(() => ({ active: true, order: 0, link: '', ...(initial || {}) }));
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (key: string, file: File) => {
    setBusy(true);
    try {
      let blob = await shrink(file, 1600);
      if (blob.size > 3.8 * 1024 * 1024) blob = await shrink(file, 1200);
      const fd = new FormData();
      fd.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      set(key, d.url);
    } catch (e: any) {
      if (e instanceof UnauthorizedError) fail(e); else alert('❌ ' + (e?.message || 'فشل رفع الصورة'));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!String(form[cfg.nameKey] || '').trim()) return alert('اكتب ' + (kind === 'banners' ? 'عنوان البانر' : 'اسم الشريك'));
    setBusy(true);
    try {
      const body = JSON.stringify({ ...form, kind, order: Number(form.order) || 0 });
      await adminApi(editing ? `/api/admin/content?id=${encodeURIComponent(initial.id)}` : '/api/admin/content', { method: editing ? 'PATCH' : 'POST', body });
      onSaved();
    } catch (e: any) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title={editing ? '✏️ تعديل' : '➕ إضافة جديد'} right={<Btn kind="ghost" small onClick={onCancel}>إلغاء</Btn>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {cfg.fields.map((f) => (
          <div key={f.k} className={f.type === 'textarea' || f.type === 'image' ? 'sm:col-span-2' : ''}>
            <Field label={f.label}>
              {f.type === 'textarea' ? (
                <textarea rows={3} className={inputCls} value={form[f.k] || ''} onChange={(e) => set(f.k, e.target.value)} />
              ) : f.type === 'select' ? (
                <select className={inputCls} value={form[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)}>
                  {Object.entries(f.opts || {}).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : f.type === 'image' ? (
                <div className="flex items-center gap-3">
                  {form[f.k] && <img src={form[f.k]} alt="" className="h-20 w-32 rounded-lg object-cover" />}
                  <label className="cursor-pointer rounded-lg border border-[#3a3a3a] px-3 py-2 text-sm text-gray-200 hover:bg-[#1f1f1f]">
                    {busy ? 'جاري الرفع...' : form[f.k] ? 'تغيير الصورة' : 'رفع صورة'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(f.k, file); e.target.value = ''; }} />
                  </label>
                  {form[f.k] && <Btn small kind="ghost" onClick={() => set(f.k, '')}>إزالة</Btn>}
                </div>
              ) : (
                <input type={f.type === 'number' ? 'number' : 'text'} className={inputCls} value={form[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} />
              )}
            </Field>
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm text-gray-200 sm:col-span-2">
          <input type="checkbox" checked={form.active !== false} onChange={(e) => set('active', e.target.checked)} /> ظاهر للزوار
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <Btn onClick={save} disabled={busy}>{busy ? '...' : '💾 حفظ'}</Btn>
        <Btn kind="ghost" onClick={onCancel}>إلغاء</Btn>
      </div>
    </Card>
  );
}

function Manager({ kind, onUnauthorized }: { kind: Kind; onUnauthorized: () => void }) {
  const cfg = CONFIG[kind];
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<any | null | undefined>(undefined);

  const fail = useCallback((e: any) => (e instanceof UnauthorizedError ? onUnauthorized() : alert('❌ ' + e.message)), [onUnauthorized]);
  const load = useCallback(() => {
    setItems(null);
    adminApi<{ items: any[] }>(`/api/admin/content?kind=${kind}`)
      .then((d) => { setItems(d.items); setError(''); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [kind, onUnauthorized]);
  useEffect(load, [load]);

  const toggle = (it: any) =>
    adminApi(`/api/admin/content?id=${encodeURIComponent(it.id)}`, { method: 'PATCH', body: JSON.stringify({ kind, patch: { active: !(it.active !== false) } }) }).then(load).catch(fail);
  const remove = (it: any) => {
    if (!confirm('حذف نهائي؟')) return;
    adminApi(`/api/admin/content?kind=${kind}&id=${encodeURIComponent(it.id)}`, { method: 'DELETE' }).then(load).catch(fail);
  };

  if (editing !== undefined) {
    return <ItemForm kind={kind} initial={editing} fail={fail} onCancel={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />;
  }

  return (
    <div className="space-y-3">
      <Card title={cfg.title} right={<Btn small onClick={() => setEditing(null)}>➕ جديد</Btn>}>
        <p className="text-xs text-gray-400">{cfg.hint}</p>
      </Card>
      {error && <Empty>❌ {error}</Empty>}
      {!items && !error && <Empty>...جاري التحميل</Empty>}
      {items && items.length === 0 && <Empty>{cfg.empty}</Empty>}
      {items?.map((it) => (
        <div key={it.id} className={`flex gap-3 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-3 ${it.active === false ? 'opacity-60' : ''}`}>
          {it[cfg.imgKey] ? <img src={it[cfg.imgKey]} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" /> : <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-[#1f1f1f] text-2xl">🖼️</div>}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-white">{it[cfg.nameKey]}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge tone="gold">ترتيب {it.order ?? 0}</Badge>
              {it.active === false ? <Badge tone="red">🙈 مخفي</Badge> : <Badge tone="green">ظاهر</Badge>}
              {kind === 'banners' && it.link && <Badge tone="blue">→ {PAGES[it.link] || it.link}</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Btn small kind="ghost" onClick={() => setEditing(it)}>✏️ تعديل</Btn>
              <Btn small kind="ghost" onClick={() => toggle(it)}>{it.active === false ? '👁 إظهار' : '🙈 إخفاء'}</Btn>
              <Btn small kind="danger" onClick={() => remove(it)}>حذف</Btn>
            </div>
          </div>
        </div>
      ))}
      <p className="text-center text-[11px]" style={{ color: GOLD }}>التغييرات بتظهر للزوار خلال دقيقة تقريباً.</p>
    </div>
  );
}

export default function ContentTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [kind, setKind] = useState<Kind | 'texts' | 'pricing' | 'legal'>('banners');
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(Object.keys(CONFIG) as Kind[]).map((k) => (
          <Btn key={k} small kind={kind === k ? 'gold' : 'ghost'} onClick={() => setKind(k)}>{CONFIG[k].title}</Btn>
        ))}
        <Btn small kind={kind === 'texts' ? 'gold' : 'ghost'} onClick={() => setKind('texts')}>✍️ نصوص الصفحات</Btn>
        <Btn small kind={kind === 'pricing' ? 'gold' : 'ghost'} onClick={() => setKind('pricing')}>💱 سعر Pi</Btn>
        <Btn small kind={kind === 'legal' ? 'gold' : 'ghost'} onClick={() => setKind('legal')}>⚖️ القانون</Btn>
      </div>
      {kind === 'texts' ? <TextsEditor onUnauthorized={onUnauthorized} /> : kind === 'pricing' ? <PricingSettings onUnauthorized={onUnauthorized} /> : kind === 'legal' ? <LegalSettings onUnauthorized={onUnauthorized} /> : <Manager key={kind} kind={kind} onUnauthorized={onUnauthorized} />}
    </div>
  );
}
