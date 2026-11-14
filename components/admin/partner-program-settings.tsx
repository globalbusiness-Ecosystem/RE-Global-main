'use client';

import { useEffect, useState } from 'react';
import { PARTNER_ROLES, RATE_MAX, type PartnerRole } from '@/lib/partners';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';
import { ROLE_AR } from './partner-labels';

type Rules = { enabled: boolean; rates: Record<PartnerRole, number> };

// The commission percentage for each kind of partner, and a switch that pauses the whole program.
export default function PartnerProgramSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [saved, setSaved] = useState<Rules | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [rates, setRates] = useState<Record<PartnerRole, string>>({ broker: '0', developer: '0', investor: '0', sales: '0' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = (e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ')); };
  const apply = (r: Rules) => {
    setSaved(r); setEnabled(r.enabled);
    setRates(Object.fromEntries(PARTNER_ROLES.map((k) => [k, String(r.rates[k])])) as Record<PartnerRole, string>);
  };
  useEffect(() => { adminApi<{ rules: Rules }>('/api/admin/partner-program').then((d) => apply(d.rules)).catch(fail); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const bad = PARTNER_ROLES.some((k) => { const n = Number(rates[k]); return rates[k].trim() === '' || !Number.isFinite(n) || n < 0 || n > RATE_MAX; });
  const changed = !!saved && (saved.enabled !== enabled || PARTNER_ROLES.some((k) => Number(rates[k]) !== saved.rates[k]));

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      const body = { enabled, rates: Object.fromEntries(PARTNER_ROLES.map((k) => [k, Number(rates[k])])) };
      const d = await adminApi<{ rules: Rules }>('/api/admin/partner-program', { method: 'PUT', body: JSON.stringify(body) });
      apply(d.rules);
      setMsg('✅ اتحفظ. النسبة الجديدة بتسري على سطور العمولة اللي بتتكتب من دلوقتي، والسطور القديمة بتفضل بنسبتها.');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const inp = 'w-24 rounded-lg border border-[#3a3a3a] bg-[#161616] px-2 py-1.5 text-sm text-gray-100';
  return (
    <Card title="📐 نسب عمولة الشركاء">
      <p className="mb-3 text-xs text-gray-400">نسبة مئوية من قيمة كل عملية شراء عقار مكتملة لعميل جديد دخل بكود الشريك، بعد اعتماد الشريك (من 0 لحد {RATE_MAX}%). الصفر معناه مفيش عمولة. الدفع بيتم منك خارج المنصة وبتعلّمه «مدفوعة» من تبويب العمولات.</p>
      <label className="mb-4 flex items-center gap-2 text-sm text-gray-100">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} aria-label="تشغيل برنامج العمولات" />
        برنامج العمولات شغّال (لو وقفته الدعوات بتفضل بتتعدّ لكن مفيش عمولات جديدة)
      </label>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PARTNER_ROLES.map((k) => (
          <label key={k} className="flex items-center justify-between gap-3 rounded-xl border border-[#2a2a2a] bg-[#101010] p-3 text-sm text-gray-200">
            {ROLE_AR[k]}
            <span className="flex items-center gap-1"><input className={inp} dir="ltr" type="number" inputMode="decimal" min={0} max={RATE_MAX} step={0.25} aria-label={`نسبة عمولة ${ROLE_AR[k]}`} value={rates[k]} onChange={(e) => setRates({ ...rates, [k]: e.target.value })} />%</span>
          </label>
        ))}
      </div>
      {bad && <p className="mb-2 text-xs text-red-400">كل نسبة لازم تكون رقم من 0 لحد {RATE_MAX}.</p>}
      <div className="flex items-center gap-3">
        <Btn onClick={save} disabled={busy || bad || !changed}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</Btn>
        {msg && <span className="text-xs text-gray-300" role="status">{msg}</span>}
      </div>
    </Card>
  );
}
