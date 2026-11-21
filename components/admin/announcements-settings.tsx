'use client';

import { useEffect, useState } from 'react';
import { ANNOUNCEMENT_KINDS, LINK_PAGES, MAX_ANNOUNCEMENTS, MAX_ANN_TITLE, MAX_ANN_TEXT, MAX_ANN_LABEL, type Announcement, type Announcements } from '@/lib/announcements';
import { ANN_EMOJI } from '@/lib/announcements-i18n';
import { parseVideoUrl } from '@/lib/video-embed';
import { shrinkImage } from '@/lib/shrink-image';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';

const KIND_AR: Record<Announcement['kind'], string> = { offer: 'عرض', partnership: 'شراكة', event: 'فعالية', news: 'خبر', video: 'فيديو' };
const PAGE_AR: Record<string, string> = {
  buy: 'شراء', rent: 'إيجار', hotel: 'فنادق', invest: 'استثمار', tokenized: 'توكنز عقاري', 'share-market': 'سوق الحصص', abroad: 'عقارات بالخارج',
  offplan: 'على الخريطة', map: 'الخريطة', partners: 'الشركاء', analytics: 'التحليلات', contracts: 'العقود', 're-token': 'RE Token', about: 'نبذة عنا', whitepaper: 'الورقة البيضاء', guide: 'دليل البداية',
};
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const blank = (kind: Announcement['kind'] = 'offer'): Announcement => ({ kind, active: true, img: null, t: { en: '', ar: '' }, d: null, date: null, link: null, linkLabel: null, video: null });

