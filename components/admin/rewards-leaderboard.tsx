'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Stat, Empty, Badge } from './admin-ui';
import { downloadCsv } from '@/lib/csv-download';
import type { Overview } from '@/lib/rewards-overview';

const TIER_AR: Record<string, string> = { bronze: '🥉 برونزي', silver: '🥈 فضي', gold: '🥇 ذهبي', platinum: '💎 بلاتيني' };
const TIER_TONE: Record<string, 'gold' | 'green' | 'blue' | 'gray'> = { bronze: 'gray', silver: 'blue', gold: 'gold', platinum: 'green' };

// Admin: how the rewards program is doing, and the members with the most points.
export default function RewardsLeaderboard({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [d, setD] = useState<(Overview & { truncated: boolean }) | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi<Overview & { truncated: boolean }>('/api/admin/rewards/overview')
      .then(setD)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);

  if (error) return <Empty>❌ {error}</Empty>;
  if (!d) return <Empty>...جاري التحميل</Empty>;

  const exportCsv = () =>
    downloadCsv('rewards', ['username', 'points', 'tier', 'stays', 'purchases', 'reviews', 'referrals'], d.top.map((m) => [m.username, m.points, m.tier, m.stays, m.purchases, m.reviews, m.referrals]));

  return (
    <Card title="🏆 أعلى الأعضاء نقاطاً" right={<Btn small kind="ghost" onClick={exportCsv} disabled={!d.top.length}>⬇️ CSV</Btn>}>
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="أعضاء عندهم نقاط" value={d.totals.members} />
        <Stat label="إجمالي النقاط" value={d.totals.points} />
        <Stat label="أكواد اتستخدمت" value={d.totals.redeemed} />
        <Stat label="إحالات مكتملة" value={d.totals.qualifiedReferrals} />
      </div>
      <p className="mb-3 text-xs text-gray-400">
        {Object.entries(d.totals.byTier).map(([t, n]) => `${TIER_AR[t]}: ${n}`).join(' · ')}
      </p>
      {d.truncated && <p className="mb-2 text-xs text-yellow-400">⚠️ البيانات كبيرة، الأرقام دي من أول 2000 سجل في كل جدول.</p>}
      {d.top.length === 0 && <Empty>لسه مفيش حد كسب نقاط.</Empty>}
      <div className="space-y-2">
        {d.top.map((m, i) => (
          <div key={m.username} className="flex items-center justify-between gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-white">{i + 1}. @{m.username}</p>
              <p className="text-xs text-gray-400">إقامات {m.stays} · شراء {m.purchases} · تقييمات {m.reviews} · إحالات {m.referrals}</p>
            </div>
            <div className="shrink-0 text-end">
              <p className="font-bold text-white">{m.points}</p>
              <Badge tone={TIER_TONE[m.tier]}>{TIER_AR[m.tier]}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
