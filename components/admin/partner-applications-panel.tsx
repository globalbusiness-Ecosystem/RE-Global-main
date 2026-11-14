'use client';

import { useCallback, useEffect, useState } from 'react';
import { PARTNER_STATUSES, type PartnerRole, type PartnerStatus } from '@/lib/partners';
import { COUNTRIES } from '@/lib/legal-profiles';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, fmtDate } from './admin-ui';
import { ROLE_AR, PARTNER_STATUS_AR } from './partner-labels';

type Row = { username: string; role: PartnerRole; company: string; country: string; phone: string; about: string; website: string; listed: boolean; status: PartnerStatus; note: string; createdAt: string | null; approvedAt: string | null };
type Action = 'approve' | 'reject' | 'suspend' | 'reinstate';

// Which steps the server allows from each status (the server checks again).
const STEPS: Record<PartnerStatus, { action: Action; label: string; kind: 'gold' | 'ghost' | 'danger'; note: 'required' | 'optional' | 'none' }[]> = {
  pending: [{ action: 'approve', label: '✅ اعتماد', kind: 'gold', note: 'optional' }, { action: 'reject', label: 'رفض', kind: 'danger', note: 'required' }],
  rejected: [{ action: 'approve', label: '✅ اعتماد', kind: 'gold', note: 'optional' }],
  approved: [{ action: 'suspend', label: 'إيقاف', kind: 'danger', note: 'optional' }],
  suspended: [{ action: 'reinstate', label: 'إعادة تفعيل', kind: 'gold', note: 'none' }],
};

export default function PartnerApplicationsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [filter, setFilter] = useState<PartnerStatus>('pending');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');

  const fail = useCallback((e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message); }, [onUnauthorized]);
  const load = useCallback(() => {
    adminApi<{ partners: Row[]; counts: Record<string, number> }>(`/api/admin/partners?status=${filter}`).then((d) => { setRows(d.partners); setCounts(d.counts); setError(''); }).catch(fail);
  }, [filter, fail]);
  useEffect(() => { setRows(null); load(); }, [load]);

  const act = async (p: Row, s: (typeof STEPS)[PartnerStatus][number]) => {
    let note = '';
    if (s.note !== 'none') {
      note = (window.prompt(s.note === 'required' ? 'سبب الرفض (هيظهر للمتقدم):' : 'ملاحظة للمتقدم (اختياري):') ?? '').trim();
      if (s.note === 'required' && !note) return;
    }
    if (s.action === 'approve' && !window.confirm(`اعتماد ${p.company} كـ ${ROLE_AR[p.role]}؟ العمولة هتتحسب على مشتريات عملائه من اللحظة دي.`)) return;
    setBusy(p.username);
    try {
      const res = await adminApi<{ mailed?: boolean }>('/api/admin/partners', { method: 'PUT', body: JSON.stringify({ username: p.username, action: s.action, note }) });
      setNotice(res?.mailed ? '✉️ اتبعت إيميل بالقرار للشريك.' : 'القرار اتسجّل. مفيش إيميل اتبعت (الحساب مش بإيميل متأكد، أو الإيميل مش متضبط).');
      load();
    }
    catch (e) { fail(e); } finally { setBusy(''); }
  };

  return (
    <Card title="🤝 طلبات الشركاء">
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الحالة">
        {PARTNER_STATUSES.map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${filter === s ? 'border-[#d4af37] bg-[#d4af37] text-black' : 'border-[#3a3a3a] text-gray-300'}`}>
            {PARTNER_STATUS_AR[s].label} ({counts[s] ?? 0})
          </button>
        ))}
      </div>
      {notice ? <p className="mb-2 text-xs text-gray-300" role="status">{notice}</p> : null}
      {error ? <Empty>❌ {error}</Empty> : !rows ? null : rows.length === 0 ? <Empty>مفيش طلبات في الحالة دي.</Empty> : (
        <div className="space-y-2">
          {rows.map((p) => (
            <div key={p.username} className="rounded-xl border border-[#2a2a2a] bg-[#101010] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white" dir="auto">{p.company}</span>
                <Badge tone="blue">{ROLE_AR[p.role]}</Badge>
                <Badge tone={PARTNER_STATUS_AR[p.status].tone}>{PARTNER_STATUS_AR[p.status].label}</Badge>
                {p.listed && <Badge>ظاهر في الدليل</Badge>}
              </div>
              <p className="mt-1 text-xs text-gray-400" dir="auto">@{p.username} · {COUNTRIES[p.country]?.ar ?? p.country} · <span dir="ltr">{p.phone}</span> · {fmtDate(p.createdAt)}</p>
              <p className="mt-2 text-sm text-gray-200" dir="auto">{p.about}</p>
              {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-block text-xs text-[#d4af37]" dir="ltr">{p.website}</a>}
              {p.note && <p className="mt-2 rounded-md bg-[#1b1b1b] p-2 text-xs text-gray-300">📝 {p.note}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STEPS[p.status].map((s) => <Btn key={s.action} small kind={s.kind} disabled={busy === p.username} onClick={() => act(p, s)}>{s.label}</Btn>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
