'use client';

import { useEffect, useState } from 'react';
import { FEATURE_ICONS, DEFAULT_ICON_ORDER } from '@/components/home-feature-icon';
import { HOME_FEATURES, HOME_UI } from '@/lib/home-i18n';
import { FEATURE_ICON_KEYS, MAX_FEATURE_ITEMS, MAX_FEATURE_CARDS, MAX_CARD_TITLE, MAX_CARD_TEXT, type FeatureIconKey, type HomeFeatureCard, type HomeFeatureItem, type HomeFeatures } from '@/lib/home-features';
import { shrinkImage } from '@/lib/shrink-image';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';

const ICON_AR: Record<FeatureIconKey, string> = {
  glasses: 'نظارة', zap: 'برق', building: 'مبنى', globe: 'كرة أرضية', bot: 'روبوت', scroll: 'عقد', shield: 'درع', video: 'فيديو',
  chart: 'رسم بياني', trending: 'صعود', languages: 'لغات', star: 'نجمة', coins: 'عملات', lock: 'قفل', gem: 'جوهرة', sparkles: 'لمعة',
};

const builtIn = (): HomeFeatureItem[] => HOME_FEATURES.map((t, i) => ({ icon: DEFAULT_ICON_ORDER[i % DEFAULT_ICON_ORDER.length], t: { ...t } }));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Editing English or Arabic drops the other five translations of that line, so nobody sees an old translation of new text.
const setLang = (t: HomeFeatureItem['t'], lang: 'en' | 'ar', v: string): HomeFeatureItem['t'] => {
  return { en: t.en, ar: t.ar, [lang]: v };
};

