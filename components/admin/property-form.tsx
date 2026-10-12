'use client';

import { useState } from 'react';
import { adminApi, Btn, Card, Field, inputCls, GOLD, TYPE_LABELS, STATUS_LABELS } from './admin-ui';

const TR_LANGS = [
  { code: 'ar', label: 'العربية' }, { code: 'fr', label: 'Français' }, { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' }, { code: 'ur', label: 'اردو' }, { code: 'zh', label: '中文' },
];
const PROPERTY_TYPES: Record<string, string> = { apartment: 'شقة', villa: 'فيلا', penthouse: 'بنتهاوس', commercial: 'تجاري' };
const AMENITIES: [string, string][] = [['pool', 'مسبح'], ['gym', 'جيم'], ['parking', 'موقف'], ['security', 'أمن']];

type Tr = Record<string, Record<string, string>>;

function blank() {
  return {
    title: '', price: '', payAmountPi: '', currency: 'Pi', location: '', type: 'buy', propertyType: 'apartment', status: 'available',
    bedrooms: '', bathrooms: '', area: '', lat: '', lng: '', description: '', image: '', images: [] as string[],
    vrUrl: '', contractUrl: '', tokenized: false, featured: false, hidden: false,
    amenities: { pool: false, gym: false, parking: false, security: false } as Record<string, boolean>,
  };
}

function fromProperty(p: any) {
  const f = blank();
  return {
    ...f,
    title: p.title || '', price: String(p.price ?? ''), payAmountPi: p.payAmountPi ? String(p.payAmountPi) : '', currency: p.currency || 'Pi', location: p.location || '',
    type: p.type || 'buy', propertyType: p.propertyType || 'apartment', status: p.status || 'available',
    bedrooms: p.bedrooms ? String(p.bedrooms) : '', bathrooms: p.bathrooms ? String(p.bathrooms) : '', area: p.area ? String(p.area) : '',
    lat: p.lat !== undefined ? String(p.lat) : '', lng: p.lng !== undefined ? String(p.lng) : '',
    description: p.description || '', image: p.image || '', images: (Array.isArray(p.images) ? p.images : []) as string[],
    vrUrl: p.vrUrl || '', contractUrl: p.contractUrl || '', tokenized: p.tokenized === true, featured: p.featured === true,
    hidden: p.hidden === true, amenities: { ...f.amenities, ...(p.amenities || {}) },
  };
}

// Shrinks the photo in the browser (max dimension, JPEG) so it uploads fast on mobile data.
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

export default function PropertyForm({ initial, onSaved, onCancel }: { initial: any | null; onSaved: () => void; onCancel: () => void }) {
  const editing = !!initial?.id;
  const [form, setForm] = useState(() => (initial ? fromProperty(initial) : blank()));
  const [tr, setTr] = useState<Tr>(() => (initial?.translations as Tr) || {});
  const [busy, setBusy] = useState(false);
  const [trBusy, setTrBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<ReturnType<typeof blank>>) => setForm((f) => ({ ...f, ...patch }));
  const setTrField = (lang: string, key: string, value: string) =>
    setTr((prev) => ({ ...prev, [lang]: { ...(prev[lang] || {}), [key]: value } }));

  const text = (key: keyof ReturnType<typeof blank>, label: string, type = 'text') => (
    <Field label={label}>
      <input type={type} inputMode={type === 'number' ? 'decimal' : undefined} className={inputCls} value={form[key] as string}
        onChange={(e) => set({ [key]: e.target.value } as any)} />
    </Field>
  );
  const select = (key: 'currency' | 'type' | 'propertyType' | 'status', label: string, opts: Record<string, string>) => (
    <Field label={label}>
      <select className={inputCls} value={form[key]} onChange={(e) => set({ [key]: e.target.value } as any)}>
        {Object.entries(opts).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );

  const upload = async (file: File, target: 'main' | 'extra' | 'pano') => {
    setBusy(true);
    try {
      let blob = await shrink(file, target === 'pano' ? 4096 : 1600);
      if (blob.size > 3.8 * 1024 * 1024) blob = await shrink(file, 2800);
      const fd = new FormData();
      fd.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      const data = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      if (!data.url) throw new Error('فشل رفع الصورة');
      if (target === 'main') set({ image: data.url });
      else if (target === 'pano') set({ vrUrl: data.url });
      else setForm((f) => ({ ...f, images: [...f.images, data.url] }));
    } catch (e: any) {
      alert('❌ ' + (e?.message || 'فشل رفع الصورة'));
    } finally {
      setBusy(false);
    }
  };

  const uploadContract = async (file: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const data = await adminApi<{ url: string }>('/api/admin/upload-contract', { method: 'POST', body: fd });
      set({ contractUrl: data.url });
    } catch (e: any) {
      alert('❌ ' + (e?.message || 'فشل رفع العقد'));
    } finally {
      setBusy(false);
    }
  };

  const autoTranslate = async () => {
    if (!form.title.trim()) return alert('اكتب عنوان العقار الأول');
    setTrBusy(true);
    try {
      const data = await adminApi<{ translations: Tr }>('/api/admin/translate', {
        method: 'POST',
        body: JSON.stringify({ title: form.title, location: form.location, description: form.description }),
      });
      setTr(data.translations || {});
    } catch (e: any) {
      alert('❌ ' + (e?.message || 'فشلت الترجمة'));
    } finally {
      setTrBusy(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) return alert('اكتب عنوان العقار');
    setSaving(true);
    try {
      const body = JSON.stringify({
        ...form, translations: tr,
        titleAr: tr.ar?.title || '', locationAr: tr.ar?.location || '', descriptionAr: tr.ar?.description || '',
        price: Number(form.price) || 0, bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0, area: Number(form.area) || 0,
      });
      await adminApi(editing ? '/api/admin/properties?id=' + encodeURIComponent(initial.id) : '/api/admin/properties', {
        method: editing ? 'PATCH' : 'POST', body,
      });
      onSaved();
    } catch (e: any) {
      alert('❌ ' + (e?.message || 'فشل الحفظ'));
    } finally {
      setSaving(false);
    }
  };

  const fileBtn = (label: string, accept: string, onFile: (f: File) => void) => (
    <label className={`cursor-pointer rounded-lg bg-[#d4af37] px-3 py-2 text-xs font-bold text-black ${busy ? 'opacity-50' : ''}`}>
      {busy ? '...جاري الرفع' : label}
      <input type="file" accept={accept} disabled={busy} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onFile(f); }} />
    </label>
  );

  return (
    <Card title={editing ? `✏️ تعديل: ${initial.title}` : '➕ إضافة عقار جديد'}
      right={<Btn kind="ghost" small onClick={onCancel}>إلغاء</Btn>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">{text('title', 'عنوان العقار (English)')}</div>
        {text('price', 'السعر', 'number')}
        {select('currency', 'العملة', { Pi: 'Pi', USD: 'USD', EGP: 'EGP' })}
        <div className="sm:col-span-2">{text('payAmountPi', 'المبلغ المطلوب دفعه بالـ π (اختياري: لو سبته فاضي والعملة Pi بيدفع السعر كله)', 'number')}</div>
        <div className="sm:col-span-2">{text('location', 'الموقع (English)')}</div>
        {select('type', 'نوع الإعلان', TYPE_LABELS)}
        {select('propertyType', 'نوع العقار', PROPERTY_TYPES)}
        {select('status', 'الحالة', STATUS_LABELS)}
        {text('area', 'المساحة (م²)', 'number')}
        {text('bedrooms', 'غرف النوم', 'number')}
        {text('bathrooms', 'الحمامات', 'number')}
        {text('lat', 'خط العرض Latitude (للخريطة)', 'number')}
        {text('lng', 'خط الطول Longitude (للخريطة)', 'number')}
        <div className="sm:col-span-2">
          <Field label="الوصف (English)">
            <textarea rows={4} className={inputCls} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#3a3a1a] p-3">
        <p className="mb-2 text-sm font-bold" style={{ color: GOLD }}>🌍 الترجمات</p>
        <Btn small onClick={autoTranslate} disabled={trBusy}>{trBusy ? '...جاري الترجمة' : '✨ ترجمة تلقائية لـ 6 لغات'}</Btn>
        <div className="mt-3 space-y-2">
          {TR_LANGS.map((l) => (
            <details key={l.code} className="rounded-lg bg-[#0d0d0d] p-2">
              <summary className="cursor-pointer text-sm" style={{ color: GOLD }}>{l.label} {tr[l.code]?.title ? '✅' : ''}</summary>
              <div dir={l.code === 'ar' || l.code === 'ur' ? 'rtl' : 'ltr'} className="mt-2 space-y-2">
                <input className={inputCls} placeholder={`title (${l.code})`} value={tr[l.code]?.title || ''} onChange={(e) => setTrField(l.code, 'title', e.target.value)} />
                <input className={inputCls} placeholder={`location (${l.code})`} value={tr[l.code]?.location || ''} onChange={(e) => setTrField(l.code, 'location', e.target.value)} />
                <textarea rows={3} className={inputCls} placeholder={`description (${l.code})`} value={tr[l.code]?.description || ''} onChange={(e) => setTrField(l.code, 'description', e.target.value)} />
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm font-bold" style={{ color: GOLD }}>🖼️ الصور والملفات</p>
        <div className="flex flex-wrap gap-2">
          {fileBtn('📷 صورة رئيسية', 'image/*', (f) => upload(f, 'main'))}
          {fileBtn('➕ صورة إضافية', 'image/*', (f) => upload(f, 'extra'))}
          {fileBtn('🥽 بانوراما 360°', 'image/*', (f) => upload(f, 'pano'))}
          {fileBtn('📄 عقد PDF', 'application/pdf', uploadContract)}
        </div>
        {form.image && (
          <div className="relative w-full max-w-xs">
            <img src={form.image} alt="" className="h-40 w-full rounded-lg object-cover" />
            <button type="button" onClick={() => set({ image: '' })} className="absolute left-1 top-1 rounded bg-black/70 px-2 text-sm text-white">✕</button>
          </div>
        )}
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.images.map((u, i) => (
              <div key={u + i} className="relative">
                <img src={u} alt="" className="h-20 w-28 rounded-lg object-cover" />
                <button type="button" onClick={() => set({ images: form.images.filter((_, j) => j !== i) })} className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white">✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-3 text-xs">
          {form.vrUrl && <span className="text-green-400">✅ بانوراما مرفوعة <button type="button" className="text-red-400" onClick={() => set({ vrUrl: '' })}>(حذف)</button></span>}
          {form.contractUrl && <span className="text-green-400">✅ عقد مرفوع <button type="button" className="text-red-400" onClick={() => set({ contractUrl: '' })}>(حذف)</button></span>}
        </div>
        <details className="text-sm text-gray-400">
          <summary className="cursor-pointer">روابط يدوية (اختياري)</summary>
          <div className="mt-2 space-y-2">
            <input className={inputCls} placeholder="رابط الصورة الرئيسية" value={form.image} onChange={(e) => set({ image: e.target.value })} />
            <input className={inputCls} placeholder="رابط جولة VR" value={form.vrUrl} onChange={(e) => set({ vrUrl: e.target.value })} />
          </div>
        </details>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white">
        {AMENITIES.map(([k, l]) => (
          <label key={k} className="flex items-center gap-1.5">
            <input type="checkbox" checked={!!form.amenities[k]} onChange={(e) => set({ amenities: { ...form.amenities, [k]: e.target.checked } })} />{l}
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <label className="flex items-center gap-1.5 text-white"><input type="checkbox" checked={form.tokenized} onChange={(e) => set({ tokenized: e.target.checked })} />عقار مرمّز (Tokenized)</label>
        <label className="flex items-center gap-1.5 text-white"><input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} />⭐ مميز</label>
        <label className="flex items-center gap-1.5 text-white"><input type="checkbox" checked={form.hidden} onChange={(e) => set({ hidden: e.target.checked })} />🙈 مخفي عن الزوار</label>
      </div>

      <div className="mt-5 flex gap-2">
        <Btn onClick={save} disabled={saving || busy}>{saving ? '...جاري الحفظ' : editing ? 'حفظ التعديلات' : 'إضافة العقار'}</Btn>
        <Btn kind="ghost" onClick={onCancel}>إلغاء</Btn>
      </div>
    </Card>
  );
}
