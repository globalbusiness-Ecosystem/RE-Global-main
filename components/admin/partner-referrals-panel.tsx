'use client';

import { useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, inputCls, fmtDate } from './admin-ui';

type Look = {
  found: boolean; username?: string; handle?: string | null; code?: string | null; referredBy?: string | null; referredAt?: string | null; linkedByAdmin?: boolean;
  contracts?: { id: string; status: string; type: string; amount: number; currency: string; createdAt: string | null }[];
  confirmedBookings?: number;
  commissions?: { id: string; partner: string; amount: number; currency: string; status: string }[];
};

// Why was an invite or a commission not counted? Look a customer up, see who invited them, and link them to a partner by hand if needed.
export default function PartnerReferralsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [q, setQ] = useState('');
  const [partner, setPartner] = useState('');
  const [look, setLook] = useState<Look | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const fail = (e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message); };
  const search = async (query = q) => {
    if (!query.trim()) return;
    setBusy(true); setError(''); setNotice('');
    try { setLook(await adminApi<Look>(`/api/admin/partner-referrals?q=${encodeURIComponent(query.trim())}`)); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const link = async (force = false) => {
    if (!look?.username || !partner.trim()) return;
    if (!window.confirm(`ربط @${look.username} بالشريك ${partner.trim()}؟ هتتحسب له عمولة على مشترياته بعد تاريخ اعتماد الشريك.`)) return;
    setBusy(true); setError('');
    try {
      const r = await adminApi<{ partner: string; created: number }>('/api/admin/partner-referrals', { method: 'PUT', body: JSON.stringify({ customer: look.username, partner: partner.trim(), force }) });
      setNotice(`✅ اتربط بالشريك @${r.partner}. عمولات اتكتبت: ${r.created}.`);
      await search(look.username);
    } catch (e) {
      if (!force && (e as Error).message === 'Already linked' && window.confirm('العميل مربوط بشريك تاني. تغيّره؟')) await link(true);
      else fail(e);
    } finally { setBusy(false); }
  };

  return (
    <Card title="🔗 فحص دعوة / ربط عميل بشريك">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void search(); }}>
        <input className={inputCls} dir="ltr" placeholder="اسم العميل أو الـ handle أو كوده" aria-label="بحث عن عميل" value={q} onChange={(e) => setQ(e.target.value)} />
        <Btn small disabled={busy || !q.trim()} onClick={() => search()}>بحث</Btn>
      </form>
      {error ? <p className="mt-2 text-xs text-red-400" role="alert">❌ {error}</p> : null}
      {notice ? <p className="mt-2 text-xs text-gray-300" role="status">{notice}</p> : null}
      {look && !look.found ? <div className="mt-3"><Empty>مفيش عميل بالاسم ده.</Empty></div> : null}
      {look?.found && (
        <div className="mt-3 space-y-2 rounded-xl border border-[#2a2a2a] bg-[#101010] p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white" dir="ltr">@{look.username}</span>
            {look.handle ? <Badge tone="blue">{look.handle}</Badge> : null}
            {look.referredBy ? <Badge tone="green">مدعو من @{look.referredBy}{look.linkedByAdmin ? ' (يدوي)' : ''}</Badge> : <Badge tone="red">مش مربوط بأي دعوة</Badge>}
          </div>
          {look.referredAt ? <p className="text-xs text-gray-400">تاريخ الربط: {fmtDate(look.referredAt)}</p> : null}
          <p className="text-xs text-gray-300">حجوزات مؤكدة: {look.confirmedBookings ?? 0} · عقود: {look.contracts?.length ?? 0}</p>
          {(look.contracts ?? []).map((c) => (
            <p key={c.id} className="text-xs text-gray-400"><span dir="ltr">{c.id}</span> · {c.type} · {c.amount} {c.currency} · {c.status} · {fmtDate(c.createdAt)}</p>
          ))}
          <p className="text-xs text-gray-300">عمولات اتكتبت من مشترياته: {look.commissions?.length ?? 0}</p>
          {(look.commissions ?? []).map((c) => <p key={c.id} className="text-xs text-gray-400" dir="ltr">@{c.partner} · {c.amount} {c.currency} · {c.status}</p>)}
          <div className="flex gap-2 pt-1">
            <input className={inputCls} dir="ltr" placeholder="الشريك (اسمه أو كوده)" aria-label="الشريك" value={partner} onChange={(e) => setPartner(e.target.value)} />
            <Btn small disabled={busy || !partner.trim()} onClick={() => link()}>اربطه</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