export default function HomeFeaturesSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<HomeFeatures | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [title, setTitle] = useState<{ en?: string; ar?: string }>({});
  const [items, setItems] = useState<HomeFeatureItem[]>(builtIn());
  const [cards, setCards] = useState<HomeFeatureCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };
  const apply = (d: HomeFeatures) => {
    setSaved({ enabled: d.enabled, title: d.title, items: d.items, cards: d.cards ?? null });
    setCards(d.cards ? d.cards.map((c) => ({ img: c.img, t: { ...c.t }, d: c.d ? { ...c.d } : null })) : []);
    setEnabled(d.enabled);
    setTitle(d.title ? { en: d.title.en, ar: d.title.ar } : {});
    setItems(d.items ? d.items.map((x) => ({ icon: x.icon, t: { ...x.t } })) : builtIn());
  };

  useEffect(() => {
    adminApi<HomeFeatures>('/api/admin/home-features').then(apply).catch(fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payload = () => ({
    enabled,
    title: title.en || title.ar ? title : null,
    items: same(items, builtIn()) ? null : items.filter((x) => x.t.en || x.t.ar),
    cards: cards.length > 0 ? cards.map((c) => ({ img: c.img, t: c.t, d: c.d && (c.d.en || c.d.ar) ? c.d : null })) : null,
  });

  const save = async (body: object) => {
    setBusy(true); setMsg('');
    try {
      const d = await adminApi<HomeFeatures>('/api/admin/home-features', { method: 'PUT', body: JSON.stringify(body) });
      apply(d);
      setMsg('✅ اتحفظ. التغيير بيوصل للزوار خلال دقيقة تقريباً.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const move = (i: number, d: -1 | 1) => setItems((a) => { const j = i + d; if (j < 0 || j >= a.length) return a; const n = [...a]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const upd = (i: number, f: (x: HomeFeatureItem) => HomeFeatureItem) => setItems((a) => a.map((x, k) => (k === i ? f(x) : x)));
  const inp = 'w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground';
  const changed = !!saved && !same(payload(), { enabled: saved.enabled, title: saved.title, items: saved.items, cards: saved.cards });

  const updCard = (i: number, f: (c: HomeFeatureCard) => HomeFeatureCard) => setCards((a) => a.map((x, k) => (k === i ? f(x) : x)));
  const moveCard = (i: number, d: -1 | 1) => setCards((a) => { const j = i + d; if (j < 0 || j >= a.length) return a; const n = [...a]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const addCard = async (file: File) => {
    setBusy(true); setMsg('');
    try {
      const blob = await shrinkImage(file, 1000, 0.85);
      const fd = new FormData();
      fd.append('file', new File([blob], 'why-card.webp', { type: 'image/webp' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      setCards((a) => [...a, { img: d.url, t: { en: '', ar: '' }, d: null }]);
      setMsg('تم رفع الصورة. اكتب العنوان (مطلوب) وبعدين اضغط "حفظ".');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const replaceImg = async (i: number, file: File) => {
    setBusy(true); setMsg('');
    try {
      const blob = await shrinkImage(file, 1000, 0.85);
      const fd = new FormData();
      fd.append('file', new File([blob], 'why-card.webp', { type: 'image/webp' }));
      const d = await adminApi<{ url: string }>('/api/admin/upload-image', { method: 'POST', body: fd });
      updCard(i, (c) => ({ ...c, img: d.url }));
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  return (
    <Card title="✨ شريط «لماذا تختار RE؟» في الرئيسية">
      <p className="mb-3 text-xs text-muted-foreground">تتحكم في العنوان والجمل والأيقونات وترتيبها، أو تخفي الشريط كله. لو عدّلت جملة بالإنجليزي أو العربي، باقي اللغات (فرنسي/إسباني/برتغالي/أوردو/صيني) بتعرض الإنجليزي لحد ما تكتب الأصل. الألوان بتتبع ألوان المنصة تلقائياً في الدارك والوايت.</p>
      <label className="mb-4 flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        إظهار الشريط في الصفحة الرئيسية
      </label>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs text-foreground/80">العنوان (إنجليزي)
          <input className={inp} dir="ltr" maxLength={80} placeholder={HOME_UI.whyChoose.en} aria-label="عنوان الشريط بالإنجليزي" value={title.en ?? ''} onChange={(e) => setTitle({ ...title, en: e.target.value })} />
        </label>
        <label className="text-xs text-foreground/80">العنوان (عربي)
          <input className={inp} dir="rtl" maxLength={80} placeholder={HOME_UI.whyChoose.ar} aria-label="عنوان الشريط بالعربي" value={title.ar ?? ''} onChange={(e) => setTitle({ ...title, ar: e.target.value })} />
        </label>
      </div>
      <div className="mb-4 rounded-xl border border-border bg-input p-3">
        <h4 className="mb-1 text-sm font-semibold text-foreground">🖼️ كروت بالصور</h4>
        <p className="mb-3 text-xs text-muted-foreground">ارفع صورة واكتب عليها عنوان وسطر قصير (عربي وإنجليزي). بتظهر كصف كروت قابل للتحريك فوق الجمل. لو أضفت لغات تانية بيستخدم الإنجليزي ثم العربي.</p>
        <div className="mb-3 flex flex-col gap-3">
          {cards.map((c, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-border bg-input p-2 sm:flex-row">
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg border border-border sm:w-48" aria-label="معاينة الكارت">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 text-foreground">
                  <p className="text-sm font-bold leading-tight" dir="auto">{c.t.ar || c.t.en || '...'}</p>
                  {(c.d?.ar || c.d?.en) && <p className="text-[11px] leading-snug text-foreground/85" dir="auto">{c.d.ar || c.d.en}</p>}
                </div>
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <input className={inp} dir="ltr" maxLength={MAX_CARD_TITLE} aria-label="عنوان الكارت بالإنجليزي" placeholder="Title (English)" value={c.t.en ?? ''} onChange={(e) => updCard(i, (x) => ({ ...x, t: { en: e.target.value, ar: x.t.ar } }))} />
                <input className={inp} dir="rtl" maxLength={MAX_CARD_TITLE} aria-label="عنوان الكارت بالعربي" placeholder="العنوان (عربي)" value={c.t.ar ?? ''} onChange={(e) => updCard(i, (x) => ({ ...x, t: { en: x.t.en, ar: e.target.value } }))} />
                <input className={inp} dir="ltr" maxLength={MAX_CARD_TEXT} aria-label="السطر تحت العنوان بالإنجليزي" placeholder="Short line (optional)" value={c.d?.en ?? ''} onChange={(e) => updCard(i, (x) => ({ ...x, d: { en: e.target.value, ar: x.d?.ar } }))} />
                <input className={inp} dir="rtl" maxLength={MAX_CARD_TEXT} aria-label="السطر تحت العنوان بالعربي" placeholder="سطر قصير (اختياري)" value={c.d?.ar ?? ''} onChange={(e) => updCard(i, (x) => ({ ...x, d: { en: x.d?.en, ar: e.target.value } }))} />
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                  <label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted">
                    تغيير الصورة
                    <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="تغيير صورة الكارت" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void replaceImg(i, f); e.target.value = ''; }} />
                  </label>
                  <Btn small kind="ghost" onClick={() => moveCard(i, -1)} disabled={i === 0}>↑</Btn>
                  <Btn small kind="ghost" onClick={() => moveCard(i, 1)} disabled={i === cards.length - 1}>↓</Btn>
                  <Btn small kind="danger" onClick={() => setCards((a) => a.filter((_, k) => k !== i))}>حذف</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
        <label className={`inline-block rounded-lg border border-dashed border-accent px-3 py-2 text-sm text-accent ${cards.length >= MAX_FEATURE_CARDS || busy ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent/10'}`}>
          ➕ إضافة كارت بصورة ({cards.length}/{MAX_FEATURE_CARDS})
          <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="إضافة كارت بصورة" className="hidden" disabled={busy || cards.length >= MAX_FEATURE_CARDS} onChange={(e) => { const f = e.target.files?.[0]; if (f) void addCard(f); e.target.value = ''; }} />
        </label>
      </div>
      <div className="mb-3 flex flex-col gap-2">
        {items.map((it, i) => {
          const Icon = FEATURE_ICONS[it.icon];
          return (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-input p-2">
              <Icon className="h-5 w-5 shrink-0 text-accent" />
              <select className={`${inp} !w-auto`} aria-label="الأيقونة" value={it.icon} onChange={(e) => upd(i, (x) => ({ ...x, icon: e.target.value as FeatureIconKey }))}>
                {FEATURE_ICON_KEYS.map((k) => <option key={k} value={k}>{ICON_AR[k]}</option>)}
              </select>
              <input className={`${inp} min-w-[8rem] flex-1`} dir="ltr" maxLength={80} aria-label="الجملة بالإنجليزي" placeholder="English" value={it.t.en ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, t: setLang(x.t, 'en', e.target.value) }))} />
              <input className={`${inp} min-w-[8rem] flex-1`} dir="rtl" maxLength={80} aria-label="الجملة بالعربي" placeholder="عربي" value={it.t.ar ?? ''} onChange={(e) => upd(i, (x) => ({ ...x, t: setLang(x.t, 'ar', e.target.value) }))} />
              <Btn small kind="ghost" onClick={() => move(i, -1)} disabled={i === 0}>↑</Btn>
              <Btn small kind="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</Btn>
              <Btn small kind="danger" onClick={() => setItems((a) => a.filter((_, k) => k !== i))}>حذف</Btn>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn kind="ghost" disabled={items.length >= MAX_FEATURE_ITEMS} onClick={() => setItems((a) => [...a, { icon: 'star', t: { en: '', ar: '' } }])}>➕ إضافة جملة ({items.length}/{MAX_FEATURE_ITEMS})</Btn>
        <Btn onClick={() => save(payload())} disabled={busy || !changed}>{busy ? '...' : '💾 حفظ'}</Btn>
        <Btn kind="ghost" disabled={busy} onClick={() => save({ enabled: true, title: null, items: null, cards: null })}>↩ رجوع للأصلي</Btn>
      </div>
      {msg && <p className="mt-2 text-xs text-foreground">{msg}</p>}
    </Card>
  );
}
