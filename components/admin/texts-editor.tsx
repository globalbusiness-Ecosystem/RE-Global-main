'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Empty, inputCls, GOLD } from './admin-ui';
import { flattenTexts, type TextLang, type TextPage } from '@/lib/site-texts';
import { INSPECTIONS_I18N } from '@/lib/inspections-i18n';
import { RE_TOKEN_I18N } from '@/lib/re-token-i18n';
import { WHITEPAPER_I18N } from '@/lib/whitepaper-i18n';

const PAGES: Record<TextPage, { label: string; defaults: Record<string, any> }> = {
  inspections: { label: '🔍 الفحوصات', defaults: INSPECTIONS_I18N },
  retoken: { label: '🪙 توكن RE', defaults: RE_TOKEN_I18N },
  whitepaper: { label: '📄 الورقة البيضاء', defaults: WHITEPAPER_I18N },
};

export default function TextsEditor({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [page, setPage] = useState<TextPage>('inspections');
  const [lang, setLang] = useState<TextLang>('ar');
  const [saved, setSaved] = useState<Record<string, string> | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const defaults = useMemo(() => flattenTexts(PAGES[page].defaults[lang]), [page, lang]);

  useEffect(() => {
    setSaved(null); setMsg('');
    adminApi<{ texts: Record<string, Record<string, string>> }>(`/api/admin/texts?page=${page}`)
      .then((d) => { const cur = d.texts?.[lang] || {}; setSaved(cur); setEdits(cur); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [page, lang, onUnauthorized]);

  const keys = useMemo(() => {
    const n = q.trim().toLowerCase();
    return Object.keys(defaults).filter((k) => !n || k.toLowerCase().includes(n) || defaults[k].toLowerCase().includes(n) || (edits[k] || '').toLowerCase().includes(n));
  }, [defaults, q, edits]);

  const changedCount = Object.entries(edits).filter(([k, v]) => v.trim() && v.trim() !== defaults[k]).length;

  const save = async () => {
    const overrides: Record<string, string> = {};
    for (const [k, v] of Object.entries(edits)) if (k in defaults && v.trim() && v.trim() !== defaults[k]) overrides[k] = v.trim();
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/texts', { method: 'PUT', body: JSON.stringify({ page, lang, overrides }) });
      setSaved(overrides); setEdits(overrides);
      setMsg('✅ اتحفظ. بيظهر للزوار خلال دقيقة تقريباً.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card title="✍️ نصوص الصفحات" right={<Btn small onClick={save} disabled={busy || saved === null}>{busy ? '...' : '💾 حفظ'}</Btn>}>
        <p className="mb-3 text-xs text-gray-400">اختار الصفحة واللغة، واكتب النص الجديد تحت أي سطر. السطر الفاضي بيفضل زي ما هو. امسح النص عشان ترجع للأصلي.</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PAGES) as TextPage[]).map((p) => (
            <Btn key={p} small kind={page === p ? 'gold' : 'ghost'} onClick={() => setPage(p)}>{PAGES[p].label}</Btn>
          ))}
          <span className="mx-1 w-px bg-[#2a2a2a]" />
          <Btn small kind={lang === 'ar' ? 'gold' : 'ghost'} onClick={() => setLang('ar')}>عربي</Btn>
          <Btn small kind={lang === 'en' ? 'gold' : 'ghost'} onClick={() => setLang('en')}>English</Btn>
        </div>
        <input className={`${inputCls} mt-3`} placeholder="🔎 دوّر في النصوص..." aria-label="دوّر في النصوص..." value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="mt-2 text-[11px]" style={{ color: GOLD }}>{changedCount} نص معدّل من {Object.keys(defaults).length}</p>
        {msg && <p className="mt-1 text-xs text-gray-200">{msg}</p>}
      </Card>
      {saved === null && !msg && <Empty>...جاري التحميل</Empty>}
      {saved !== null && keys.length === 0 && <Empty>مفيش نتائج.</Empty>}
      {saved !== null && keys.map((k) => {
        const long = defaults[k].length > 80;
        const changed = !!edits[k]?.trim() && edits[k].trim() !== defaults[k];
        return (
          <div key={k} className={`rounded-xl border p-3 ${changed ? 'border-[#d4af37]/60' : 'border-[#2a2a2a]'} bg-[#141414]`}>
            <p className="text-[10px] text-gray-500" dir="ltr">{k}</p>
            <p className="mb-2 text-xs text-gray-400" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{defaults[k]}</p>
            {long ? (
              <textarea rows={3} className={inputCls} dir={lang === 'ar' ? 'rtl' : 'ltr'} placeholder="النص الجديد (اختياري)" aria-label="النص الجديد (اختياري)" value={edits[k] || ''} onChange={(e) => setEdits((s) => ({ ...s, [k]: e.target.value }))} />
            ) : (
              <input className={inputCls} dir={lang === 'ar' ? 'rtl' : 'ltr'} placeholder="النص الجديد (اختياري)" aria-label="النص الجديد (اختياري)" value={edits[k] || ''} onChange={(e) => setEdits((s) => ({ ...s, [k]: e.target.value }))} />
            )}
          </div>
        );
      })}
    </div>
  );
}
