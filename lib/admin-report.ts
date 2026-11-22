import { escapeHtml } from '@/lib/admin-alert';

// A per-admin activity report from the admin log: how many changes each person made, in which areas, how many sign-ins, and when they were last active.
// Pure (rows in, numbers out) so it is easy to test; the store reads the log and the daily job emails it to the owner.

export type AuditRow = { action: string; detail: Record<string, unknown>; atMs: number };
export type ActorSummary = { actor: string; name: string; role: string; writes: number; logins: number; failedLogins: number; byGroup: Record<string, number>; lastAtMs: number };

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** One summary per admin that did anything in the rows, busiest first. */
export function summarizeActivity(rows: AuditRow[]): ActorSummary[] {
  const by = new Map<string, ActorSummary>();
  const get = (actor: string, name: string, role: string) => {
    let s = by.get(actor);
    if (!s) { s = { actor, name: name || actor, role: role || '', writes: 0, logins: 0, failedLogins: 0, byGroup: {}, lastAtMs: 0 }; by.set(actor, s); }
    if (name && s.name === actor) s.name = name;
    if (role && !s.role) s.role = role;
    return s;
  };
  for (const r of rows) {
    const actor = str(r.detail?.actor);
    if (!actor) continue;
    if (r.action === 'admin.write') {
      const s = get(actor, str(r.detail.name), str(r.detail.role));
      s.writes++;
      const g = str(r.detail.group) || 'other';
      s.byGroup[g] = (s.byGroup[g] ?? 0) + 1;
      s.lastAtMs = Math.max(s.lastAtMs, r.atMs);
    } else if (r.action === 'admin.login') {
      const s = get(actor, '', str(r.detail.role));
      s.logins++;
      s.lastAtMs = Math.max(s.lastAtMs, r.atMs);
    } else if (r.action === 'admin.login.suspended') {
      get(actor, '', '').failedLogins++;
    }
  }
  return [...by.values()].sort((a, b) => b.writes - a.writes || b.logins - a.logins);
}

const GROUP_AR: Record<string, string> = { kyc: 'مراجعة KYC', kycAdmin: 'سياسات KYC', finance: 'المالية', users: 'المستخدمون', content: 'المحتوى', owner: 'إدارة', overview: 'نظرة عامة', other: 'أخرى' };

/** The e-mail body. Null when nobody did anything (no e-mail is better than an empty one). */
export function buildAdminReportHtml(list: ActorSummary[], hours: number, adminUrl: string): { subject: string; html: string } | null {
  if (list.length === 0) return null;
  const rows = list.map((s) => {
    const groups = Object.entries(s.byGroup).map(([g, n]) => `${GROUP_AR[g] ?? g}: ${n}`).join('، ') || '—';
    const last = s.lastAtMs ? new Date(s.lastAtMs).toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }) : '—';
    return `<tr><td style="padding:6px 10px"><b>${escapeHtml(s.name)}</b><br><span style="color:#888">${escapeHtml(s.actor)}${s.role ? ` · ${escapeHtml(s.role)}` : ''}</span></td>`
      + `<td style="padding:6px 10px">${s.writes}</td><td style="padding:6px 10px">${s.logins}${s.failedLogins ? ` <span style="color:#c00">(${s.failedLogins} محاولة وهو موقوف)</span>` : ''}</td>`
      + `<td style="padding:6px 10px">${escapeHtml(groups)}</td><td style="padding:6px 10px;white-space:nowrap">${escapeHtml(last)}</td></tr>`;
  }).join('');
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif"><h3>تقرير نشاط الأدمن (آخر ${hours} ساعة)</h3>`
    + `<table border="1" cellspacing="0" style="border-collapse:collapse;border-color:#ddd"><tr style="background:#f4f4f4"><th style="padding:6px 10px">الأدمن</th><th>تعديلات</th><th>دخول</th><th>المجالات</th><th>آخر نشاط (القاهرة)</th></tr>${rows}</table>`
    + `<p><a href="${escapeHtml(adminUrl)}">افتح لوحة التحكم</a> لإيقاف أي أدمن في أي وقت.</p></div>`;
  return { subject: `[RE Global] تقرير نشاط الأدمن: ${list.length} أدمن`, html };
}
