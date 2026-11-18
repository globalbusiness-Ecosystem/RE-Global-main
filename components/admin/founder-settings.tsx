'use client';

import { useEffect, useState } from 'react';
import { MAX_FOUNDER_NAME, MAX_FOUNDER_ROLE, MAX_FOUNDER_BIO, MAX_FOUNDER_QUOTE, type Founder } from '@/lib/founder';
import { shrinkImage } from '@/lib/shrink-image';
import { authHeaders } from '@/lib/api-token';
import { adminApi, UnauthorizedError, Btn, Card, inputCls } from './admin-ui';

type Status = { linked: boolean; linkedToMe: boolean; signedIn: boolean };
type Draft = Omit<Founder, 'role' | 'bio' | 'quote'> & { role: { en: string; ar: string }; bio: { en: string; ar: string }; quote: { en: string; ar: string } };
const t2 = (v: { en?: string; ar?: string } | null) => ({ en: v?.en ?? '', ar: v?.ar ?? '' });
const toDraft = (f: Founder): Draft => ({ ...f, role: t2(f.role), bio: t2(f.bio), quote: t2(f.quote) });
const pack = (v: { en: string; ar: string }) => (v.en.trim() || v.ar.trim() ? { en: v.en, ar: v.ar } : null);
const payload = (d: Draft) => ({ enabled: d.enabled, name: d.name ?? '', photoUrl: d.photoUrl ?? '', role: pack(d.role), bio: pack(d.bio), quote: pack(d.quote), linkedin: d.linkedin ?? '', website: d.website ?? '' });

