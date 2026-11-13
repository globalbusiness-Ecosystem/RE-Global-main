'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_THEME_COLOR, type AppIcon } from '@/lib/app-icon';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';

type Sizes = { icon192: Blob; icon512: Blob; maskable512: Blob; apple180: Blob };

const load = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  const src = URL.createObjectURL(file);
  img.onload = () => { URL.revokeObjectURL(src); resolve(img); };
  img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
  img.src = src;
});

// One square picture on the brand colour. "scale" is how much of the square the drawing fills (the maskable one stays inside the safe centre).
function draw(img: HTMLImageElement, px: number, scale: number, bg: string): Promise<Blob> {
  const c = document.createElement('canvas');
  c.width = px; c.height = px;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, px, px);
  const k = (px * scale) / Math.max(img.width, img.height);
  const w = img.width * k, h = img.height * k;
  g.drawImage(img, (px - w) / 2, (px - h) / 2, w, h);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('تعذر تجهيز الأيقونة'))), 'image/png'));
}

async function makeSizes(file: File, bg: string): Promise<Sizes> {
  const img = await load(file);
  return {
    icon192: await draw(img, 192, 1, bg),
    icon512: await draw(img, 512, 1, bg),
    maskable512: await draw(img, 512, 0.66, bg),
    apple180: await draw(img, 180, 1, bg),
  };
}

export default function AppIconSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<AppIcon | null>(null);
  const [draft, setDraft] = useState<AppIcon | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };
  const apply = (d: AppIcon) => { const x = { icon192: d.icon192, icon512: d.icon512, maskable512: d.maskable512, apple180: d.apple180, themeColor: d.themeColor }; setSaved(x); setDraft(x); };

  useEffect(() => {
    adminApi<AppIcon>('/api/admin/app-icon').then(apply).catch(fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = async (file: File) => {
    if (!draft) return;
    setBusy(true); setMsg('');
    try {
      const sizes = await makeSizes(file, draft.themeColor);
      const urls: Partial<AppIcon> = {};
      for (const k of ['icon192', 'icon512', 'maskable512', 'apple180'] as const) {
        const fd = new FormData();
        fd.append('file', new File([sizes[k]], `${k}.png`, { type: 'image/png' }));
        const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
        urls[k] = d.url;
      }
      setDraft((x) => (x ? { ...x, ...urls } : x));
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

  return (
    <Card title="📱 أيقونة التطبيق بعد التثبيت">
      <p className="mb-3 text-xs text-gray-400">دي الأيقونة اللي بتظهر على شاشة الموبايل لما حد يثبّت التطبيق، ولون شريط العنوان وشاشة الفتح. ارفع صورة مربعة (الأفضل 512×512 أو أكبر، والشعار في النص) وهنجهّز كل الأحجام تلقائياً. لو شلتها بيرجع الشكل الأصلي (أبراج دهبية على بنفسجي).</p>
      {draft ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={prev} alt="" className="h-24 w-24 rounded-[22%] border border-[#3a3a3a] object-cover" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={prev} alt="" className="h-14 w-14 rounded-full border border-[#3a3a3a] object-cover" />
          </div>
          <label className="mb-3 flex items-center gap-2 text-sm text-gray-100">
            لون الخلفية
            <input type="color" aria-label="لون خلفية الأيقونة" value={draft.themeColor} onChange={(e) => setDraft({ ...draft, themeColor: e.target.value })} />
            <span className="text-xs text-gray-400" dir="ltr">{draft.themeColor}</span>
            <Btn small kind="ghost" onClick={() => setDraft({ ...draft, themeColor: DEFAULT_THEME_COLOR })}>الأصلي</Btn>
          </label>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-[#3a3a3a] px-3 py-2 text-sm text-gray-200 hover:bg-[#1f1f1f]">
              {busy ? 'جاري التجهيز...' : draft.icon512 ? 'تغيير الأيقونة' : 'رفع أيقونة'}
              <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="رفع أيقونة التطبيق" className="hidden" disabled={busy}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
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