export default function AnnouncementsSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<Announcements | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [title, setTitle] = useState<{ en?: string; ar?: string }>({});
  const [items, setItems] = useState<Announcement[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };
  const apply = (d: Announcements) => {
    setSaved({ enabled: d.enabled, showStats: d.showStats, title: d.title, items: d.items });
    setEnabled(d.enabled); setShowStats(d.showStats);
    setTitle(d.title ? { en: d.title.en, ar: d.title.ar } : {});
    setItems(d.items.map((x) => ({ ...x, t: { ...x.t }, d: x.d ? { ...x.d } : null, linkLabel: x.linkLabel ? { ...x.linkLabel } : null })));
  };
  useEffect(() => {
    adminApi<Announcements>('/api/admin/announcements').then(apply).catch(fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payload = () => ({
    enabled, showStats,
    title: title.en || title.ar ? title : null,
    items: items.map((x) => ({ ...x, d: x.d && (x.d.en || x.d.ar) ? x.d : null, linkLabel: x.link && x.linkLabel && (x.linkLabel.en || x.linkLabel.ar) ? x.linkLabel : null, date: x.date || null, video: x.video?.trim() || null, link: x.link?.trim() || null })),
  });
  const changed = !!saved && !same(payload(), { enabled: saved.enabled, showStats: saved.showStats, title: saved.title, items: saved.items });

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      const d = await adminApi<Announcements>('/api/admin/announcements', { method: 'PUT', body: JSON.stringify(payload()) });
      apply(d);
      setMsg('✅ اتحفظ. التغيير بيوصل للزوار خلال دقيقة تقريباً.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const upd = (i: number, f: (x: Announcement) => Announcement) => setItems((a) => a.map((x, k) => (k === i ? f(x) : x)));
  const move = (i: number, d: -1 | 1) => setItems((a) => { const j = i + d; if (j < 0 || j >= a.length) return a; const n = [...a]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const upload = async (i: number, file: File) => {
    setBusy(true); setMsg('');
    try {
      const blob = await shrinkImage(file, 1000, 0.85);
      const fd = new FormData();
      fd.append('file', new File([blob], 'announcement.webp', { type: 'image/webp' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      upd(i, (x) => ({ ...x, img: d.url }));
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const MAX_VIDEO_MB = 50;
  const uploadVideo = async (i: number, file: File) => {
    const type = file.type === 'video/quicktime' || file.type === 'video/webm' ? file.type : 'video/mp4';
    if (!/^video\/(mp4|webm|quicktime)$/.test(file.type)) { setMsg('❌ الفيديو لازم يكون MP4 أو WebM أو MOV'); return; }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) { setMsg(`❌ الفيديو أكبر من ${MAX_VIDEO_MB}MB. ضغطه أو حطه على يوتيوب وحط الرابط.`); return; }
    setBusy(true); setMsg('جاري تجهيز الرفع...');
    try {
      const d = await adminApi<{ uploadUrl: string; publicUrl: string }>('/api/admin/video-upload-url', { method: 'POST', body: JSON.stringify({ type }) });
      await new Promise<void>((resolve, reject) => {
        const x = new XMLHttpRequest();
        x.open('PUT', d.uploadUrl);
        x.setRequestHeader('Content-Type', type);
        x.upload.onprogress = (e) => { if (e.lengthComputable) setMsg(`⬆️ جاري رفع الفيديو ${Math.round((e.loaded / e.total) * 100)}%`); };
        x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error('فشل رفع الفيديو (' + x.status + ')')));
        x.onerror = () => reject(new Error('فشل رفع الفيديو: مشكلة اتصال'));
        x.send(file);
      });
      upd(i, (x) => ({ ...x, video: d.publicUrl }));
      setMsg('✅ الفيديو اترفع. اضغط "حفظ".');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const inp = 'w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground';
  const linkMode = (l: string | null) => (l === null ? 'none' : l.startsWith('page:') ? l : 'url');

  return (
    <Card title="📣 الإعلانات والفيديوهات في الرئيسية">
      <p className="mb-3 text-xs text-muted-foreground">بتظهر مكان مربعات الإحصائيات القديمة (عقارات/دول/مستثمرين/حجم) اللي كانت أرقام تجريبية. العرض والفعالية بيختفوا تلقائياً تاني يوم من تاريخهم. الفيديو بيتحط كرابط يوتيوب أو فيمو أو ملف mp4 على https (مش رفع ملفات فيديو كبيرة).</p>
      <label className="mb-2 flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> إظهار لوحة الإعلانات</label>
      <label className="mb-4 flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={showStats} onChange={(e) => setShowStats(e.target.checked)} /> رجّع مربعات الإحصائيات القديمة (مش مفضّل: أرقامها تجريبية)</label>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input className={inp} dir="ltr" maxLength={80} aria-label="عنوان اللوحة بالإنجليزي" placeholder="Board title (English)" value={title.en ?? ''} onChange={(e) => setTitle({ en: e.target.value, ar: title.ar })} />
        <input className={inp} dir="rtl" maxLength={80} aria-label="عنوان اللوحة بالعربي" placeholder="عنوان اللوحة (عربي)" value={title.ar ?? ''} onChange={(e) => setTitle({ en: title.en, ar: e.target.value })} />
      </div>
      <div className="mb-3 flex flex-col gap-3">
        {items.map((a, i) => {
          const vOk = !a.video || !!parseVideoUrl(a.video);
          return (
            <div key={i} className="rounded-xl border border-border bg-input p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <select aria-label="النوع" className={inp + ' !w-auto'} value={a.kind} onChange={(e) => upd(i, (x) => ({ ...x, kind: e.target.value as Announcement['kind'] }))}>
                  {ANNOUNCEMENT_KINDS.map((k) => <option key={k} value={k}>{ANN_EMOJI[k]} {KIND_AR[k]}</option>)}
                </select>
                <label className="flex items-center gap-1 text-xs text-foreground/80"><input type="checkbox" checked={a.active} onChange={(e) => upd(i, (x) => ({ ...x, active: e.target.checked }))} /> ظاهر</label>
                <input type="date" aria-label="التاريخ" className={inp + ' !w-auto'} value={a.date ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, date: e.target.value || null }))} />
                <span className="flex-1" />
                <Btn small kind="ghost" onClick={() => move(i, -1)} disabled={i === 0}>↑</Btn>
                <Btn small kind="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</Btn>
                <Btn small kind="danger" onClick={() => setItems((l) => l.filter((_, k) => k !== i))}>حذف</Btn>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input className={inp} dir="ltr" maxLength={MAX_ANN_TITLE} aria-label="العنوان بالإنجليزي" placeholder="Title (English)" value={a.t.en ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, t: { en: e.target.value, ar: x.t.ar } }))} />
                <input className={inp} dir="rtl" maxLength={MAX_ANN_TITLE} aria-label="العنوان بالعربي" placeholder="العنوان (عربي)" value={a.t.ar ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, t: { en: x.t.en, ar: e.target.value } }))} />
                <input className={inp} dir="ltr" maxLength={MAX_ANN_TEXT} aria-label="الوصف بالإنجليزي" placeholder="Short text (optional)" value={a.d?.en ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, d: { en: e.target.value, ar: x.d?.ar } }))} />
                <input className={inp} dir="rtl" maxLength={MAX_ANN_TEXT} aria-label="الوصف بالعربي" placeholder="وصف قصير (اختياري)" value={a.d?.ar ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, d: { en: x.d?.en, ar: e.target.value } }))} />
                <div className="sm:col-span-2">
                  <input className={inp} dir="ltr" aria-label="رابط الفيديو" placeholder={a.kind === 'video' ? 'رابط الفيديو (مطلوب): YouTube / Vimeo / .mp4' : 'رابط فيديو (اختياري)'} value={a.video ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, video: e.target.value || null }))} />
                  <label className="mt-1 inline-block cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted">
                    أو ارفع ملف فيديو (MP4/WebM/MOV حتى 50MB)
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" aria-label="رفع فيديو" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadVideo(i, f); e.target.value = ''; }} />
                  </label>
                  {a.video && <p className={`mt-1 text-xs ${vOk ? 'text-green-400' : 'text-red-400'}`}>{vOk ? '✓ رابط فيديو صالح' : '✗ لازم رابط https ليوتيوب أو فيمو أو ملف mp4/webm'}</p>}
                </div>
                <select aria-label="الرابط" className={inp} value={linkMode(a.link)} onChange={(e) => { const v = e.target.value; upd(i, (x) => ({ ...x, link: v === 'none' ? null : v === 'url' ? 'https://' : v })); }}>
                  <option value="none">بدون زر</option>
                  {LINK_PAGES.map((p) => <option key={p} value={`page:${p}`}>يفتح صفحة: {PAGE_AR[p] ?? p}</option>)}
                  <option value="url">رابط خارجي https</option>
                </select>
                {a.link !== null && !a.link.startsWith('page:') && <input className={inp} dir="ltr" aria-label="الرابط الخارجي" placeholder="https://..." value={a.link} onChange={(e) => upd(i, (x) => ({ ...x, link: e.target.value }))} />}
                {a.link !== null && (
                  <>
                    <input className={inp} dir="ltr" maxLength={MAX_ANN_LABEL} aria-label="كلمة الزر بالإنجليزي" placeholder="Button text (English)" value={a.linkLabel?.en ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, linkLabel: { en: e.target.value, ar: x.linkLabel?.ar } }))} />
                    <input className={inp} dir="rtl" maxLength={MAX_ANN_LABEL} aria-label="كلمة الزر بالعربي" placeholder="كلمة الزر (عربي)" value={a.linkLabel?.ar ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, linkLabel: { en: x.linkLabel?.en, ar: e.target.value } }))} />
                  </>
                )}
                <div className="flex items-center gap-2 sm:col-span-2">
                  {a.img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.img} alt="" className="h-12 w-20 rounded object-cover" />}
                  <label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted">
                    {a.img ? 'تغيير الصورة' : 'رفع صورة (اختياري)'}
                    <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="رفع صورة الإعلان" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(i, f); e.target.value = ''; }} />
                  </label>
                  {a.img && <Btn small kind="ghost" onClick={() => upd(i, (x) => ({ ...x, img: null }))}>شيل الصورة</Btn>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Btn kind="ghost" disabled={items.length >= MAX_ANNOUNCEMENTS || busy} onClick={() => setItems((l) => [...l, blank()])}>＋ إعلان جديد ({items.length}/{MAX_ANNOUNCEMENTS})</Btn>
        <Btn onClick={() => void save()} disabled={busy || !changed}>{busy ? '...' : 'حفظ'}</Btn>
        {msg && <span className="text-xs text-foreground/80">{msg}</span>}
      </div>
    </Card>
  );
}
