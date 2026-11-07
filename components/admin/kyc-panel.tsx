'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, fmtDate } from './admin-ui';

type Req = { uid: string; status: string; legalName: string; country: string; phone: string; submittedAt: string | null; decidedAt: string | null; rejectReason: string };

const STATUS: Record<string, { label: string; tone: 'green' | 'gold' | 'red' | 'blue' }> = {
  pending: { label: 'في الانتظار', tone: 'gold' },
  approved: { label: 'موافق عليه', tone: 'green' },
  rejected: { label: 'مرفوض', tone: 'red' },
};

// Identity verification requests of people who signed in outside the Pi Browser. Pending ones come first.
export default function KycPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Req[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    adminApi<{ requests: Req[] }>('/api/admin/kyc')
      .then((d) => setRows(d.requests))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const decide = async (uid: string, decision: 'approved' | 'rejected') => {
    let reason = '';
    if (decision === 'rejected') {
      reason = (window.prompt('سبب الرفض (هيظهر للمستخدم):') ?? '').trim();
      if (!reason) return;
    } else if (!window.confirm('وافق بس بعد ما تراجع الاسم والدولة وتفحص قوائم العقوبات (AML). متأكد؟')) return;
    setBusy(uid);
    try {
      await adminApi('/api/admin/kyc', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, decision, reason }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return null;
  if (rows.length === 0) return <Empty>مفيش طلبات تحقق لسه.</Empty>;
  const pending = rows.filter((r) => r.status === 'pending');
  const sorted = [...pending, ...rows.filter((r) => r.status !== 'pending')];
  return (
    <Card title={`🪪 التحقق من الهوية (${pending.length} في الانتظار)`}>
      <div className="space-y-2">
        {sorted.slice(0, 100).map((r) => {
          const st = STATUS[r.status] ?? { label: r.status, tone: 'gold' as const };
          return (
            <div key={r.uid} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
              <p className="font-semibold text-white" dir="auto">{r.legalName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <Badge tone={st.tone}>{st.label}</Badge>
                <span dir="ltr">{r.country}</span>
                <span dir="ltr">{r.phone}</span>
                <span>{fmtDate(r.submittedAt)}</span>
                <span className="truncate" dir="ltr">{r.uid}</span>
              </div>
              {r.rejectReason ? <p className="mt-1 text-xs text-gray-500" dir="auto">❌ {r.rejectReason}</p> : null}
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
