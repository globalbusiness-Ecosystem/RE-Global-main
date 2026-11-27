'use client';

import { useCallback, useEffect, useState } from 'react';
import { downloadCsv } from '@/lib/csv-download';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Field, inputCls, fmtDate } from './admin-ui';

type Row = { uid: string; username: string; shareDays: number; sharesAtEnd: number; amount: number };
type Run = { gross: number; feePct: number; fee: number; net: number; allocated: number; unallocated: number; days: number; totalShares: number; rows: Row[] };
type Saved = { id: string; propertyTitle: string; start: string; end: string; net: number; allocated: number; unallocated: number; status: string; note: string; holders: number; paidRows: number | null; heldRows: number | null; createdAt: string | null };
type Prop = { id: string; title: string; totalShares?: number };

const STATUS: Record<string, string> = { draft: 'مسودة', cancelled: 'ملغي', approving: 'جاري الاعتماد', approved: 'معتمد' };

// Works out how a property's income is shared between its Share holders, day by day, saves a draft, and (only when the owner has
// switched DISTRIBUTIONS_ENABLED on) approves it: one pending payout per verified holder, paid by hand like the other payouts.
export default function DistributionsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [props, setProps] = useState<Prop[]>([]);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [gross, setGross] = useState('');
  const [feePct, setFeePct] = useState('0');
  const [note, setNote] = useState('');
  const [view, setView] = useState<{ title: string; start: string; end: string; run: Run } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = useCallback((e: any) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message); }, [onUnauthorized]);
  const load = useCallback(() => {
    adminApi<{ runs: Saved[]; unlocked: boolean }>('/api/admin/distributions').then((d) => { setSaved(d.runs); setUnlocked(d.unlocked === true); }).catch(fail);
  }, [fail]);
  useEffect(() => {
    adminApi<{ properties: Prop[] }>('/api/admin/properties').then((d) => setProps(d.properties.filter((p) => Number(p.totalShares) > 0))).catch(fail);
    load();
  }, [fail, load]);

  const body = (action: string) => JSON.stringify({ action, propertyId, start, end, gross, feePct, note });
  const post = async (action: string, ok: (r: any) => void) => {
    setBusy(true); setMsg('');
    try { ok(await adminApi('/api/admin/distributions', { method: 'POST', body: body(action) })); } catch (e: any) { fail(e); }
    setBusy(false);
  };
  const exportCsv = (title: string, s: string, e: string, run: Run) => downloadCsv(`distribution-${s}_${e}.csv`,
    ['property', 'period', 'username', 'uid', 'shares_at_end', 'share_days', 'amount_pi'],
    run.rows.map((r) => [title, `${s} to ${e}`, r.username, r.uid, r.sharesAtEnd, r.shareDays, r.amount]));
  const openSaved = (id: string) => adminApi<{ run: any }>('/api/admin/distributions?id=' + id).then((d) => setView({ title: d.run.propertyTitle, start: d.run.start, end: d.run.end, run: d.run })).catch(fail);
  const cancel = async (id: string) => {
    if (!window.confirm('إلغاء المسودة دي؟')) return;
    setBusy(true);
    try { await adminApi('/api/admin/distributions', { method: 'POST', body: JSON.stringify({ action: 'cancel', id }) }); load(); } catch (e: any) { fail(e); }
    setBusy(false);
  };

  const approve = async (s: Saved) => {
    const typed = window.prompt(`ده هيعمل مستحقات فعلية لأصحاب الحصص اللي هويتهم متحقق منها. اكتب الصافي (${s.net}) للتأكيد:`);
    if (typed === null) return;
    setBusy(true); setMsg('');
    try {
      const r = await adminApi<{ paid: number; paidAmount: number; held: number; heldAmount: number }>('/api/admin/distributions', { method: 'POST', body: JSON.stringify({ action: 'approve', id: s.id, confirm: typed }) });
      setMsg(`✅ اتعمل ${r.paid} مستحق (${r.paidAmount} Pi) في تبويب التحويلات. محجوز لحد التحقق من الهوية: ${r.held} (${r.heldAmount} Pi).`);
      load();
    } catch (e: any) { fail(e); }
    setBusy(false);
  };

  return (
    <Card title="📊 توزيع عوائد الحصص">
      <p className="mb-3 text-xs text-muted-foreground">
        بيحسب نصيب كل مالك حصص من الدخل الصافي للعقار، يوم بيوم: الحصة بتتحسب لمن يملكها في آخر اليوم، فلو اتباعت في نص الفترة البايع ياخد لحد اليوم اللي قبل البيع والمشتري من يوم البيع. نصيب الحصص اللي لسه ما اتباعتش بيفضل "غير موزّع". الكسور بتتقطع لأقرب 4 أرقام لتحت، فالمجموع ما يزيدش عن الصافي أبدًا. المسودة ما بتحرّك فلوس ولا بتعمل مستحقات؛ تقدر تصدّرها CSV. الاعتماد (بعد المسودة) هو اللي بيعمل المستحقات، وهو مقفول لحد ما المالك يفعّل DISTRIBUTIONS_ENABLED في Vercel. {unlocked ? '🔓 الاعتماد مفعّل.' : '🔒 الاعتماد مقفول حاليًا.'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="العقار">
          <select aria-label="العقار" className={inputCls} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            <option value="">اختر عقار</option>
            {props.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.totalShares} حصة)</option>)}
          </select>
        </Field>
        <Field label="إجمالي الدخل للفترة (Pi)"><input aria-label="إجمالي الدخل" dir="ltr" inputMode="decimal" className={inputCls} value={gross} onChange={(e) => setGross(e.target.value)} /></Field>
        <Field label="من يوم"><input aria-label="من يوم" type="date" dir="ltr" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label="إلى يوم (محسوب)"><input aria-label="إلى يوم" type="date" dir="ltr" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
        <Field label="رسوم المنصة %"><input aria-label="رسوم المنصة" dir="ltr" inputMode="decimal" className={inputCls} value={feePct} onChange={(e) => setFeePct(e.target.value)} /></Field>
        <Field label="ملاحظة (اختياري)"><input aria-label="ملاحظة" maxLength={200} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn kind="ghost" disabled={busy || !propertyId || !start || !end || !gross} onClick={() => post('preview', (r) => setView({ title: r.propertyTitle, start: r.start, end: r.end, run: r.run }))}>معاينة الحساب</Btn>
        <Btn disabled={busy || !propertyId || !start || !end || !gross} onClick={() => post('save', () => { setMsg('✅ اتحفظت مسودة.'); load(); })}>حفظ كمسودة</Btn>
      </div>
      {msg && <p className="mt-2 text-sm">{msg}</p>}

      {view && (
        <div className="mt-4 rounded-xl border border-border p-3 text-sm">
          <div className="mb-2 font-bold">{view.title} · {view.start} → {view.end} ({view.run.days} يوم، {view.run.totalShares} حصة)</div>
          <div className="mb-2 grid grid-cols-2 gap-1 text-xs sm:grid-cols-5">
            <span>الإجمالي: {view.run.gross}</span><span>الرسوم: {view.run.fee}</span><span>الصافي: {view.run.net}</span>
            <span>موزّع: {view.run.allocated}</span><span>غير موزّع: {view.run.unallocated}</span>
          </div>
          {view.run.rows.length === 0 ? <p className="text-xs text-muted-foreground">مفيش مالك حصص في الفترة دي.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs" dir="ltr">
                <thead><tr className="text-left text-muted-foreground"><th className="p-1">user</th><th className="p-1">shares (end)</th><th className="p-1">share-days</th><th className="p-1">amount (Pi)</th></tr></thead>
                <tbody>{view.run.rows.map((r) => <tr key={r.uid} className="border-t border-border"><td className="p-1">{r.username || r.uid}</td><td className="p-1">{r.sharesAtEnd}</td><td className="p-1">{r.shareDays}</td><td className="p-1">{r.amount}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          <div className="mt-2 flex gap-2"><Btn small kind="ghost" onClick={() => exportCsv(view.title, view.start, view.end, view.run)}>تصدير CSV</Btn><Btn small kind="ghost" onClick={() => setView(null)}>إغلاق</Btn></div>
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 text-sm font-bold">المسودات المحفوظة</div>
          {saved.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-1.5 text-xs">
              <span>{s.propertyTitle} · {s.start} → {s.end} · صافي {s.net} · {s.holders} مالك{s.paidRows !== null ? ` (مستحقات ${s.paidRows}، محجوز ${s.heldRows ?? 0})` : ''} · {fmtDate(s.createdAt)} {s.note && `· ${s.note}`}</span>
              <span className="flex items-center gap-1">
                <Badge tone={s.status === 'draft' || s.status === 'approved' ? 'gold' : 'gray'}>{STATUS[s.status] || s.status}</Badge>
                <Btn small kind="ghost" onClick={() => openSaved(s.id)}>فتح</Btn>
                {s.status === 'draft' && <Btn small kind="danger" disabled={busy} onClick={() => cancel(s.id)}>إلغاء</Btn>}
                {(s.status === 'draft' || s.status === 'approving') && <Btn small disabled={busy || !unlocked} onClick={() => approve(s)}>{unlocked ? 'اعتماد وإنشاء المستحقات' : '🔒 الاعتماد مقفول'}</Btn>}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
