'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls } from './admin-ui';
import { BENEFIT_MAX, TIER_IDS, parseRules, type Rules } from '@/lib/rewards';

const NAMES: Record<string, string> = { bronze: '🥉 برونزي', silver: '🥈 فضي', gold: '🥇 ذهبي', platinum: '💎 بلاتيني' };

// Admin: how many points each action earns, where each level starts, and the benefits text of every level.
export default function RewardsSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [f, setF] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ rules: Rules }>('/api/admin/rewards')
      .then(({ rules: r }) => setF({
        stay: String(r.points.stay), purchase: String(r.points.purchase), review: String(r.points.review),
        silver: String(r.tiers.silver), gold: String(r.tiers.gold), platinum: String(r.tiers.platinum),
        b_bronze: r.benefits.bronze, b_silver: r.benefits.silver, b_gold: r.benefits.gold, b_platinum: r.benefits.platinum,
      }))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const set = (k: string, v: string) => setF((cur) => (cur ? { ...cur, [k]: v } : cur));
  const rules = f ? parseRules({
    points: { stay: f.stay, purchase: f.purchase, review: f.review },
    tiers: { silver: f.silver, gold: f.gold, platinum: f.platinum },
    benefits: { bronze: f.b_bronze, silver: f.b_silver, gold: f.b_gold, platinum: f.b_platinum },
  }) : null;

  const save = async () => {
    if (!rules) return;
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/rewards', { method: 'PUT', body: JSON.stringify(rules) });
      setMsg('✅ اتحفظ. المستخدمين هيشوفوا النقاط والمستويات الجديدة في الإعدادات > المكافآت.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally { setBusy(false); }
  };

  const num = (k: string, label: string) => (
    <Field label={label}><input className={inputCls} type="number" min="0" dir="ltr" value={f?.[k] ?? ''} onChange={(e) => set(k, e.target.value)} disabled={!f} /></Field>
  );

  return (
    <div className="space-y-3">
      <Card title="🎁 برنامج المكافآت">
        <p className="mb-3 text-xs text-gray-400">النقاط بتتحسب أوتوماتيك من حاجات حصلت فعلاً: إقامة خلصت ومؤكدة، شراء عقار اتم، وتقييم ظاهر. الحجز الملغي أو اللي تحت المراجعة مالوش نقاط. الإحالات مش بتتحسب (لأنها مسجلة من المتصفح ومش مضمونة).</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {num('stay', 'نقاط كل إقامة مكتملة')}
          {num('purchase', 'نقاط كل شراء عقار')}
          {num('review', 'نقاط كل تقييم')}
        </div>
      </Card>
      <Card title="🏅 المستويات">
        <p className="mb-3 text-xs text-gray-400">البرونزي بيبدأ من 0. كل مستوى لازم يكون أعلى من اللي قبله.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {num('silver', 'الفضي يبدأ من (نقطة)')}
          {num('gold', 'الذهبي يبدأ من (نقطة)')}
          {num('platinum', 'البلاتيني يبدأ من (نقطة)')}
        </div>
        <p className="mb-2 mt-4 text-xs text-gray-400">مزايا كل مستوى (نص عادي اختياري، لحد {BENEFIT_MAX} حرف). اكتب بس المزايا اللي هتنفذها فعلاً، لو سبته فاضي مفيش حاجة بتظهر للمستخدم.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TIER_IDS.map((id) => (
            <Field key={id} label={NAMES[id]}>
              <textarea className={inputCls} rows={2} maxLength={BENEFIT_MAX} value={f?.['b_' + id] ?? ''} onChange={(e) => set('b_' + id, e.target.value)} disabled={!f} />
            </Field>
          ))}
        </div>
        {f && !rules && <p className="mt-2 text-xs text-red-400">راجع الأرقام: أعداد صحيحة، والفضي &lt; الذهبي &lt; البلاتيني.</p>}
        <div className="mt-3"><Btn onClick={save} disabled={busy || !rules || !f}>{busy ? '...' : '💾 حفظ'}</Btn></div>
        {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
      </Card>
    </div>
  );
}
