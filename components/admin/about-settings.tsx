'use client';

import { useEffect, useState } from 'react';
import type { AboutSettings } from '@/lib/about-settings';
import { shrinkImage } from '@/lib/shrink-image';
import { adminApi, UnauthorizedError, Btn, Card, inputCls } from './admin-ui';

// The cover picture and contact links of the "About us" page (its texts are edited just below, in "نصوص الصفحات").
export default function AboutSettingsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<AboutSettings | null>(null);
  const [draft, setDraft] = useState<AboutSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };
  const apply = (d: AboutSettings) => { const x = { coverUrl: d.coverUrl, email: d.email, website: d.website, whatsapp: d.whatsapp }; setSaved(x); setDraft(x); };

  useEffect(() => { adminApi<AboutSettings>('/api/admin/about').then(apply).catch(fail); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const upload = async (file: File) => {
    setBusy(true); setMsg('');
    try {
      const blob = await shrinkImage(file, 1400, 0.85);
      const fd = new FormData();
      fd.append('file', new File([blob], 'about-cover.webp', { type: 'image/webp' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      setDraft((x) => (x ? { ...x, coverUrl: d.url } : x));
      setMsg('تم رفع الصورة. اضغط "حفظ" عشان تظهر.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true); setMsg('');
    try {
      const d = await adminApi<AboutSettings>('/api/admin/about', { method: 'PUT', body: JSON.stringify(draft) });
      apply(d);
      setMsg('✅ اتحفظ. بيظهر للزوار خلال دقيقة تقريباً.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const changed = !!saved && !!draft && JSON.stringify(saved) !== JSON.stringify(draft);
  const set = (k: keyof AboutSettings, v: string) => setDraft((x) => (x ? { ...x, [k]: v === '' ? null : v } : x));

  return (
    <Card title="ℹ️ صفحة «نبذة عنا»: الغلاف وروابط التواصل">
      <p className="mb-3 text-xs text-muted-foreground">الصفحة بتظهر في القائمة (☰ ← مساعدة ← نبذة عنا). الصورة بتتحط كخلفية خفيفة في أعلى الصفحة، وروابط التواصل بتظهر لو كتبتها. نصوص الصفحة تعدّلها من تحت.</p>
      {draft ? (
        <>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-border bg-input">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {draft.coverUrl ? <img src={draft.coverUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-[11px] text-muted-foreground">من غير غلاف</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-center text-sm text-foreground hover:bg-muted">
                {draft.coverUrl ? 'تغيير الغلاف' : 'اختيار غلاف'}
                <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="اختيار صورة الغلاف" className="hidden" disabled={busy}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }} />
              </label>
              {draft.coverUrl && <Btn small kind="ghost" onClick={() => set('coverUrl', '')}>إزالة الغلاف</Btn>}
            </div>
          </div>
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <input aria-label="البريد الإلكتروني" dir="ltr" placeholder="البريد الإلكتروني" maxLength={120} value={draft.email ?? ''} onChange={(e) => set('email', e.target.value)} className={inputCls} />
            <input aria-label="الموقع" dir="ltr" placeholder="https://الموقع" maxLength={300} value={draft.website ?? ''} onChange={(e) => set('website', e.target.value)} className={inputCls} />
            <input aria-label="واتساب" dir="ltr" placeholder="واتساب مع كود الدولة (2010…)" maxLength={20} value={draft.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} />
          </div>
          <Btn onClick={save} disabled={busy || !changed}>{busy ? '...' : '💾 حفظ'}</Btn>
        </>
      ) : <p className="text-sm text-muted-foreground">...</p>}
      {msg && <p className="mt-2 text-xs text-foreground">{msg}</p>}
    </Card>
  );
}
