'use client';

import { useEffect, useState } from 'react';
import type { LockImage } from '@/lib/lock-image';
import { shrinkImage } from '@/lib/shrink-image';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';

// The picture inside the big fingerprint button (lock screen, "confirm with fingerprint" window, settings card).
export default function LockImageSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<string | null | undefined>(undefined);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };

  useEffect(() => {
    adminApi<LockImage>('/api/admin/lock-image').then((d) => { setSaved(d.imageUrl); setDraft(d.imageUrl); }).catch(fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = async (file: File) => {
    setBusy(true); setMsg('');
    try {
      const blob = await shrinkImage(file, 640);
      const fd = new FormData();
      fd.append('file', new File([blob], 'lock.webp', { type: 'image/webp' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      setDraft(d.url);
      setMsg('تم رفع الصورة. اضغط "حفظ" عشان تظهر جوه زر البصمة.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      const d = await adminApi<LockImage>('/api/admin/lock-image', { method: 'PUT', body: JSON.stringify({ imageUrl: draft }) });
      setSaved(d.imageUrl); setDraft(d.imageUrl);
      setMsg('✅ اتحفظ. الصورة بتوصل للزوار خلال دقيقة تقريباً.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const changed = saved !== undefined && saved !== draft;

  return (
    <Card title="🔑 صورة زر البصمة">
      <p className="mb-3 text-xs text-muted-foreground">الصورة دي بتظهر جوه زر البصمة الدائري في شاشة القفل ونافذة التأكيد وإعدادات البصمة. ارفع صورة مربعة (الأفضل 512×512 أو أكبر، JPG أو PNG أو WebP).</p>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-accent bg-background" aria-label="معاينة زر البصمة">
          {draft ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft} alt="" className="h-full w-full object-cover" />
          ) : <span className="px-2 text-center text-[11px] text-muted-foreground">أيقونة البصمة الأصلية</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-center text-sm text-foreground hover:bg-muted">
            {draft ? 'اختيار صورة جديدة' : 'اختيار صورة'}
            <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="اختيار صورة زر البصمة" className="hidden" disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }} />
          </label>
          {draft && <Btn small kind="ghost" onClick={() => setDraft(null)}>رجوع لأيقونة البصمة</Btn>}
        </div>
      </div>
      <Btn onClick={save} disabled={busy || !changed}>{busy ? '...' : '💾 حفظ'}</Btn>
      {msg && <p className="mt-2 text-xs text-foreground">{msg}</p>}
    </Card>
  );
}
