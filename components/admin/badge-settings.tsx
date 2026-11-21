'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls } from './admin-ui';
import { VerifiedBadge } from '@/components/verified-badge';
import { BADGE_LEVELS, BADGE_THRESHOLDS, badgeLevelName, parseThresholds } from '@/lib/badge-level';

// Admin: the points where each of the 7 badge levels starts. (The founder's own badge level is set in the founder card.)
export default function BadgeSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [v, setV] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ thresholds: number[] }>('/api/admin/badges')
      .then((d) => setV(d.thresholds.map(String)))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const parsed = v ? parseThresholds(v) : null;
  const set = (i: number, x: string) => setV((cur) => (cur ? cur.map((y, k) => (k === i ? x : y)) : cur));

  const save = async () => {
    if (!parsed) return;
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/badges', { method: 'PUT', body: JSON.stringify({ thresholds: parsed }) });
      setMsg('✅ اتحفظ. المستخدمين هيشوفوا المستويات الجديدة في الإعدادات > المكافآت.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally { setBusy(false); }
  };

  return (
    <Card title="🎖️ الشارات: 7 مستويات بـ7 ألوان">
      <p className="mb-3 text-xs text-muted-foreground">لون الشارة جنب الاسم بيتحدد من نقاط المكافآت (إقامات، مشتريات، تقييمات، أصدقاء). حدد هنا النقاط اللي كل مستوى بيبدأ منها. المستوى الأول دايماً من 0 وكل مستوى لازم يكون أعلى من اللي قبله.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {BADGE_LEVELS.map((l, i) => (
          <Field key={l} label={`${l} · ${badgeLevelName(l, 'ar')}`}>
            <div className="flex items-center gap-2">
              <VerifiedBadge language="ar" size={26} level={l} />
              <input className={inputCls} type="number" min="0" dir="ltr" value={v?.[i] ?? ''} disabled={!v || i === 0} onChange={(e) => set(i, e.target.value)} />
            </div>
          </Field>
        ))}
      </div>
      {v && !parsed && <p className="mt-2 text-xs text-red-400">راجع الأرقام: أعداد صحيحة، الأول 0، وكل رقم أكبر من اللي قبله.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn onClick={() => void save()} disabled={busy || !parsed || !v}>{busy ? '...' : '💾 حفظ'}</Btn>
        <Btn kind="ghost" onClick={() => setV(BADGE_THRESHOLDS.map(String))} disabled={busy || !v}>الأرقام الافتراضية</Btn>
      </div>
      {msg && <p className="mt-2 text-xs text-foreground">{msg}</p>}
    </Card>
  );
}
