'use client';

import { useCallback, useEffect, useState } from 'react';
import { PROJECT_STATUSES, installmentSchedule, type ProjectStatus, type InstallmentPlan } from '@/lib/partner-projects';
import { COUNTRIES } from '@/lib/legal-profiles';
import { formatMoney } from '@/lib/format';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, fmtDate } from './admin-ui';
import { ROLE_AR } from './partner-labels';
import type { PartnerRole } from '@/lib/partners';

type Row = {
  id: string; owner: string; company: string; role: PartnerRole; title: string; description: string; kind: string; country: string; city: string;
  price: number; currency: string; images: string[]; contact: string; installments: InstallmentPlan[]; status: ProjectStatus; note: string;
  updatedAt: string | null; submittedAt: string | null;
};
type Action = 'approve' | 'reject' | 'hide' | 'restore';

const STATUS_AR: Record<ProjectStatus, { label: string; tone: 'gold' | 'green' | 'red' | 'gray' }> = {
  pending: { label: 'قيد المراجعة', tone: 'gold' }, approved: { label: 'منشور', tone: 'green' }, rejected: { label: 'مرفوض', tone: 'red' }, hidden: { label: 'مخفي', tone: 'gray' }, draft: { label: 'مسودة', tone: 'gray' },
};
const KIND_AR: Record<string, string> = { apartment: 'شقة', villa: 'فيلا', land: 'أرض', commercial: 'تجاري', hotel: 'فندق', other: 'أخرى' };
const STEPS: Record<ProjectStatus, { action: Action; label: string; kind: 'gold' | 'ghost' | 'danger'; note: 'required' | 'optional' }[]> = {
  pending: [{ action: 'approve', label: '✅ نشر', kind: 'gold', note: 'optional' }, { action: 'reject', label: 'رفض', kind: 'danger', note: 'required' }],
  approved: [{ action: 'hide', label: 'إخفاء', kind: 'danger', note: 'required' }],
  hidden: [{ action: 'restore', label: 'إعادة نشر', kind: 'gold', note: 'optional' }],
  rejected: [],
  draft: [],
};
const ORDER: ProjectStatus[] = ['pending', 'approved', 'hidden', 'rejected', 'draft'];

export default function PartnerProjectsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [filter, setFilter] = useState<ProjectStatus>('pending');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [open, setOpen] = useState('');

  const fail = useCallback((e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message); }, [onUnauthorized]);
  const load = useCallback(() => {
    adminApi<{ projects: Row[]; counts: Record<string, number> }>(`/api/admin/partner-projects?status=${filter}`).then((d) => { setRows(d.projects); setCounts(d.counts); setError(''); }).catch(fail);
  }, [filter, fail]);
  useEffect(() => { setRows(null); load(); }, [load]);

  const act = async (p: Row, s: (typeof STEPS)[ProjectStatus][number]) => {
    const note = (window.prompt(s.note === 'required' ? 'السبب (هيظهر للشريك):' : 'ملاحظة للشريك (اختياري):') ?? '').trim();
    if (s.note === 'required' && !note) return;
    setBusy(p.id);
    try { await adminApi('/api/admin/partner-projects', { method: 'PUT', body: JSON.stringify({ id: p.id, action: s.action, note }) }); load(); }
    catch (e) { fail(e); } finally { setBusy(''); }
  };

  return (
    <Card title="🏗️ مشاريع الشركاء">
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الحالة">
        {ORDER.filter((s) => (PROJECT_STATUSES as readonly string[]).includes(s)).map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${filter === s ? 'border-accent bg-accent text-black' : 'border-border text-foreground/80'}`}>
            {STATUS_AR[s].label} ({counts[s] ?? 0})
          </button>
        ))}
      </div>
      {error ? <Empty>❌ {error}</Empty> : !rows ? null : rows.length === 0 ? <Empty>مفيش مشاريع في الحالة دي.</Empty> : (
        <div className="space-y-2">
          {rows.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-input p-3">
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  { }
                  {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground" dir="auto">{p.title}</span>
                    <Badge tone={STATUS_AR[p.status].tone}>{STATUS_AR[p.status].label}</Badge>
                    <Badge tone="blue">{KIND_AR[p.kind] ?? p.kind}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground" dir="auto">{p.company} ({ROLE_AR[p.role] ?? p.role}) · @{p.owner} · {p.city}، {COUNTRIES[p.country]?.ar ?? p.country} · {formatMoney(p.price, p.currency, 'ar')} · {fmtDate(p.submittedAt ?? p.updatedAt ?? '')}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(open === p.id ? '' : p.id)} className="mt-2 text-xs text-accent" aria-expanded={open === p.id}>{open === p.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</button>
              {open === p.id && (
                <div className="mt-2 space-y-2">
                  <p className="whitespace-pre-line text-sm text-foreground" dir="auto">{p.description}</p>
                  {p.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {p.images.map((u) => (
                        <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                          { }
                          <img src={u} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  {p.contact && <p className="text-xs text-foreground/80">☎️ <span dir="ltr">{p.contact}</span></p>}
                  {p.installments.length === 0 ? <p className="text-xs text-muted-foreground">مفيش خطط تقسيط.</p> : (
                    <ul className="space-y-1 text-xs text-foreground/80">
                      {p.installments.map((pl, i) => {
                        const s = installmentSchedule(p.price, pl);
                        return <li key={i} className="rounded-md bg-muted p-2" dir="auto">{pl.label || `خطة ${i + 1}`}: مقدم {pl.downPct}% ({formatMoney(s.down, p.currency, 'ar')}) · {pl.months} شهر · زيادة {pl.extraPct}% · القسط {formatMoney(s.monthly, p.currency, 'ar')} · الإجمالي {formatMoney(s.total, p.currency, 'ar')}</li>;
                      })}
                    </ul>
                  )}
                </div>
              )}
              {p.note && <p className="mt-2 rounded-md bg-muted p-2 text-xs text-foreground/80">📝 {p.note}</p>}
              {STEPS[p.status].length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {STEPS[p.status].map((s) => <Btn key={s.action} small kind={s.kind} disabled={busy === p.id} onClick={() => act(p, s)}>{s.label}</Btn>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
