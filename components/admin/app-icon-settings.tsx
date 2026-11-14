'use client';

import { useEffect, useRef, useState } from 'react';
import { contentBox, placeRect, isSmallSource, MASKABLE_FRACTION, type IconMode } from '@/lib/icon-compose';
import { DEFAULT_THEME_COLOR, type AppIcon } from '@/lib/app-icon';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';

type Sizes = { icon192: Blob; icon512: Blob; maskable512: Blob; apple180: Blob };
type Opts = { mode: IconMode; zoom: number; trim: boolean; bg: string };

const load = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  const src = URL.createObjectURL(file);
  img.onload = () => { URL.revokeObjectURL(src); resolve(img); };
  img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
  img.src = src;
});

// The logo with its empty margins cut away (so it can fill the icon). Falls back to the whole picture.
function trimmed(img: HTMLImageElement, trim: boolean): HTMLCanvasElement {
  const full = document.createElement('canvas');
  full.width = img.width; full.height = img.height;
  const g = full.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, 0, 0);
  if (!trim) return full;
  const box = contentBox(g.getImageData(0, 0, full.width, full.height).data, full.width, full.height);
  const out = document.createElement('canvas');
  out.width = box.w; out.height = box.h;
  out.getContext('2d')!.drawImage(full, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
  return out;
}

// One square icon on the brand colour. "any" icons follow the chosen mode; the maskable one always keeps the logo inside the safe centre.
function drawTo(c: HTMLCanvasElement, src: HTMLCanvasElement, px: number, mode: IconMode, o: Opts, maskable: boolean) {
  c.width = px; c.height = px;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.fillStyle = o.bg;
  g.fillRect(0, 0, px, px);
  const r = maskable ? placeRect(src.width, src.height, px, 'fit', 1, MASKABLE_FRACTION) : placeRect(src.width, src.height, px, mode, o.zoom, 1);
  g.drawImage(src, r.x, r.y, r.w, r.h);
}
const toBlob = (c: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('تعذر تجهيز الأيقونة'))), 'image/png'));

async function makeSizes(src: HTMLCanvasElement, o: Opts): Promise<Sizes> {
  const one = async (px: number, maskable: boolean) => { const c = document.createElement('canvas'); drawTo(c, src, px, o.mode, o, maskable); return toBlob(c); };
  return { icon192: await one(192, false), icon512: await one(512, false), maskable512: await one(512, true), apple180: await one(180, false) };
}

