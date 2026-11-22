'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, Field, inputCls, fmtDate } from './admin-ui';
import { NOTIFY_HOURS, REQUEST_DAYS, INCIDENT_STATUS, REQUEST_STATUS, SEVERITIES, REQUEST_KINDS, type ClockState } from '@/lib/compliance';

type Note = { at: number; by: string; text: string };
type Clock = { state: ClockState; hoursLeft: number };
type Inc = { id: string; title: string; description: string; severity: string; personalData: boolean; status: string; discoveredAtMs: number; deadlineMs: number | null; clock: Clock; notes: Note[] };
type Rq = { id: string; kind: string; requester: string; note: string; status: string; receivedAtMs: number; deadlineMs: number; clock: Clock; notes: Note[] };

const SEV: Record<string, string> = { low: 'منخفضة', medium: 'متوسطة', high: 'عالية' };
const INC_ST: Record<string, string> = { open: 'مفتوحة', contained: 'اتحاصرت', notified: 'اتبلّغت الجهات', closed: 'اتقفلت' };
const KIND: Record<string, string> = { access: 'طلب نسخة من البيانات', erase: 'طلب مسح', correct: 'طلب تصحيح', object: 'اعتراض على المعالجة' };
const RQ_ST: Record<string, string> = { open: 'مفتوح', done: 'اتنفّذ', refused: 'اترفض (بسبب مكتوب)' };

function ClockBadge({ c }: { c: Clock }) {
  if (c.state === 'none') return <Badge tone="gray">من غير عدّاد</Badge>;
  if (c.state === 'stopped') return <Badge tone="green">العدّاد وقف</Badge>;
  if (c.state === 'late') return <Badge tone="red">⏰ عدّى الموعد</Badge>;
  const d = Math.floor(c.hoursLeft / 24);
  return <Badge tone={c.state === 'soon' ? 'gold' : 'blue'}>{c.hoursLeft >= 48 ? `باقي ${d} يوم` : `باقي ${Math.max(0, c.hoursLeft)} ساعة`}</Badge>;
}

