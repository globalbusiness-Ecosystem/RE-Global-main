'use client';

import { useCallback, useEffect, useState } from 'react';
import { COMMISSION_STATUSES, type CommissionStatus, type PartnerRole } from '@/lib/partners';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, Stat, fmtDate } from './admin-ui';
import { ROLE_AR, COMMISSION_STATUS_AR } from './partner-labels';

type Row = { id: string; partner: string; role: PartnerRole; contractId: string; base: number; currency: string; rate: number; amount: number; status: CommissionStatus; createdAt: string | null; paidAt: string | null; note: string };
type Total = { currency: string; accrued: number; paid: number };
const money = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

// Every commission line of every partner. The platform does not move money: pay outside, then mark the line paid here.
export default function PartnerCommissionsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [filter, setFilter] = useState<CommissionStatus>('accrued');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [totals, setTotals] = useState<Total[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');

  const fail = useCallback((e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message); }, [onUnauthorized]);
  const load = useCallback(() => {
    adminApi<{ rows: Row[]; totals: Total[] }>(`/api/admin/partner-commissions?status=${filter}`).then((d) => { setRows(d.rows); setTotals(d.totals); setError(''); }).catch(fail);
  }, [filter, fail]);
  useEffect(() => { setRows(null); load(); }, [load]);

  const act = async (r: Row, action: 'paid' | 'void') => {
    const note = (window.prompt(action === 'paid' ? 'ملاحظة الدفع (رقم التحويل مثلاً - اختياري):' : 'سبب الإلغاء:') ?? '').trim();
    if (action === 'void' && !note) return;
    if (!window.confirm(action === 'paid' ? `تأكيد إنك دفعت ${money(r.amount)} ${r.currency} لـ @${r.partner}؟` : `إلغاء عمولة ${money(r.amount)} ${r.currency}؟ مش هتتحسب للشريك.`)) return;
    setBusy(r.id);
    try {
      const res = await adminApi<{ mailed?: boolean }>('/api/admin/partner-commissions', { method: 'PUT', body: JSON.stringify({ id: r.id, action, note }) });
      setNotice(action === 'paid' ? (res?.mailed ? '✉️ اتبعت إيميل للشريك إن العمولة اتدفعت.' : 'اتسجّلت مدفوعة. مفيش إيميل اتبعت للشريك.') : '');
      load();
    }
    catch (e) { fail(e); } finally { setBusy(''); }
  };

  return (
    <Card title="💰 عمولات الشركاء">
      {totals.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {totals.map((t) => (
            <div key={t.currency} className="contents">
              <Stat label={`مستحقة (${t.currency})`} value={money(t.accrued)} />
              <Stat label={`مدفوعة (${t.currency})`} value={money(t.paid)} />
            </div>
          ))}
        </div>
      )}
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الحالة">
        {COMMISSION_STATUSES.map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${filter === s ? 'border-[#d4af37] bg-[#d4af37] text-black' : 'border-[#3a3a3a] text-gray-300'}`}>
            {COMMISSION_STATUS_AR[s].label}
          </button>
        ))}
      </div>
      {notice ? <p className="mb-2 text-xs text-gray-300" role="status">{notice}</p> : null}
      {error ? <Empty>❌ {error}</Empty> : !rows ? null : rows.length === 0 ? <Empty>مفيش عمولات في الحالة دي.</Empty> : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-[#2a2a2a] bg-[#101010] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white" dir="ltr">@{r.partner}</span>
                <Badge tone="blue">{ROLE_AR[r.role] ?? r.role}</Badge>
                <Badge tone={COMMISSION_STATUS_AR[r.status].tone}>{COMMISSION_STATUS_AR[r.status].label}</Badge>
                <span className="ms-auto font-bold text-[#d4af37]">{money(r.amount)} {r.currency}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400"><span dir="ltr">{r.contractId}</span> · {money(r.base)} {r.currency} × {r.rate}% · {fmtDate(r.createdAt)}{r.paidAt ? ` · دُفعت ${fmtDate(r.paidAt)}` : ''}</p>
              {r.note && <p className="mt-1 text-xs text-gray-300">📝 {r.note}</p>}
              {r.status === 'accrued' && (
                <div className="mt-2 flex gap-1.5">
                  <Btn small disabled={busy === r.id} onClick={() => act(r, 'paid')}>تم الدفع</Btn>
                  <Btn small kind="danger" disabled={busy === r.id} onClick={() => act(r, 'void')}>إلغاء</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
