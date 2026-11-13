'use client';

import { useEffect, useState } from 'react';
import { FEATURE_ICONS, DEFAULT_ICON_ORDER } from '@/components/home-feature-icon';
import { HOME_FEATURES, HOME_UI } from '@/lib/home-i18n';
import { FEATURE_ICON_KEYS, MAX_FEATURE_ITEMS, type FeatureIconKey, type HomeFeatureItem, type HomeFeatures } from '@/lib/home-features';
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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof UnauthorizedError) onUnauthorized();
    else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ'));
  };
  const apply = (d: HomeFeatures) => {
    setSaved({ enabled: d.enabled, title: d.title, items: d.items });
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
  const inp = 'w-full rounded-lg border border-[#3a3a3a] bg-[#161616] px-2 py-1.5 text-sm text-gray-100';
  const changed = !!saved && !same(payload(), { enabled: saved.enabled, title: saved.title, items: saved.items });

  return (
    <Card title="✨ شريط «لماذا تختار RE؟» في الرئيسية">
      <p className="mb-3 text-xs text-gray-400">تتحكم في العنوان والجمل والأيقونات وترتيبها، أو تخفي الشريط كله. لو عدّلت جملة بالإنجليزي أو العربي، باقي اللغات (فرنسي/إسباني/برتغالي/أوردو/صيني) بتعرض الإنجليزي لحد ما تكتب الأصل. الألوان بتتبع ألوان المنصة تلقائياً في الدارك والوايت.</p>
      <label className="mb-4 flex items-center gap-2 text-sm text-gray-100">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        إظهار الشريط في الصفحة الرئيسية
      </label>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs text-gray-300">العنوان (إنجليزي)
          <input className={inp} dir="ltr" maxLength={80} placeholder={HOME_UI.whyChoose.en} aria-label="عنوان الشريط بالإنجليزي" value={title.en ?? ''} onChange={(e) => setTitle({ ...title, en: e.target.value })} />
        </label>
        <label className="text-xs text-gray-300">العنوان (عربي)
          <input className={inp} dir="rtl" maxLength={80} placeholder={HOME_UI.whyChoose.ar} aria-label="عنوان الشريط بالعربي" value={title.ar ?? ''} onChange={(e) => setTitle({ ...title, ar: e.target.value })} />
        </label>
      </div>
      <div className="mb-3 flex flex-col gap-2">
        {items.map((it, i) => {
          const Icon = FEATURE_ICONS[it.icon];
          return (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#101010] p-2">
              <Icon className="h-5 w-5 shrink-0 text-[#D4AF37]" />
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
        <Btn kind="ghost" disabled={busy} onClick={() => save({ enabled: true, title: null, items: null })}>↩ رجوع للأصلي</Btn>
      </div>
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
