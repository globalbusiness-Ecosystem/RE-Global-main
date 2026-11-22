'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, fmtDate } from './admin-ui';

type Req = { uid: string; status: string; legalName: string; country: string; phone: string; submittedAt: string | null; decidedAt: string | null; rejectReason: string; docType?: string; idNumber?: string; dupOf?: string | null; hold?: boolean; consentAt?: string | null; screenHits?: string[]; reviewReasons?: string[]; files?: string[]; proposal?: { decision: 'approved' | 'rejected'; reason: string; byName: string; by: string; at: string | null } | null };

const STATUS: Record<string, { label: string; tone: 'green' | 'gold' | 'red' | 'blue' }> = {
  pending: { label: 'في الانتظار', tone: 'gold' },
  approved: { label: 'موافق عليه', tone: 'green' },
  rejected: { label: 'مرفوض', tone: 'red' },
};

// Identity verification requests (Pi and web accounts). Pending ones come first.
export default function KycPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Req[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [requireAll, setRequireAll] = useState<boolean | null>(null);
  const [ret, setRet] = useState<{ years: number; autoDelete: boolean; due: number } | null>(null);
  const [fourEyes, setFourEyes] = useState<boolean | null>(null);
  useEffect(() => { adminApi<{ enabled: boolean }>('/api/admin/kyc-four-eyes').then((d) => setFourEyes(d.enabled)).catch(() => {}); }, []);
  const toggleFourEyes = async (enabled: boolean) => {
    try { const d = await adminApi<{ enabled: boolean }>('/api/admin/kyc-four-eyes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) }); setFourEyes(d.enabled); }
    catch (e) { if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message); }
  };

  const load = useCallback(() => {
    adminApi<{ requests: Req[] }>('/api/admin/kyc')
      .then((d) => setRows(d.requests))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    adminApi<{ policy: { requireAll: boolean } }>('/api/admin/kyc-policy').then((d) => setRequireAll(!!d.policy?.requireAll)).catch(() => {});
  }, []);

  const loadRet = useCallback(() => {
    adminApi<{ policy: { years: number; autoDelete: boolean }; due: number }>('/api/admin/kyc-retention').then((d) => setRet({ ...d.policy, due: d.due })).catch(() => {});
  }, []);
  useEffect(() => { loadRet(); }, [loadRet]);

  const saveRet = async (next: { years: number; autoDelete: boolean }) => {
    try {
      const d = await adminApi<{ policy: { years: number; autoDelete: boolean }; due: number }>('/api/admin/kyc-retention', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
      setRet({ ...d.policy, due: d.due });
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    }
  };
  const retPost = async (body: Record<string, unknown>, okMsg: string) => {
    try {
      await adminApi('/api/admin/kyc-retention', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setNotice(okMsg); loadRet(); load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setNotice(`تعذّر التنفيذ: ${(e as Error).message}`);
    }
  };
  const runNow = () => {
    if (!ret || !window.confirm(`حذف نهائي لبيانات ${ret.due} شخص عدّت عليهم مدة الاحتفاظ (${ret.years} سنين)؟ مفيش رجوع. اللي عليهم تجميد قانوني مش هيتحذفوا.`)) return;
    retPost({ action: 'run', confirm: true }, 'اتنفّذ حذف البيانات المنتهية مدتها.');
  };
  const purgeOne = (uid: string) => {
    if (!window.confirm('حذف نهائي لبيانات الهوية والصور بتاعة الشخص ده؟ مفيش رجوع (هيحتاج يوثّق من جديد).')) return;
    retPost({ action: 'purge', uid, confirm: true }, 'اتحذفت بيانات الشخص.');
  };
  const toggleHold = (uid: string, hold: boolean) => retPost({ action: 'hold', uid, hold }, hold ? 'اتفعّل التجميد القانوني: البيانات مش هتتحذف.' : 'اتشال التجميد القانوني.');

  const toggleAll = async () => {
    if (requireAll === null) return;
    const next = !requireAll;
    if (!window.confirm(next ? 'تفعيل إلزام التوثيق لكل المستخدمين (Pi كمان): أي حد مش موثّق مش هيقدر يدفع. متأكد؟' : 'إيقاف الإلزام لمستخدمي Pi؟ (حسابات الويب هتفضل ملزمة)')) return;
    try {
      await adminApi('/api/admin/kyc-policy', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requireAll: next }) });
      setRequireAll(next);
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    }
  };

  const decide = async (uid: string, decision: 'approved' | 'rejected') => {
    let reason = '';
    if (decision === 'rejected') {
      reason = (window.prompt('سبب الرفض (هيظهر للمستخدم):') ?? '').trim();
      if (!reason) return;
    } else if (!window.confirm('وافق بس بعد ما تراجع الاسم والدولة وتفحص قوائم العقوبات (AML). متأكد؟')) return;
    setBusy(uid);
    try {
      const res = await adminApi<{ mailed?: boolean; proposed?: boolean }>('/api/admin/kyc', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, decision, reason }) });
      if (res?.proposed) { setNotice('🟡 اتسجّلت توصيتك. القرار النهائي لازم يعتمده شخص تاني.'); load(); return; }
      setNotice(res?.mailed ? '✉️ اتبعت إيميل بالقرار للمستخدم.' : 'القرار اتسجّل. مفيش إيميل اتبعت (إيميل المستخدم مش متأكد أو الإيميل مش متضبط).');
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return null;
  if (rows.length === 0) return <Empty>مفيش طلبات تحقق لسه.</Empty>;
  // The one waiting longest goes first.
  const pending = rows.filter((r) => r.status === 'pending').sort((a, b) => String(a.submittedAt).localeCompare(String(b.submittedAt)));
  const sorted = [...pending, ...rows.filter((r) => r.status !== 'pending')];
  return (
    <Card title={`🪪 التحقق من الهوية (${pending.length} في الانتظار)`}>
      {notice ? <p className="mb-2 text-xs text-foreground/80" role="status">{notice}</p> : null}
      {fourEyes !== null ? (
        <label className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
          <input type="checkbox" checked={fourEyes} onChange={(e) => toggleFourEyes(e.target.checked)} />
          "٤ عيون": قرار الهوية بيحتاج توصية من شخص واعتماد من شخص تاني (المالك يقرر مباشرة دايمًا، والمراجع يوصي بس).
        </label>
      ) : null}
      <label className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
        <input type="checkbox" checked={requireAll === true} disabled={requireAll === null} onChange={toggleAll} />
        إلزام توثيق الهوية لكل المستخدمين قبل الدفع (Pi كمان). حسابات الويب ملزمة دايمًا.
      </label>
      {ret ? (
        <div className="mb-3 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
          <p className="mb-2 font-semibold text-foreground">🗄️ الاحتفاظ ببيانات الهوية</p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">مدة الاحتفاظ (سنين)
              <input type="number" min={1} max={30} value={ret.years} onChange={(e) => setRet({ ...ret, years: Number(e.target.value) })} onBlur={() => saveRet({ years: ret.years, autoDelete: ret.autoDelete })} className="w-16 rounded-lg border border-border bg-input px-2 py-1 text-foreground" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ret.autoDelete} onChange={() => saveRet({ years: ret.years, autoDelete: !ret.autoDelete })} />
              حذف تلقائي يومي
            </label>
            <span className="text-xs text-muted-foreground">منتهية المدة دلوقتي: {ret.due}</span>
            <Btn small onClick={runNow} disabled={ret.due === 0}>🗑 حذف المنتهي الآن</Btn>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">المدة بتتحسب من تاريخ القرار. الحذف التلقائي مقفول افتراضيًا. اللي عليه تجميد قانوني عمره ما بيتحذف.</p>
        </div>
      ) : null}
      <div className="space-y-2">
        {sorted.slice(0, 100).map((r) => {
          const st = STATUS[r.status] ?? { label: r.status, tone: 'gold' as const };
          return (
            <div key={r.uid} className="rounded-xl border border-border bg-card p-3">
              <p className="font-semibold text-foreground" dir="auto">{r.legalName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge tone={st.tone}>{st.label}</Badge>
                <span dir="ltr">{r.country}</span>
                <span dir="ltr">{r.phone}</span>
                {r.idNumber ? <span dir="ltr">🪪 {r.idNumber}</span> : null}
                {r.screenHits?.length ? <span className="text-red-500">⚠ watchlist: {r.screenHits.join(', ')}</span> : null}
                {r.reviewReasons?.length ? <span className="text-amber-500" dir="ltr">⚑ review: {r.reviewReasons.join(', ')}</span> : null}
                {r.dupOf ? <span className="text-amber-500" dir="ltr">⚠ same ID as {r.dupOf}</span> : null}
                {r.hold ? <span className="text-sky-400">🔒 تجميد قانوني</span> : null}
                {r.consentAt ? <span className="text-muted-foreground">✔ موافقة {fmtDate(r.consentAt)}</span> : null}
                <span>{fmtDate(r.submittedAt)}</span>
                <span className="truncate" dir="ltr">{r.uid}</span>
              </div>
              {r.files && r.files.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="w-full text-xs text-muted-foreground">{r.docType === 'passport' ? 'جواز سفر' : 'بطاقة هوية'}: افتح كل صورة وقارنها بالاسم وبالسيلفي</span>
                  {r.files.map((k) => (
                    <a key={k} href={`/api/admin/kyc/file?uid=${encodeURIComponent(r.uid)}&kind=${k}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border p-1 text-center text-xs text-foreground/80">
                      <img src={`/api/admin/kyc/file?uid=${encodeURIComponent(r.uid)}&kind=${k}`} alt={k} className="h-24 w-32 rounded object-cover" loading="lazy" />
                      {k === 'front' ? 'الوش' : k === 'back' ? 'الضهر' : 'سيلفي'}
                    </a>
                  ))}
                </div>
              ) : null}
              {r.rejectReason ? <p className="mt-1 text-xs text-muted-foreground" dir="auto">❌ {r.rejectReason}</p> : null}
              {r.status === 'pending' && r.proposal ? <p className="mt-1 text-xs text-accent" dir="auto">🟡 توصية من {r.proposal.byName}: {r.proposal.decision === 'approved' ? 'قبول' : 'رفض'}{r.proposal.reason ? ` (${r.proposal.reason})` : ''}. في انتظار اعتماد شخص تاني.</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <Btn small onClick={() => toggleHold(r.uid, !r.hold)}>{r.hold ? '🔓 شيل التجميد' : '🔒 تجميد قانوني'}</Btn>
                {!r.hold && <Btn small onClick={() => purgeOne(r.uid)}>🗑 حذف بياناته</Btn>}
              </div>
              {(r.status === 'pending' || r.status === 'approved') && (
                <div className="mt-2 flex gap-2">
                  {r.status === 'pending' && <Btn small onClick={() => decide(r.uid, 'approved')} disabled={busy === r.uid}>✅ موافقة</Btn>}
                  <Btn small onClick={() => decide(r.uid, 'rejected')} disabled={busy === r.uid}>{r.status === 'approved' ? '⛔ سحب الموافقة' : '❌ رفض'}</Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
