'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Card } from './admin-ui';
import { GROUP_LABELS, type ReadinessCheck, type ReadinessGroup } from '@/lib/launch-readiness';

type Data = { checks: ReadinessCheck[]; summary: { ready: boolean; blocking: number; advice: number; total: number; passed: number } };

// "Ready to open to the public?": every check with what to do when it fails. Blocking ones come first.
export default function ReadinessPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi<Data>('/api/admin/readiness')
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);

  if (error) return <p className="text-sm text-red-400">❌ {error}</p>;
  if (!data) return null;
  const { summary: s } = data;
  const groups = Object.keys(GROUP_LABELS) as ReadinessGroup[];
  return (
    <Card title={`🚀 جاهزية الإطلاق (${s.passed}/${s.total})`}>
      <p className={`mb-3 rounded-xl border p-3 text-sm ${s.ready ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
        {s.ready ? `✅ مفيش حاجة مانعة الإطلاق${s.advice ? ` (وفيه ${s.advice} توصية)` : ''}.` : `⛔ ${s.blocking} حاجة لازم تتصلّح قبل ما تفتح الموقع للناس.`}
      </p>
      <div className="space-y-3">
        {groups.map((g) => {
          const rows = data.checks.filter((c) => c.group === g);
          if (rows.length === 0) return null;
          return (
            <div key={g}>
              <p className="mb-1 text-xs font-semibold text-gray-400">{GROUP_LABELS[g]}</p>
              <ul className="space-y-1">
                {rows.map((c) => (
                  <li key={c.id} className="text-sm">
                    <span className={c.ok ? 'text-green-400' : c.blocking ? 'text-red-300' : 'text-yellow-300'}>{c.ok ? '✅' : c.blocking ? '⛔' : '⚠️'} {c.title}</span>
                    {!c.ok && <span className="block pr-6 text-xs text-gray-400">{c.fix}</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-500">القايمة دي بتفحص الإعدادات والأرقام بس. مراجعة المحامي لسياسة الخصوصية والشروط، وترجمة اللغات، واختبار دفعة حقيقية، لازم تتعمل بإيدك قبل الإطلاق.</p>
    </Card>
  );
}
