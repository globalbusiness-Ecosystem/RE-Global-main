import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { cleanIncident, cleanRequest, incidentDeadline, requestDeadline, clock, incidentClock, requestClock, complianceAttention, NOTIFY_HOURS, REQUEST_DAYS } from '@/lib/compliance';
import { buildAttention } from '@/lib/attention-rules';
import { groupOf, can } from '@/lib/admin-roles';

const src = (p: string) => readFileSync(p, 'utf8');
const NOW = 1_800_000_000_000;
const H = 3_600_000;

describe('cleaning what the admin types', () => {
  it('an incident needs a title and a known severity; the time cannot be in the future', () => {
    expect(cleanIncident({ title: ' ', severity: 'low' })).toBeNull();
    expect(cleanIncident({ title: 'x', severity: 'huge' })).toBeNull();
    const i = cleanIncident({ title: ' Lost laptop ', severity: 'high', personalData: true, discoveredAt: new Date(NOW + 10 * 86_400_000).toISOString() }, NOW)!;
    expect(i).toMatchObject({ title: 'Lost laptop', severity: 'high', personalData: true, discoveredAtMs: NOW });
    expect(cleanIncident({ title: 'x', severity: 'low', discoveredAt: 'garbage' }, NOW)!.discoveredAtMs).toBe(NOW);
    expect(cleanIncident({ title: 'x', severity: 'low' }, NOW)!.personalData).toBe(false);
  });
  it('a request needs a known kind and a requester', () => {
    expect(cleanRequest({ kind: 'erase', requester: '' })).toBeNull();
    expect(cleanRequest({ kind: 'sell', requester: 'a@b.c' })).toBeNull();
    expect(cleanRequest({ kind: 'access', requester: ' a@b.c ' }, NOW)).toMatchObject({ kind: 'access', requester: 'a@b.c', receivedAtMs: NOW });
  });
});

describe('deadlines and clocks', () => {
  it('72 hours for an incident, 30 days for a request', () => {
    expect(incidentDeadline(NOW)).toBe(NOW + NOTIFY_HOURS * H);
    expect(requestDeadline(NOW)).toBe(NOW + REQUEST_DAYS * 24 * H);
  });
  it('ok, soon, late, and stopped once handled', () => {
    expect(clock(NOW + 50 * H, false, NOW).state).toBe('ok');
    expect(clock(NOW + 10 * H, false, NOW)).toEqual({ state: 'soon', hoursLeft: 10 });
    expect(clock(NOW - H, false, NOW).state).toBe('late');
    expect(clock(NOW - H, true, NOW).state).toBe('stopped');
    expect(clock(null, false, NOW).state).toBe('none');
  });
  it('an incident without personal data has no clock; notifying or closing stops it', () => {
    const base = { personalData: true, status: 'open' as const, discoveredAtMs: NOW - 80 * H };
    expect(incidentClock({ ...base, personalData: false }, NOW).state).toBe('none');
    expect(incidentClock(base, NOW).state).toBe('late');
    expect(incidentClock({ ...base, status: 'contained' }, NOW).state).toBe('late');
    expect(incidentClock({ ...base, status: 'notified' }, NOW).state).toBe('stopped');
    expect(incidentClock({ ...base, status: 'closed' }, NOW).state).toBe('stopped');
  });
  it('a request turns "soon" five days before its deadline and stops when answered', () => {
    expect(requestClock({ status: 'open', receivedAtMs: NOW - 26 * 24 * H }, NOW).state).toBe('soon');
    expect(requestClock({ status: 'open', receivedAtMs: NOW - 31 * 24 * H }, NOW).state).toBe('late');
    expect(requestClock({ status: 'done', receivedAtMs: NOW - 31 * 24 * H }, NOW).state).toBe('stopped');
  });
  it('counts what needs attention', () => {
    const c = complianceAttention(
      [{ personalData: true, status: 'open', discoveredAtMs: NOW - 80 * H }, { personalData: true, status: 'open', discoveredAtMs: NOW - 60 * H }, { personalData: false, status: 'open', discoveredAtMs: NOW - 500 * H }],
      [{ status: 'open', receivedAtMs: NOW - 31 * 24 * H }], NOW);
    expect(c).toEqual({ late: 2, soon: 1, openIncidents: 3 });
  });
});

describe('wiring', () => {
  it('shows on the dashboard: late is bad, soon is a warning', () => {
    const base = { env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true }, usdProperties: 0, piRateSet: true, pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 } };
    expect(buildAttention({ ...base, complianceLate: 1 }).find((x) => x.id === 'compliance-late')?.level).toBe('bad');
    expect(buildAttention({ ...base, complianceSoon: 1 }).find((x) => x.id === 'compliance-soon')?.level).toBe('warn');
    expect(buildAttention(base).some((x) => x.id.startsWith('compliance'))).toBe(false);
  });
  it('compliance staff reach the register, reviewers and finance do not', () => {
    expect(groupOf('/api/admin/compliance-register')).toBe('kycAdmin');
    expect(can('compliance', 'kycAdmin', 'POST')).toBe(true);
    expect(can('reviewer', 'kycAdmin', 'GET')).toBe(false);
    expect(can('finance', 'kycAdmin', 'GET')).toBe(false);
  });
  it('the register cannot be deleted from, and every change is logged by name', () => {
    const r = src('app/api/admin/compliance-register/route.ts');
    expect(r).not.toContain('export async function DELETE');
    expect(r).toContain("logAdmin('compliance.incident.create'");
    expect(r).toContain('adminWho(req)');
    expect(src('lib/compliance-store.ts')).not.toContain('.delete(');
  });
  it('the screen is in the payments tab', () => {
    expect(src('components/admin/payments-tab.tsx')).toContain('CompliancePanel');
    expect(src('lib/admin-attention.ts')).toContain('complianceCounts()');
  });
});