export default function AppIconSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<AppIcon | null>(null);
  const [draft, setDraft] = useState<AppIcon | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<IconMode>('fill');
  const [zoom, setZoom] = useState(1);
  const [trim, setTrim] = useState(true);
  const anyRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };
  const apply = (d: AppIcon) => { const x = { icon192: d.icon192, icon512: d.icon512, maskable512: d.maskable512, apple180: d.apple180, themeColor: d.themeColor }; setSaved(x); setDraft(x); };

  useEffect(() => {
    adminApi<AppIcon>('/api/admin/app-icon').then(apply).catch(fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opts: Opts | null = draft ? { mode, zoom, trim, bg: draft.themeColor } : null;
  // Live preview of the picked picture: the normal icon and the maskable one, drawn exactly as they will be uploaded.
  useEffect(() => {
    if (!img || !opts || !anyRef.current || !maskRef.current) return;
    const src = trimmed(img, trim);
    drawTo(anyRef.current, src, 256, mode, opts, false);
    drawTo(maskRef.current, src, 256, mode, opts, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, mode, zoom, trim, draft?.themeColor]);

  const pick = async (file: File) => {
    setMsg('');
    try { const i = await load(file); setImg(i); if (isSmallSource(i.width, i.height)) setMsg(`⚠️ الصورة ${i.width}×${i.height}. الأفضل 512×512 أو أكبر عشان الأيقونة تطلع ناصعة.`); }
    catch (e) { fail(e); }
  };

  const upload = async () => {
    if (!draft || !img || !opts) return;
    setBusy(true); setMsg('');
    try {
      const sizes = await makeSizes(trimmed(img, trim), opts);
      const urls: Partial<AppIcon> = {};
      for (const k of ['icon192', 'icon512', 'maskable512', 'apple180'] as const) {
        const fd = new FormData();
        fd.append('file', new File([sizes[k]], `${k}.png`, { type: 'image/png' }));
        const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
        urls[k] = d.url;
      }
      setDraft((x) => (x ? { ...x, ...urls } : x));
      setImg(null);
      setMsg('تم رفع الأيقونة بكل الأحجام. اضغط "حفظ" عشان تتفعّل.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const save = async (body: AppIcon) => {
    setBusy(true); setMsg('');
    try {
      const d = await adminApi<AppIcon>('/api/admin/app-icon', { method: 'PUT', body: JSON.stringify(body) });
      apply(d);
      setMsg('✅ اتحفظ. الأيقونة الجديدة بتظهر لمن يثبّت التطبيق بعد كده، والمثبّت قبل كده لازم يتشال ويتثبّت تاني.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const changed = !!saved && !!draft && JSON.stringify(saved) !== JSON.stringify(draft);
  const prev = draft?.icon512 ?? '/icon-512.png';
  const chip = (on: boolean) => `rounded-full border px-3 py-1 text-xs font-semibold ${on ? 'border-[#d4af37] bg-[#d4af37] text-black' : 'border-[#3a3a3a] text-gray-300'}`;

  return (
    <Card title="📱 أيقونة التطبيق بعد التثبيت">
      <p className="mb-3 text-xs text-gray-400">دي الأيقونة اللي بتظهر على شاشة الموبايل لما حد يثبّت التطبيق. ارفع الشعار (الأفضل 512×512 أو أكبر) واختار "ملء كامل" عشان الشعار يملا الأيقونة زي أيقونة Pi، وهنقص الحواف الفاضية تلقائياً ونجهّز كل الأحجام. لو شلتها بيرجع الشكل الأصلي.</p>
      {draft ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-5">
            {img ? (
              <>
                <div className="text-center"><canvas ref={anyRef} aria-label="معاينة الأيقونة" className="h-24 w-24 rounded-[22%] border border-[#3a3a3a]" /><p className="mt-1 text-[10px] text-gray-400">مربع مدوّر</p></div>
                <div className="text-center"><canvas ref={maskRef} aria-label="معاينة الأيقونة الدائرية" className="h-24 w-24 rounded-full border border-[#3a3a3a]" /><p className="mt-1 text-[10px] text-gray-400">دائري (أندرويد)</p></div>
              </>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={prev} alt="" className="h-24 w-24 rounded-[22%] border border-[#3a3a3a] object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={prev} alt="" className="h-14 w-14 rounded-full border border-[#3a3a3a] object-cover" />
              </>
            )}
          </div>
          <label className="mb-3 flex items-center gap-2 text-sm text-gray-100">
            لون الخلفية
            <input type="color" aria-label="لون خلفية الأيقونة" value={draft.themeColor} onChange={(e) => setDraft({ ...draft, themeColor: e.target.value })} />
            <span className="text-xs text-gray-400" dir="ltr">{draft.themeColor}</span>
            <Btn small kind="ghost" onClick={() => setDraft({ ...draft, themeColor: DEFAULT_THEME_COLOR })}>الأصلي</Btn>
          </label>
          {img && (
            <div className="mb-3 space-y-2 rounded-xl border border-[#2a2a2a] bg-[#101010] p-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="طريقة ملء الأيقونة">
                <button type="button" aria-pressed={mode === 'fill'} onClick={() => setMode('fill')} className={chip(mode === 'fill')}>ملء كامل (زي Pi)</button>
                <button type="button" aria-pressed={mode === 'fit'} onClick={() => setMode('fit')} className={chip(mode === 'fit')}>الشعار كامل داخل الخلفية</button>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-200">
                <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} aria-label="قص الحواف الفاضية" /> قص الحواف الفاضية حوالين الشعار
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-200">
                تكبير
                <input type="range" min={1} max={1.5} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="تكبير الشعار" />
                <span dir="ltr">{Math.round(zoom * 100)}%</span>
              </label>
              <Btn onClick={upload} disabled={busy}>{busy ? 'جاري الرفع...' : '⬆️ جهّز وارفع الأيقونة'}</Btn>
              <Btn small kind="ghost" onClick={() => setImg(null)}>إلغاء</Btn>
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-[#3a3a3a] px-3 py-2 text-sm text-gray-200 hover:bg-[#1f1f1f]">
              {draft.icon512 ? 'اختيار شعار جديد' : 'اختيار شعار'}
              <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="اختيار شعار الأيقونة" className="hidden" disabled={busy}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ''; }} />
            </label>
            {draft.icon512 && <Btn small kind="ghost" onClick={() => setDraft({ ...draft, icon192: null, icon512: null, maskable512: null, apple180: null })}>رجوع للأيقونة الأصلية</Btn>}
          </div>
          <Btn onClick={() => save(draft)} disabled={busy || !changed}>{busy ? '...' : '💾 حفظ'}</Btn>
        </>
      ) : <p className="text-sm text-gray-400">...</p>}
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
