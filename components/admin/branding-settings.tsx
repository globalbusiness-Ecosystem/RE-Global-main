'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import type { Branding } from '@/lib/branding';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';

// Shrinks the picture in the browser (longest side 768) so it uploads fast and loads fast for everyone.
function shrink(file: File, maxDim = 768): Promise<Blob> {
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
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('تعذر قراءة الصورة'))), 'image/webp', 0.9);
    };
    img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    img.src = src;
  });
}

export default function BrandingSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<Branding | null>(null);
  const [draft, setDraft] = useState<Branding | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<Branding>('/api/admin/branding')
      .then((d) => { setSaved({ logoUrl: d.logoUrl, animated: d.animated }); setDraft({ logoUrl: d.logoUrl, animated: d.animated }); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };

  const upload = async (file: File) => {
    setBusy(true); setMsg('');
    try {
      const blob = await shrink(file);
      const fd = new FormData();
      fd.append('file', new File([blob], 'logo.webp', { type: 'image/webp' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      setDraft((x) => (x ? { ...x, logoUrl: d.url } : x));
      setMsg('تم رفع الصورة. اضغط "حفظ" عشان تظهر للزوار.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true); setMsg('');
    try {
      const d = await adminApi<Branding>('/api/admin/branding', { method: 'PUT', body: JSON.stringify({ logoUrl: draft.logoUrl, animated: draft.animated }) });
      setSaved({ logoUrl: d.logoUrl, animated: d.animated });
      setMsg('✅ اتحفظ. اللوجو الجديد بيوصل للزوار خلال دقيقة تقريباً.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const changed = !!saved && !!draft && (saved.logoUrl !== draft.logoUrl || saved.animated !== draft.animated);

  return (
    <Card title="🎨 لوجو المنصة">
      <p className="mb-3 text-xs text-gray-400">ارفع لوجو جديد (JPG أو PNG أو WebP) وهيظهر في الهيدر وصفحات الدخول وفحص الهوية. لو شلته بيرجع اللوجو الأصلي. الأفضل صورة بخلفية واضحة والشعار في النص.</p>
      {draft ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-6">
            <BrandLogo height={96} shape="wide" preview={draft} />
            <BrandLogo height={40} preview={draft} />
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-[#3a3a3a] px-3 py-2 text-sm text-gray-200 hover:bg-[#1f1f1f]">
              {busy ? 'جاري الرفع...' : draft.logoUrl ? 'تغيير اللوجو' : 'رفع لوجو'}
              <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="رفع لوجو المنصة" className="hidden" disabled={busy}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
            </label>
            {draft.logoUrl && <Btn small kind="ghost" onClick={() => setDraft({ ...draft, logoUrl: null })}>رجوع للوجو الأصلي</Btn>}
          </div>
          <label className="mb-4 flex items-center gap-2 text-sm text-gray-100">
            <input type="checkbox" checked={draft.animated} onChange={(e) => setDraft({ ...draft, animated: e.target.checked })} />
            لوجو متحرك (طفو خفيف + لمعة ذهبية + توهّج)
          </label>
          <Btn onClick={save} disabled={busy || !changed}>{busy ? '...' : '💾 حفظ'}</Btn>
        </>
      ) : <p className="text-sm text-gray-400">...</p>}
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
