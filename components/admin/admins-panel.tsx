'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Badge, Empty, Field, inputCls, fmtDate } from './admin-ui';
import { STAFF_ROLES, ROLE_LABELS, type AdminRole } from '@/lib/admin-roles';

type Row = { id: string; username: string; name: string; role: AdminRole; status: 'active' | 'suspended'; lastLoginAt: string | null; suspendedReason: string };
type Rep = { actor: string; name: string; role: string; writes: number; logins: number; failedLogins: number; byGroup: Record<string, number>; lastAtMs: number };
const HOURS = [{ h: 24, l: 'آخر 24 ساعة' }, { h: 168, l: 'آخر 7 أيام' }, { h: 720, l: 'آخر 30 يوم' }];

// Owner only: staff admin accounts. Suspend anyone at any moment, change a role, reset a PIN, and read each admin's activity report.
export default function AdminsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [report, setReport] = useState<Rep[]>([]);
  const [hours, setHours] = useState(24);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [shownPin, setShownPin] = useState<{ id: string; pin: string } | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('viewer');
  const [busy, setBusy] = useState(false);

  const load = useCallback((h: number) => {
    adminApi<{ admins: Row[]; report: Rep[] }>(`/api/admin/admins?hours=${h}`)
      .then((d) => { setRows(d.admins); setReport(d.report); })
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(() => { load(hours); }, [load, hours]);

  const call = async (method: 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>, query = '') => {
    setBusy(true); setNotice(''); setError('');
    try {
      const d = await adminApi<{ pin?: string; id?: string }>(`/api/admin/admins${query}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      load(hours);
      return d;
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setError((e as Error).message);
      return null;
    } finally { setBusy(false); }
  };

  const create = async () => {
    const d = await call('POST', { username, name, role });
    if (d?.pin) { setShownPin({ id: d.id ?? username, pin: d.pin }); setUsername(''); setName(''); }
  };
  const suspend = async (r: Row) => {
    const reason = window.prompt(`إيقاف ${r.username} فورًا. سبب الإيقاف (اختياري):`);
    if (reason === null) return;
    if (await call('PATCH', { id: r.id, action: 'suspend', reason })) setNotice(`اتوقف ${r.username}: أي طلب جاي منه هيترفض خلال ثواني.`);
  };
  const resume = async (r: Row) => { if (await call('PATCH', { id: r.id, action: 'resume' })) setNotice(`اتفعّل ${r.username} تاني.`); };
  const changeRole = async (r: Row, next: AdminRole) => { if (await call('PATCH', { id: r.id, action: 'role', role: next })) setNotice(`اتغيّر دور ${r.username} (هيسجّل دخول من جديد).`); };
  const resetPin = async (r: Row) => {
    if (!window.confirm(`PIN جديد لـ ${r.username}؟ جلساته الحالية هتقفل.`)) return;
    const d = await call('PATCH', { id: r.id, action: 'resetPin' });
    if (d?.pin) setShownPin({ id: r.id, pin: d.pin });
  };
  const remove = async (r: Row) => {
    if (!window.confirm(`حذف حساب ${r.username} نهائيًا؟ (للإيقاف المؤقت استخدم "إيقاف")`)) return;
    if (await call('DELETE', undefined, `?id=${encodeURIComponent(r.id)}`)) setNotice(`اتحذف ${r.username}.`);
  };

  if (error && !rows) return <Empty>❌ {error}</Empty>;
  if (!rows) return null;
  const roleLabel = (r: string) => (ROLE_LABELS as Record<string, string>)[r] ?? r;
  return (
    <div className="space-y-4">
      {shownPin && (
        <div className="rounded-xl border border-accent bg-card p-3 text-sm text-foreground" role="status">
          <p className="font-semibold text-accent">الـ PIN بتاع {shownPin.id} (بيظهر مرة واحدة بس، سلّمهوله وانسخه دلوقتي):</p>
          <p className="mt-1 select-all font-mono text-lg" dir="ltr">{shownPin.pin}</p>
          <Btn small kind="ghost" onClick={() => setShownPin(null)}>تم، إخفاء</Btn>
        </div>
      )}
      {notice ? <p className="text-xs text-foreground/80" role="status">{notice}</p> : null}
      {error ? <p className="text-xs text-red-400" role="alert">❌ {error}</p> : null}

      <Card title={`👥 حسابات الأدمن (${rows.length})`}>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">مفيش حسابات موظفين لسه. إنت (المالك) بتدخل بالـ PIN بتاعك وليك كل الصلاحيات.</p> : null}
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground" dir="ltr">{r.username}</span>
                <span className="text-sm text-foreground/80" dir="auto">{r.name}</span>
                <Badge tone={r.status === 'active' ? 'green' : 'red'}>{r.status === 'active' ? 'شغّال' : 'موقوف'}</Badge>
                <span className="text-xs text-muted-foreground">آخر دخول: {fmtDate(r.lastLoginAt)}</span>
              </div>
              {r.suspendedReason ? <p className="mt-1 text-xs text-muted-foreground" dir="auto">سبب الإيقاف: {r.suspendedReason}</p> : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select value={r.role} disabled={busy} onChange={(e) => changeRole(r, e.target.value as AdminRole)} className={`${inputCls} !w-auto !py-1.5 text-xs`} aria-label="الدور">
                  {STAFF_ROLES.map((x) => <option key={x} value={x}>{roleLabel(x)}</option>)}
                </select>
                {r.status === 'active' ? <Btn small kind="danger" onClick={() => suspend(r)} disabled={busy}>⛔ إيقاف فوري</Btn> : <Btn small onClick={() => resume(r)} disabled={busy}>▶ تفعيل</Btn>}
                <Btn small kind="ghost" onClick={() => resetPin(r)} disabled={busy}>🔑 PIN جديد</Btn>
                <Btn small kind="ghost" onClick={() => remove(r)} disabled={busy}>🗑 حذف</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="➕ أدمن جديد">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="اسم الدخول (إنجليزي، 3-24)"><input className={inputCls} dir="ltr" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} autoCapitalize="none" /></Field>
          <Field label="الاسم"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></Field>
          <Field label="الدور">
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>{STAFF_ROLES.map((x) => <option key={x} value={x}>{roleLabel(x)}</option>)}</select>
          </Field>
        </div>
        <div className="mt-3"><Btn onClick={create} disabled={busy || !username}>إنشاء (PIN عشوائي قوي بيتعرض مرة واحدة)</Btn></div>
        <p className="mt-2 text-xs text-muted-foreground">الأدمن بيدخل من شاشة الدخول بزر «دخول موظف» بالاسم والـ PIN. أي دخول منه بيجيلك إيميل.</p>
      </Card>

      <Card title="📋 تقرير نشاط كل أدمن" right={
        <select value={hours} onChange={(e) => setHours(Number(e.target.value))} className={`${inputCls} !w-auto !py-1 text-xs`} aria-label="الفترة">{HOURS.map((x) => <option key={x.h} value={x.h}>{x.l}</option>)}</select>
      }>
        {report.length === 0 ? <p className="text-sm text-muted-foreground">مفيش نشاط في الفترة دي.</p> : (
          <div className="space-y-2">
            {report.map((s) => (
              <div key={s.actor} className="rounded-xl border border-border bg-card p-3 text-sm">
                <p className="font-semibold text-foreground">{s.name} <span className="text-xs font-normal text-muted-foreground" dir="ltr">{s.actor}{s.role ? ` · ${s.role}` : ''}</span></p>
                <p className="mt-1 text-xs text-foreground/80">تعديلات: {s.writes} · دخول: {s.logins}{s.failedLogins ? ` · ⚠ ${s.failedLogins} محاولة وهو موقوف` : ''}</p>
                <p className="mt-1 text-xs text-muted-foreground" dir="auto">{Object.entries(s.byGroup).map(([g, n]) => `${g}: ${n}`).join(' · ') || '—'}</p>
                <p className="mt-1 text-xs text-muted-foreground">آخر نشاط: {s.lastAtMs ? fmtDate(new Date(s.lastAtMs).toISOString()) : '—'}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">التقرير ده بيتبعتلك كمان بالإيميل كل يوم (لو فيه نشاط).</p>
      </Card>
    </div>
  );
}
