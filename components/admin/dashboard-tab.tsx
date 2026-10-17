'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Card, Stat, Empty, Badge, TYPE_LABELS, fmtDate, GOLD } from './admin-ui';
import AttentionPanel from './attention-panel';
import ActivityLog from './activity-log';
import CspPanel from './csp-panel';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

export default function DashboardTab({ onUnauthorized, goto }: { onUnauthorized: () => void; goto: (tab: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/api/admin/stats')
      .then(setData)
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);

  if (error) return <Empty>❌ {error}</Empty>;
  if (!data) return <Empty>...جاري التحميل</Empty>;

  const max = Math.max(1, ...data.series.map((s: any) => s.count));
  return (
    <div className="space-y-4">
      <AttentionPanel onUnauthorized={onUnauthorized} goto={goto} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="العقارات" value={data.properties.total} sub={`${data.properties.hidden} مخفي · ${data.properties.featured} مميز`} />
        <Stat label="العقود الموقّعة" value={data.contracts.total} sub={`آخر 7 أيام: ${data.contracts.last7.count}`} />
        <Stat label="إجمالي المدفوعات" value={`${data.contracts.totalAmount} π`} sub={`آخر 7 أيام: ${data.contracts.last7.amount} π`} />
        <Stat label="المستخدمون" value={data.users.profiles} sub={`${data.users.banned} محظور`} />
      </div>

      <Card title="العقود آخر 14 يوم">
        <div className="flex h-28 items-end gap-1" dir="ltr">
          {data.series.map((s: any) => (
            <div key={s.date} className="flex flex-1 flex-col items-center justify-end" title={`${s.date}: ${s.count} عقد · ${s.amount} π`}>
              <div className="w-full rounded-t" style={{ height: `${Math.max(4, (s.count / max) * 100)}%`, background: s.count ? GOLD : '#2a2a2a' }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-500" dir="ltr">
          <span>{data.series[0]?.date.slice(5)}</span><span>{data.series[data.series.length - 1]?.date.slice(5)}</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="العقارات حسب النوع" right={<button onClick={() => goto('properties')} className="text-xs text-blue-400">إدارة ←</button>}>
          {Object.keys(data.properties.byType).length === 0 ? <Empty>لسه مفيش عقارات. ضيف أول عقار.</Empty> : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.properties.byType).map(([t, n]) => (
                <Badge key={t} tone="gold">{TYPE_LABELS[t] || t}: {n as number}</Badge>
              ))}
            </div>
          )}
        </Card>
        <Card title="المدفوعات حسب النوع" right={<button onClick={() => goto('payments')} className="text-xs text-blue-400">الكل ←</button>}>
          {Object.keys(data.contracts.byType).length === 0 ? <Empty>مفيش مدفوعات لسه.</Empty> : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.contracts.byType).map(([t, v]: any) => (
                <Badge key={t} tone="green">{TYPE_LABELS[t] || t}: {v.count} ({v.amount} π)</Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="آخر العقود">
          {data.contracts.recent.length === 0 ? <Empty>مفيش عقود.</Empty> : data.contracts.recent.map((c: any) => (
            <a key={c.id} href={'/verify/' + c.id} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 border-b border-[#222] py-2 text-sm last:border-0">
              <span className="min-w-0 truncate text-white">{c.propertyTitle}<span className="block text-xs text-gray-500">@{c.buyerUsername} · {fmtDate(c.at)}</span></span>
              <span className="shrink-0 font-bold" style={{ color: GOLD }}>{c.amount} π</span>
            </a>
          ))}
        </Card>
        <Card title="آخر نشاط الأدمن">
          {data.activity.length === 0 ? <Empty>لسه مفيش نشاط مسجّل.</Empty> : data.activity.map((a: any) => (
            <div key={a.id} className="border-b border-[#222] py-2 text-sm last:border-0">
              <span className="text-white">{auditLabel(a.action)}</span>
              <span className="mx-2 text-xs text-gray-500">{auditSummary(a.action, a.detail)}</span>
              <span className="block text-xs text-gray-600">{fmtDate(a.at)}</span>
            </div>
          ))}
        </Card>
      </div>
      <ActivityLog onUnauthorized={onUnauthorized} />
      <CspPanel onUnauthorized={onUnauthorized} />
    </div>
  );
}