// "المؤسس" on the About page: photo and words, and which account is the founder (the platform then shows it a 👑 Founder label).
export default function FounderSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState('');
  const [status, setStatus] = useState<Status>({ linked: false, linkedToMe: false, signedIn: false });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };
  const apply = (d: Founder & Status) => { const x = toDraft(d); setDraft(x); setSaved(JSON.stringify(payload(x))); setStatus({ linked: d.linked, linkedToMe: d.linkedToMe, signedIn: d.signedIn }); };
  const call = (init?: RequestInit) => adminApi<Founder & Status>('/api/admin/founder', { ...init, headers: { ...(init?.headers as Record<string, string>), ...authHeaders() } });

  useEffect(() => { call().then(apply).catch(fail); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const upload = async (file: File) => {
    setBusy(true); setMsg('');
    try {
      const blob = await shrinkImage(file, 900, 0.88);
      const fd = new FormData();
      fd.append('file', new File([blob], 'founder.webp', { type: 'image/webp' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      setDraft((x) => (x ? { ...x, photoUrl: d.url } : x));
      setMsg('تم رفع الصورة. اضغط "حفظ" عشان تظهر.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const save = async () => {
    if (!draft) return;
    setBusy(true); setMsg('');
    try { apply(await call({ method: 'PUT', body: JSON.stringify(payload(draft)) })); setMsg('✅ اتحفظ. بيظهر للزوار خلال دقيقة تقريباً.'); } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const link = async (on: boolean) => {
    setBusy(true); setMsg('');
    try { apply(await call({ method: 'PUT', body: JSON.stringify({ linkMe: on }) })); setMsg(on ? '✅ حسابك الحالي اتربط كمؤسس.' : '✅ اتفك الربط.'); } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const changed = !!draft && JSON.stringify(payload(draft)) !== saved;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((x) => (x ? { ...x, [k]: v } : x));
  const setLang = (k: 'role' | 'bio' | 'quote', l: 'en' | 'ar', v: string) => setDraft((x) => (x ? { ...x, [k]: { ...x[k], [l]: v } } : x));

  return (
    <Card title="👑 المؤسس: صورتك وكلمتك في «نبذة عنا»">
      <p className="mb-3 text-xs text-gray-400">بيظهر كارت «تعرّف على المؤسس» في صفحة «نبذة عنا» لما تكتب الاسم. وبعد ما تربط حسابك، المنصة بتعرفك وبتظهر لك علامة 👑 المؤسس مع الشارة الذهبية جنب اسمك.</p>
      {draft ? (
        <>
          <div className="mb-4 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-3">
            <p className="mb-2 text-sm text-gray-100">{status.linkedToMe ? '✅ حسابك الحالي هو المؤسس' : status.linked ? 'فيه حساب مربوط كمؤسس (مش الحساب اللي مسجّل بيه حالياً)' : 'مفيش حساب مربوط كمؤسس لسه'}</p>
            {!status.signedIn && <p className="mb-2 text-xs text-amber-400">لازم تكون مسجّل دخول في التطبيق من نفس المتصفح عشان تربط حسابك.</p>}
            <div className="flex flex-wrap gap-2">
              <Btn small onClick={() => void link(true)} disabled={busy || !status.signedIn || status.linkedToMe}>اربط حسابي الحالي كمؤسس</Btn>
              {status.linked && <Btn small kind="ghost" onClick={() => void link(false)} disabled={busy}>فك الربط</Btn>}
            </div>
          </div>

          <label className="mb-3 flex items-center gap-2 text-sm text-gray-100"><input type="checkbox" checked={draft.enabled} onChange={(e) => set('enabled', e.target.checked)} /> إظهار كارت المؤسس</label>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[#d4af37] bg-[#101010]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {draft.photoUrl ? <img src={draft.photoUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-[11px] text-gray-500">من غير صورة</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded-lg border border-[#3a3a3a] px-3 py-2 text-center text-sm text-gray-200 hover:bg-[#1f1f1f]">
                {draft.photoUrl ? 'تغيير الصورة' : 'ارفع صورتك'}
                <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="رفع صورة المؤسس" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }} />
              </label>
              {draft.photoUrl && <Btn small kind="ghost" onClick={() => set('photoUrl', null)}>إزالة الصورة</Btn>}
            </div>
          </div>
          <input aria-label="الاسم" placeholder="الاسم (مطلوب)" maxLength={MAX_FOUNDER_NAME} value={draft.name ?? ''} onChange={(e) => set('name', e.target.value || null)} className={inputCls + ' mb-2'} />
          <div className="mb-2 grid gap-2 sm:grid-cols-2">
            <input aria-label="المسمى بالعربي" dir="rtl" placeholder="المسمى (عربي) مثال: المؤسس والرئيس التنفيذي" maxLength={MAX_FOUNDER_ROLE} value={draft.role.ar} onChange={(e) => setLang('role', 'ar', e.target.value)} className={inputCls} />
            <input aria-label="المسمى بالإنجليزي" dir="ltr" placeholder="Title (English)" maxLength={MAX_FOUNDER_ROLE} value={draft.role.en} onChange={(e) => setLang('role', 'en', e.target.value)} className={inputCls} />
            <textarea aria-label="النبذة بالعربي" dir="rtl" rows={5} placeholder="نبذة عنك (عربي)" maxLength={MAX_FOUNDER_BIO} value={draft.bio.ar} onChange={(e) => setLang('bio', 'ar', e.target.value)} className={inputCls} />
            <textarea aria-label="النبذة بالإنجليزي" dir="ltr" rows={5} placeholder="About you (English)" maxLength={MAX_FOUNDER_BIO} value={draft.bio.en} onChange={(e) => setLang('bio', 'en', e.target.value)} className={inputCls} />
            <input aria-label="اقتباس بالعربي" dir="rtl" placeholder="اقتباس أو رسالة قصيرة (عربي)" maxLength={MAX_FOUNDER_QUOTE} value={draft.quote.ar} onChange={(e) => setLang('quote', 'ar', e.target.value)} className={inputCls} />
            <input aria-label="اقتباس بالإنجليزي" dir="ltr" placeholder="Short quote (English)" maxLength={MAX_FOUNDER_QUOTE} value={draft.quote.en} onChange={(e) => setLang('quote', 'en', e.target.value)} className={inputCls} />
            <input aria-label="لينكدإن" dir="ltr" placeholder="https://www.linkedin.com/in/..." maxLength={300} value={draft.linkedin ?? ''} onChange={(e) => set('linkedin', e.target.value || null)} className={inputCls} />
            <input aria-label="الموقع" dir="ltr" placeholder="https://الموقع" maxLength={300} value={draft.website ?? ''} onChange={(e) => set('website', e.target.value || null)} className={inputCls} />
          </div>
          <Btn onClick={() => void save()} disabled={busy || !changed}>{busy ? '...' : '💾 حفظ'}</Btn>
        </>
      ) : <p className="text-sm text-gray-400">...</p>}
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
