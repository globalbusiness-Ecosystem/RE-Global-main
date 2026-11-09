'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, fmtDate, GOLD } from './admin-ui';

type Order = { id: string; uid: string; propertyId: string | null; amountMinor: number; currency: string; status: string; providerId: string | null; createdAt: string | null; handedOverAt: string | null; note: string };

const STATUS: Record<string, { label: string; tone: 'green' | 'gold' | 'red' | 'blue' }> = {
  paid: { label: 'مدفوع', tone: 'green' },
  pending: { label: 'في الانتظار', tone: 'gold' },
  failed: { label: 'فشل', tone: 'red' },
  refunded: { label: 'مسترد', tone: 'blue' },
};

// What a short error code from the blockchain step means for the admin.
const ANCHOR_HELP: Record<string, string> = {
  'anchor:account': 'حساب المنصة (PI_ISSUER_PUBLIC_KEY) مش موجود على Pi Testnet: لازم يتفعّل ويتشحن بـ Test-π',
  'anchor:rejected': 'الشبكة رفضت المعاملة (رصيد Test-π ناقص أو الرسوم)',
  'anchor:network': 'مفيش رد من شبكة Pi Testnet، جرّب تاني بعد شوية',
  'anchor:bad_hash': 'بصمة العقد مش سليمة',
  'registry:network': 'مفيش رد من عقد السجل الذكي',
  'registry:rejected': 'العقد الذكي رفض التسجيل',
  'registry:timeout': 'التسجيل اتأخر، جرّب تاني',
  'registry:bad_input': 'بيانات العقد مش مناسبة للسجل',
};

// What the account check says, in plain words (the public key is shown so it can be funded).
const CHECK_HELP: Record<string, string> = {
  no_keys: 'مفتاح التوقيع السري PI_ISSUER_SECRET_KEY مش موجود في Vercel',
  bad_secret: 'المفتاح السري PI_ISSUER_SECRET_KEY شكله غلط أو فيه مسافة زيادة (لازم يبدأ بحرف S)',
  mismatch: 'المفتاح العام PI_ISSUER_PUBLIC_KEY في Vercel مش بتاع المفتاح السري. المنصة بتوقّع فعلاً بالحساب ده',
  not_found: 'الحساب ده مش موجود على Pi Testnet. لازم تحوّله Test-π عشان يتفعّل',
  network: 'مفيش رد من شبكة Pi Testnet دلوقتي، جرّب تاني',
  low_balance: 'الحساب موجود بس رصيده قليل، شحنه بـ Test-π',
  ok: 'الحساب سليم وجاهز للتثبيت',
};

// Orders paid by card. Paid ones wait for the admin to hand the property over, then get marked as handed over.
export default function CardOrdersPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    adminApi<{ orders: Order[] }>('/api/admin/card-orders')
      .then((d) => setRows(d.orders))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(); }, [load]);

  const handOver = async (id: string) => {
    if (!window.confirm('تأكد إنك سلّمت العقار للمشتري قبل ما تعلّمه تم التسليم.')) return;
    const note = window.prompt('ملاحظة (اختياري):') ?? '';
    setBusy(id);
    try {
      await adminApi('/api/admin/card-orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, note }) });
      load();
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  const check = async () => {
    setBusy('check');
    try {
      const r = await adminApi<{ code: string; publicKey?: string; balance?: number }>('/api/admin/contracts/check');
      setNotice(`${CHECK_HELP[r.code] ?? r.code}${r.publicKey ? ` | الحساب: ${r.publicKey}` : ''}${typeof r.balance === 'number' ? ` | الرصيد: ${r.balance} Test-π` : ''}`);
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  const anchor = async () => {
    setBusy('anchor');
    try {
      const r = await adminApi<{ created: number; createdFailed: number; anchored: number; recorded: number; failed: number; total: number; errors?: string[] }>('/api/admin/contracts/anchor', { method: 'POST' });
      setNotice(r.created > 0 || r.createdFailed > 0 ? `اتعمل ${r.created} عقد ناقص${r.createdFailed ? ` (فشل ${r.createdFailed}: راجع مفاتيح توقيع المنصة PI_ISSUER_* في Vercel)` : ''}. ` + (r.total === 0 ? '' : `اتثبّت ${r.anchored} وسُجّل ${r.recorded}.`) : r.total === 0 ? 'كل عقود البطاقة متثبّتة على البلوك تشين.' : `اتثبّت ${r.anchored} وسُجّل ${r.recorded} في العقد الذكي (من ${r.total} عقد)${r.failed ? ` (فشل ${r.failed}: ${(r.errors ?? []).map((e) => ANCHOR_HELP[e] ?? e).join(' / ') || 'جرّب تاني بعد شوية'})` : ''}.`);
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
    } finally { setBusy(''); }
  };

  if (error) return <Empty>❌ {error}</Empty>;
  if (!rows) return null;
  if (rows.length === 0) return <Empty>مفيش طلبات بطاقة لسه.</Empty>;
  const waiting = rows.filter((r) => r.status === 'paid' && !r.handedOverAt);
  const sorted = [...waiting, ...rows.filter((r) => !waiting.includes(r))];
  return (
    <Card title={`💳 طلبات البطاقة (${waiting.length} مدفوعة وفي انتظار التسليم)`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Btn onClick={anchor} disabled={busy === 'anchor'}>⛓️ ثبّت العقود على البلوك تشين</Btn>
        <Btn onClick={check} disabled={busy === 'check'}>🔍 افحص حساب المنصة</Btn>
        {notice ? <span className="text-xs text-gray-300" role="status">{notice}</span> : null}
      </div>
      <div className="space-y-2">
        {sorted.slice(0, 100).map((r) => {
          const st = STATUS[r.status] ?? { label: r.status, tone: 'gold' as const };
          return (
            <div key={r.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-xs text-gray-400" dir="ltr">{r.propertyId ?? '—'}</p>
                <span className="shrink-0 font-bold" style={{ color: GOLD }} dir="ltr">{(r.amountMinor / 100).toFixed(2)} {r.currency}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
                <Badge tone={st.tone}>{st.label}</Badge>
                {r.handedOverAt ? <Badge tone="green">تم التسليم</Badge> : null}
                <span>{fmtDate(r.createdAt)}</span>
                <span className="truncate" dir="ltr">{r.uid}</span>
              </div>
              {r.note ? <p className="mt-1 text-xs text-gray-500" dir="auto">📝 {r.note}</p> : null}
              {r.status === 'paid' && !r.handedOverAt && (
                <div className="mt-2"><Btn small onClick={() => handOver(r.id)} disabled={busy === r.id}>✅ تم تسليم العقار</Btn></div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
