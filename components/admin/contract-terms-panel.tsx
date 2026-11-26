'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, Badge, inputCls } from './admin-ui';
import type { ClauseEdit, CustomClause } from '@/lib/contract-terms';

type Item = { id: string; title: string; kinds: string[]; locked: boolean; editable: boolean; disableable: boolean; text: string };
type Hist = { revision: number; savedAt: string; note: string; edits: number };
type Data = { revision: number; current: { clauses: Record<string, ClauseEdit>; custom: CustomClause[] }; catalog: Item[]; history: Hist[]; kinds: string[]; variables: string[] };

const KIND_LABELS: Record<string, string> = { sale: 'شراء عقار', invest: 'حصص', rent: 'إيجار', hotel: 'فندق', resale: 'إعادة بيع حصص' };

export default function ContractTermsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [clauses, setClauses] = useState<Record<string, ClauseEdit>>({});
  const [custom, setCustom] = useState<CustomClause[]>([]);
  const [note, setNote] = useState('');
  const [kind, setKind] = useState('invest');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = useCallback((e: any) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message); }, [onUnauthorized]);

  const load = useCallback(() => {
    adminApi<Data>('/api/admin/contract-terms')
      .then((d) => { setData(d); setClauses(d.current.clauses); setCustom(d.current.custom); })
      .catch(fail);
  }, [fail]);
  useEffect(load, [load]);

  const draft = () => ({ clauses, custom });
  const setEdit = (id: string, e: ClauseEdit) => setClauses((c) => {
    const next = { ...c, [id]: { ...c[id], ...e } };
    if (!next[id].text && !next[id].disabled) delete next[id];
    return next;
  });

  const run = async (body: object, ok: (r: any) => void) => {
    setBusy(true); setMsg('');
    try { ok(await adminApi('/api/admin/contract-terms', { method: 'POST', body: JSON.stringify(body) })); }
    catch (e: any) { fail(e); }
    setBusy(false);
  };

  if (!data) return <Card title="📜 بنود العقد">{msg || 'جاري التحميل...'}</Card>;

  return (
    <Card title="📜 بنود العقد (إطار RE Global)" right={<Badge tone="gold">نسخة منشورة: {data.revision}</Badge>} className="mt-4">
      <p className="mb-3 text-xs text-muted-foreground">
        تعديل النص بيأثر على العقود الجديدة بس. العقود الموقّعة قبل كده بتفضل زي ما هي. البنود المقفولة (🔒) تخص الدفع والاسترداد والتوقيع والبيانات والقانون الحاكم والمرحلة التجريبية، وبتتغير من الكود بس. النص لازم يبقى إنجليزي لأنه النص الموقّع. ممنوع كلمات زي "عائد مضمون" و"متوافق مع" و"معتمد من". المتغيرات المسموحة: {data.variables.map((v) => `{{${v}}}`).join(' ')}.
      </p>
      <div className="space-y-3">
        {data.catalog.map((c) => {
          const e = clauses[c.id] || {};
          return (
            <div key={c.id} className="rounded-xl border border-border p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-sm font-bold">
                {c.locked ? '🔒' : '✏️'} {c.title}
                <span className="text-xs font-normal text-muted-foreground">({c.kinds.map((k) => KIND_LABELS[k] || k).join('، ')})</span>
                {e.text && <Badge tone="gold">معدّل</Badge>}{e.disabled && <Badge tone="red">متوقف</Badge>}
              </div>
              {c.locked ? <p className="text-xs text-muted-foreground" dir="ltr">{c.text}</p> : (
                <>
                  <textarea dir="ltr" rows={4} aria-label={c.title} className={inputCls} value={e.text ?? c.text} disabled={e.disabled}
                    onChange={(ev) => setEdit(c.id, { text: ev.target.value === c.text ? undefined : ev.target.value })} />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {e.text && <Btn small kind="ghost" onClick={() => setEdit(c.id, { text: undefined })}>رجّع النص الأصلي</Btn>}
                    {c.disableable && (
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={!!e.disabled} onChange={(ev) => setEdit(c.id, { disabled: ev.target.checked || undefined })} /> إيقاف البند ده
                      </label>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div className="rounded-xl border border-dashed border-border p-3">
          <div className="mb-2 text-sm font-bold">➕ بنود إضافية (بتظهر قبل بند القانون الحاكم)</div>
          {custom.map((c, i) => (
            <div key={i} className="mb-2 space-y-2">
              <input dir="ltr" aria-label="Clause title" className={inputCls} placeholder="Title" value={c.title} onChange={(ev) => setCustom(custom.map((x, j) => (j === i ? { ...x, title: ev.target.value } : x)))} />
              <textarea dir="ltr" rows={3} aria-label="Clause text" className={inputCls} placeholder="Clause text" value={c.text} onChange={(ev) => setCustom(custom.map((x, j) => (j === i ? { ...x, text: ev.target.value } : x)))} />
              <Btn small kind="danger" onClick={() => setCustom(custom.filter((_, j) => j !== i))}>حذف البند</Btn>
            </div>
          ))}
          <Btn small kind="ghost" onClick={() => setCustom([...custom, { title: '', text: '' }])}>إضافة بند</Btn>
        </div>

        <Field label="ملاحظة على النسخة (اختياري)"><input className={inputCls} maxLength={120} value={note} onChange={(ev) => setNote(ev.target.value)} /></Field>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="نوع العقد للمعاينة" className={inputCls + ' !w-auto'} value={kind} onChange={(ev) => setKind(ev.target.value)}>
            {data.kinds.map((k) => <option key={k} value={k}>{KIND_LABELS[k] || k}</option>)}
          </select>
          <Btn kind="ghost" disabled={busy} onClick={() => run({ action: 'preview', kind, ...draft() }, (r) => setPreview(r.text))}>معاينة</Btn>
          <Btn disabled={busy} onClick={() => run({ action: 'save', note, ...draft() }, (r) => { setMsg(`✅ اتنشرت نسخة ${r.revision}. العقود الجديدة هتستخدمها.`); setNote(''); setPreview(''); load(); })}>نشر</Btn>
          <Btn kind="ghost" disabled={busy} onClick={() => { setClauses({}); setCustom([]); setMsg('اتشال كل التعديل من الشاشة. اضغط نشر لتطبيقه.'); }}>رجوع للنص الأصلي</Btn>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        {preview && <pre dir="ltr" className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted p-3 text-xs">{preview}</pre>}

        {data.history.length > 0 && (
          <div>
            <div className="mb-1 text-sm font-bold">السجل</div>
            {data.history.map((h) => (
              <div key={h.revision} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-1.5 text-xs">
                <span>r{h.revision} · {h.savedAt.slice(0, 16).replace('T', ' ')} · {h.edits} تعديل {h.note && `· ${h.note}`}</span>
                {h.revision !== data.revision && <Btn small kind="ghost" disabled={busy} onClick={() => run({ action: 'rollback', revision: h.revision }, (r) => { setMsg(`✅ اتنشرت نسخة ${r.revision} (رجوع لـ r${h.revision}).`); load(); })}>رجوع لدي</Btn>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