// Incidents (a leak, a lost device, an attack) and privacy requests (copy, erase, fix, object). Nothing here can be deleted: entries move forward and gather dated notes.
export default function CompliancePanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<{ incidents: Inc[]; requests: Rq[] } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [it, setIt] = useState({ title: '', description: '', severity: 'medium', personalData: true });
  const [rq, setRq] = useState({ kind: 'access', requester: '', note: '' });

  const load = useCallback(() => {
    adminApi<{ incidents: Inc[]; requests: Rq[] }>('/api/admin/compliance-register')
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const send = async (method: 'POST' | 'PATCH', body: Record<string, unknown>) => {
    setBusy(true); setError('');
    try { await adminApi('/api/admin/compliance-register', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); load(); return true; }
    catch (e) { if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message); return false; }
    finally { setBusy(false); }
  };
  const addNote = (type: 'incident' | 'request', id: string) => {
    const note = (window.prompt('ملاحظة (بتتسجل بالتاريخ واسمك):') ?? '').trim();
    if (note) void send('PATCH', { type, id, note });
  };

  if (error && !data) return <Empty>❌ {error}</Empty>;
  if (!data) return null;
  const noteList = (notes: Note[]) => notes.length ? (
    <ul className="mt-2 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
      {notes.map((n, i) => <li key={i} dir="auto">{fmtDate(new Date(n.at).toISOString())} · {n.by}: {n.text}</li>)}
    </ul>
  ) : null;

  return (
    <div className="space-y-4">
      {error ? <p className="text-xs text-red-400" role="alert">❌ {error}</p> : null}
      <p className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        سجل للحوادث الأمنية وطلبات الخصوصية. المهل المحسوبة هنا ({NOTIFY_HOURS} ساعة لإخطار حادثة فيها بيانات شخصية، و{REQUEST_DAYS} يوم للرد على طلب) هي المعيار الشائع عالميًا. المهل في القانون المصري لازم تتأكد منها مع محاميك. البنود مبتتمسحش: بتتقفل وتتسجّل عليها ملاحظات بالتاريخ.
      </p>

      <Card title={`🚨 الحوادث الأمنية (${data.incidents.filter((i) => i.status === 'open' || i.status === 'contained').length} مفتوحة)`}>
        {data.incidents.length === 0 ? <p className="text-sm text-muted-foreground">مفيش حوادث مسجّلة.</p> : (
          <div className="space-y-2">
            {data.incidents.map((i) => (
              <div key={i.id} className="rounded-xl border border-border bg-card p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground" dir="auto">{i.title}</span>
                  <Badge tone={i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'gold' : 'gray'}>{SEV[i.severity] ?? i.severity}</Badge>
                  <Badge tone="blue">{INC_ST[i.status] ?? i.status}</Badge>
                  {i.personalData ? <Badge tone="gold">فيها بيانات شخصية</Badge> : null}
                  <ClockBadge c={i.clock} />
                </div>
                {i.description ? <p className="mt-1 text-xs text-foreground/80" dir="auto">{i.description}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">اتكشفت: {fmtDate(new Date(i.discoveredAtMs).toISOString())}{i.deadlineMs ? ` · موعد الإخطار: ${fmtDate(new Date(i.deadlineMs).toISOString())}` : ''}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select value={i.status} disabled={busy} onChange={(e) => send('PATCH', { type: 'incident', id: i.id, status: e.target.value })} className={`${inputCls} !w-auto !py-1.5 text-xs`} aria-label="الحالة">
                    {INCIDENT_STATUS.map((s) => <option key={s} value={s}>{INC_ST[s]}</option>)}
                  </select>
                  <Btn small kind="ghost" onClick={() => addNote('incident', i.id)} disabled={busy}>📝 ملاحظة</Btn>
                </div>
                {noteList(i.notes)}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="➕ تسجيل حادثة">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="عنوان الحادثة"><input className={inputCls} value={it.title} maxLength={120} onChange={(e) => setIt({ ...it, title: e.target.value })} /></Field>
          <Field label="الخطورة"><select className={inputCls} value={it.severity} onChange={(e) => setIt({ ...it, severity: e.target.value })}>{SEVERITIES.map((s) => <option key={s} value={s}>{SEV[s]}</option>)}</select></Field>
        </div>
        <Field label="إيه اللي حصل (من غير بيانات حساسة)"><textarea className={inputCls} rows={3} value={it.description} maxLength={2000} onChange={(e) => setIt({ ...it, description: e.target.value })} /></Field>
        <label className="mt-2 flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={it.personalData} onChange={(e) => setIt({ ...it, personalData: e.target.checked })} /> الحادثة ممكن تكون مست بيانات شخصية لمستخدمين (بيشغّل عدّاد الإخطار)</label>
        <div className="mt-3"><Btn disabled={busy || !it.title.trim()} onClick={async () => { if (await send('POST', { type: 'incident', ...it })) setIt({ title: '', description: '', severity: 'medium', personalData: true }); }}>تسجيل (العدّاد يبدأ من دلوقتي)</Btn></div>
      </Card>

      <Card title={`📨 طلبات الخصوصية (${data.requests.filter((r) => r.status === 'open').length} مفتوحة)`}>
        {data.requests.length === 0 ? <p className="text-sm text-muted-foreground">مفيش طلبات مسجّلة. (المسح والتصدير من داخل التطبيق بيتنفذوا تلقائي، ده للطلبات اللي بتجيلك بالإيميل أو برّه التطبيق.)</p> : (
          <div className="space-y-2">
            {data.requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{KIND[r.kind] ?? r.kind}</span>
                  <span className="text-xs text-foreground/80" dir="auto">{r.requester}</span>
                  <Badge tone="blue">{RQ_ST[r.status] ?? r.status}</Badge>
                  <ClockBadge c={r.clock} />
                </div>
                {r.note ? <p className="mt-1 text-xs text-foreground/80" dir="auto">{r.note}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">وصل: {fmtDate(new Date(r.receivedAtMs).toISOString())} · آخر موعد للرد: {fmtDate(new Date(r.deadlineMs).toISOString())}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select value={r.status} disabled={busy} onChange={(e) => send('PATCH', { type: 'request', id: r.id, status: e.target.value })} className={`${inputCls} !w-auto !py-1.5 text-xs`} aria-label="الحالة">
                    {REQUEST_STATUS.map((s) => <option key={s} value={s}>{RQ_ST[s]}</option>)}
                  </select>
                  <Btn small kind="ghost" onClick={() => addNote('request', r.id)} disabled={busy}>📝 ملاحظة</Btn>
                </div>
                {noteList(r.notes)}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="➕ تسجيل طلب خصوصية">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="نوع الطلب"><select className={inputCls} value={rq.kind} onChange={(e) => setRq({ ...rq, kind: e.target.value })}>{REQUEST_KINDS.map((k) => <option key={k} value={k}>{KIND[k]}</option>)}</select></Field>
          <Field label="صاحب الطلب (اسم أو إيميل)"><input className={inputCls} value={rq.requester} maxLength={120} onChange={(e) => setRq({ ...rq, requester: e.target.value })} /></Field>
        </div>
        <Field label="ملاحظة"><textarea className={inputCls} rows={2} value={rq.note} maxLength={2000} onChange={(e) => setRq({ ...rq, note: e.target.value })} /></Field>
        <div className="mt-3"><Btn disabled={busy || !rq.requester.trim()} onClick={async () => { if (await send('POST', { type: 'request', ...rq })) setRq({ kind: 'access', requester: '', note: '' }); }}>تسجيل (مهلة {REQUEST_DAYS} يوم)</Btn></div>
      </Card>
    </div>
  );
}
