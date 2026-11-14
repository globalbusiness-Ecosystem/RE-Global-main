import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PARTNER_ROLES, PARTNER_STATUSES, COMMISSION_STATUSES } from '@/lib/partners';
import { ROLE_AR, PARTNER_STATUS_AR, COMMISSION_STATUS_AR } from '@/components/admin/partner-labels';

const src = (p: string) => readFileSync(p, 'utf8');

describe('partner admin panels', () => {
  it('every role and status has an Arabic label', () => {
    for (const r of PARTNER_ROLES) expect(ROLE_AR[r]).toBeTruthy();
    for (const s of PARTNER_STATUSES) expect(PARTNER_STATUS_AR[s].label).toBeTruthy();
    for (const s of COMMISSION_STATUSES) expect(COMMISSION_STATUS_AR[s].label).toBeTruthy();
  });
  it('they sit in the payments section of the admin panel', () => {
    const s = src('components/admin/payments-tab.tsx');
    for (const c of ['PartnerApplicationsPanel', 'PartnerProgramSettings', 'PartnerCommissionsPanel']) expect(s, c).toContain(`<${c} onUnauthorized`);
  });
  it('the review buttons offer only the steps the server allows', () => {
    const panel = src('components/admin/partner-applications-panel.tsx');
    const route = src('app/api/admin/partners/route.ts');
    // server: approve from pending/rejected, reject from pending, suspend from approved, reinstate from suspended
    expect(route).toMatch(/approve: \{ from: \['pending', 'rejected'\]/);
    expect(route).toMatch(/reject: \{ from: \['pending'\]/);
    expect(route).toMatch(/suspend: \{ from: \['approved'\]/);
    expect(route).toMatch(/reinstate: \{ from: \['suspended'\]/);
    expect(panel).toMatch(/pending: \[\{ action: 'approve'.*\{ action: 'reject'/);
    expect(panel).toMatch(/rejected: \[\{ action: 'approve'/);
    expect(panel).toMatch(/approved: \[\{ action: 'suspend'/);
    expect(panel).toMatch(/suspended: \[\{ action: 'reinstate'/);
  });
  it('a rejection needs a reason, an approval asks for confirmation', () => {
    const s = src('components/admin/partner-applications-panel.tsx');
    expect(s).toContain("note: 'required'");
    expect(s).toContain('window.confirm');
  });
  it('the panels call the three admin routes', () => {
    expect(src('components/admin/partner-applications-panel.tsx')).toContain('/api/admin/partners');
    expect(src('components/admin/partner-program-settings.tsx')).toContain('/api/admin/partner-program');
    expect(src('components/admin/partner-commissions-panel.tsx')).toContain('/api/admin/partner-commissions');
  });
  it('rates are limited to the same maximum as the server and every field is labelled', () => {
    const s = src('components/admin/partner-program-settings.tsx');
    expect(s).toContain('RATE_MAX');
    expect(s).toContain('aria-label={`نسبة عمولة');
    expect(s).toContain('aria-label="تشغيل برنامج العمولات"');
  });
  it('paying or cancelling a commission asks first, and only a line still owed shows the buttons', () => {
    const s = src('components/admin/partner-commissions-panel.tsx');
    expect(s).toContain('window.confirm');
    expect(s).toContain("r.status === 'accrued' &&");
  });
  it('a website from an applicant is only opened safely', () => {
    expect(src('components/admin/partner-applications-panel.tsx')).toContain('noopener noreferrer nofollow');
  });
});
