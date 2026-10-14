'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls } from './admin-ui';
import { COUNTRIES, type LegalProfile } from '@/lib/legal-profiles';

const FIELDS: { k: 'statusLine' | 'governingLaw' | 'extraClause' | 'noticeEn' | 'noticeAr'; label: string; long?: boolean }[] = [
  { k: 'statusLine', label: 'سطر الحالة أعلى العقد (English)' },
  { k: 'governingLaw', label: 'القانون الحاكم (English، يكمل "governed by ...")' },
  { k: 'extraClause', label: 'بند إضافي في العقد (English، اختياري)', long: true },
  { k: 'noticeEn', label: 'تنبيه المشتري (English)', long: true },
  { k: 'noticeAr', label: 'تنبيه المشتري (عربي)', long: true },
];

export default function LegalSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [code, setCode] = useState('EG');
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [defaults, setDefaults] = useState<LegalProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setForm(null); setMsg('');
    adminApi<{ defaults: LegalProfile; current: LegalProfile }>(`/api/admin/legal?country=${code}`)
      .then((d) => { setDefaults(d.defaults); setForm({ ...d.current } as any); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [code, onUnauthorized]);

  // Only fields that differ from the built-in text are stored, so "reset" simply clears them.
  const save = async (reset = false) => {
    if (!form || !defaults) return;
    const override: Record<string, string> = {};
    if (!reset) for (const f of FIELDS) if ((form[f.k] || '').trim() !== (defaults[f.k] || '').trim()) override[f.k] = form[f.k];
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/legal', { method: 'PUT', body: JSON.stringify({ country: code, override }) });
      if (reset) setForm({ ...defaults } as any);
      setMsg(reset ? '✅ رجع للنص الأصلي.' : '✅ اتحفظ. العقود الجديدة هتستخدم النص ده.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="⚖️ قانون كل دولة">
      <p className="mb-3 text-xs text-gray-400">
        نص العقد وتنبيه المشتري بيتحددوا حسب بلد العقار. النصوص الافتراضية عامة ومش بتذكر مواد قانونية. ياريت محامي البلد يراجعها ويعدّلها هنا قبل الاستخدام الحقيقي. التعديل بيسري على العقود الجديدة فقط.
      </p>
      <Field label="البلد">
        <select className={inputCls} value={code} onChange={(e) => setCode(e.target.value)}>
          {Object.entries(COUNTRIES).map(([c, n]) => <option key={c} value={c}>{n.ar} ({c})</option>)}
        </select>
      </Field>
      {!form && !msg && <p className="mt-3 text-xs text-gray-400">...جاري التحميل</p>}
      {form && (
        <div className="mt-3 space-y-3">
          {FIELDS.map((f) => (
            <Field key={f.k} label={f.label}>
              {f.long
                ? <textarea rows={3} className={inputCls} dir="auto" value={form[f.k] || ''} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />
                : <input className={inputCls} dir="auto" value={form[f.k] || ''} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />}
            </Field>
          ))}
          <div className="flex gap-2">
            <Btn onClick={() => save(false)} disabled={busy}>{busy ? '...' : '💾 حفظ'}</Btn>
            <Btn kind="ghost" onClick={() => save(true)} disabled={busy}>↩️ رجوع للأصلي</Btn>
          </div>
        </div>
      )}
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
