import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { groupOf, can, ROLES, STAFF_ROLES, TAB_ACCESS, isRole } from '@/lib/admin-roles';
import { hashPin, verifyPin, isStrongStaffPin, generatePin, cleanUsername } from '@/lib/admin-pin';
import { createAdminToken, verifyAdminToken, adminTokenIdentity } from '@/lib/admin-session';
import { summarizeActivity, buildAdminReportHtml } from '@/lib/admin-report';

const src = (p: string) => readFileSync(p, 'utf8');

describe('areas and roles', () => {
  it('classifies the admin routes, and anything unknown is owner-only', () => {
    expect(groupOf('/api/admin/kyc')).toBe('kyc');
    expect(groupOf('/api/admin/kyc/file')).toBe('kyc');
    expect(groupOf('/api/admin/kyc-policy')).toBe('kycAdmin');
    expect(groupOf('/api/admin/kyc-retention')).toBe('kycAdmin');
    expect(groupOf('/api/admin/payouts')).toBe('finance');
    expect(groupOf('/api/payments/app-to-user')).toBe('finance');
    expect(groupOf('/api/admin/texts')).toBe('content');
    expect(groupOf('/api/admin/admins')).toBe('owner');
    expect(groupOf('/api/admin/backup')).toBe('owner');
    expect(groupOf('/api/admin/revoke-sessions')).toBe('owner');
    expect(groupOf('/api/admin/something-new')).toBe('owner');
    expect(groupOf('/api/somewhere/else')).toBe('owner');
    expect(groupOf('/api/admin-auth')).toBe('session');
  });
  it('every admin route folder is classified on purpose (a new one is owner-only until someone adds it)', () => {
    const dirs = readdirSync('app/api/admin').filter((d) => statSync(join('app/api/admin', d)).isDirectory());
    const ownerOnly = ['audit', 'backup', 'client-errors', 'csp-reports', 'passkey-reset', 'passkeys', 'revoke-sessions', 'admins', 'notify-test', 'staff-security'];
    for (const d of dirs) if (!ownerOnly.includes(d)) expect(groupOf(`/api/admin/${d}`), d).not.toBe('owner');
  });
  it('the owner can do everything; others only their areas', () => {
    for (const g of ['kyc', 'finance', 'content', 'owner', 'kycAdmin'] as const) expect(can('owner', g, 'DELETE')).toBe(true);
    expect(can('compliance', 'kyc', 'PATCH')).toBe(true);
    expect(can('compliance', 'kycAdmin', 'PUT')).toBe(true);
    expect(can('compliance', 'finance', 'GET')).toBe(false);
    expect(can('reviewer', 'kyc', 'GET')).toBe(true);
    expect(can('reviewer', 'kyc', 'PATCH')).toBe(true); // only ever a recommendation, see kyc-four-eyes
    expect(can('reviewer', 'kycAdmin', 'GET')).toBe(false);
    expect(can('finance', 'finance', 'POST')).toBe(true);
    expect(can('finance', 'kyc', 'GET')).toBe(false);
    expect(can('content', 'content', 'PUT')).toBe(true);
    expect(can('content', 'finance', 'GET')).toBe(false);
  });
  it('a viewer can only read, and nobody but the owner reaches owner-only areas', () => {
    expect(can('viewer', 'content', 'GET')).toBe(true);
    for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) expect(can('viewer', 'content', m)).toBe(false);
    for (const r of STAFF_ROLES) expect(can(r, 'owner', 'GET')).toBe(false);
    for (const r of ROLES) expect(can(r, 'session', 'GET')).toBe(true);
  });
  it('the owner sees the Admins tab and nobody else does', () => {
    expect(TAB_ACCESS.owner).toContain('admins');
    for (const r of STAFF_ROLES) expect(TAB_ACCESS[r]).not.toContain('admins');
    expect(isRole('owner')).toBe(true);
    expect(isRole('root')).toBe(false);
  });
});

describe('PINs and names', () => {
  it('hashes with a salt and verifies, rejecting a wrong PIN or a malformed hash', () => {
    const h = hashPin('Correct-horse-9');
    expect(h).not.toContain('Correct');
    expect(hashPin('Correct-horse-9')).not.toBe(h);
    expect(verifyPin('Correct-horse-9', h)).toBe(true);
    expect(verifyPin('Correct-horse-8', h)).toBe(false);
    expect(verifyPin('x', 'garbage')).toBe(false);
    expect(verifyPin('x', undefined)).toBe(false);
  });
  it('generated PINs are strong and different; weak ones are refused', () => {
    const a = generatePin(), b = generatePin();
    expect(a).not.toBe(b);
    expect(isStrongStaffPin(a)).toBe(true);
    expect(isStrongStaffPin('12345678')).toBe(false);
    expect(isStrongStaffPin('abcdefghijk')).toBe(false);
    expect(isStrongStaffPin('short1A')).toBe(false);
  });
  it('login names are short lower-case words', () => {
    expect(cleanUsername(' Sara.M ')).toBe('sara.m');
    for (const bad of ['ab', 'a b c', '../x', 'x'.repeat(30), 5, null]) expect(cleanUsername(bad)).toBe('');
  });
});

describe('session identity', () => {
  process.env.ADMIN_SESSION_SECRET = 'x'.repeat(48);
  it('the PIN login (no identity) is the owner; a staff token carries its name and role', async () => {
    const owner = await createAdminToken();
    expect(await verifyAdminToken(owner)).toBe(true);
    expect(adminTokenIdentity(owner)).toEqual({ sub: 'owner', role: 'owner' });
    const staff = await createAdminToken({ sub: 'sara', role: 'finance', name: 'Sara' });
    expect(await verifyAdminToken(staff)).toBe(true);
    expect(adminTokenIdentity(staff)).toEqual({ sub: 'sara', role: 'finance', name: 'Sara' });
    expect(adminTokenIdentity('garbage')).toEqual({ sub: 'owner', role: 'owner' }); // only reached after the signature check
  });
  it('a tampered token does not verify', async () => {
    const staff = (await createAdminToken({ sub: 'sara', role: 'viewer' }))!;
    const [p, s] = staff.split('.');
    const forged = Buffer.from(JSON.stringify({ v: 1, iat: 1, exp: 9999999999, sub: 'sara', role: 'owner' })).toString('base64url');
    expect(await verifyAdminToken(`${forged}.${s}`)).toBe(false);
    expect(p.length).toBeGreaterThan(10);
  });
});

describe('activity report', () => {
  const T = 1_700_000_000_000;
  const rows = [
    { action: 'admin.write', detail: { actor: 'sara', name: 'Sara', role: 'finance', group: 'finance' }, atMs: T },
    { action: 'admin.write', detail: { actor: 'sara', name: 'Sara', role: 'finance', group: 'finance' }, atMs: T + 5 },
    { action: 'admin.write', detail: { actor: 'omar', name: 'Omar', role: 'compliance', group: 'kyc' }, atMs: T + 9 },
    { action: 'admin.login', detail: { actor: 'sara', role: 'finance' }, atMs: T - 50 },
    { action: 'admin.login.suspended', detail: { actor: 'omar' }, atMs: T + 20 },
    { action: 'kyc.purge', detail: { uid: 'u' }, atMs: T },
  ];
  it('counts changes, sign-ins, areas and last activity per admin, busiest first', () => {
    const s = summarizeActivity(rows);
    expect(s.map((x) => x.actor)).toEqual(['sara', 'omar']);
    expect(s[0]).toMatchObject({ writes: 2, logins: 1, byGroup: { finance: 2 }, lastAtMs: T + 5, name: 'Sara' });
    expect(s[1]).toMatchObject({ writes: 1, failedLogins: 1, byGroup: { kyc: 1 } });
  });
  it('builds an e-mail only when somebody did something, and escapes names', () => {
    expect(buildAdminReportHtml([], 24, 'https://x')).toBeNull();
    const m = buildAdminReportHtml(summarizeActivity([{ action: 'admin.write', detail: { actor: 'a', name: '<b>x</b>', role: 'content', group: 'content' }, atMs: T }]), 24, 'https://x/admin')!;
    expect(m.html).not.toContain('<b>x</b>');
    expect(m.html).toContain('&lt;b&gt;');
    expect(m.subject).toContain('1 أدمن');
  });
});

describe('wiring', () => {
  it('the guard rechecks a staff account on every request: active, not revoked, role allows the request, then logs every write by name', () => {
    const g = src('lib/admin-guard.ts');
    expect(g).toContain('adminStatus(');
    expect(g).toContain('st.active');
    expect(g).toContain('iat <= st.revokedAt');
    expect(g).toContain('can(who.role, groupOf(p)');
    expect(g).toContain("'admin.write'");
  });
  it('suspending, changing a role and resetting a PIN cut the account\'s sessions at once', () => {
    const a = src('lib/admin-accounts.ts');
    expect((a.match(/revokedAt: Math\.floor\(Date\.now\(\) \/ 1000\)/g) ?? []).length).toBe(4);
    expect(a).toContain("status: 'suspended'");
    expect(a).toContain('forget(id)');
  });
  it('the staff login answers the same for a wrong name, a wrong PIN and a suspended account, and alerts the owner on a suspended attempt', () => {
    const r = src('app/api/admin-auth/staff/route.ts');
    expect(r).toContain('loginGate(');
    expect(r).toContain('registerFailure(');
    expect(r).toContain("{ ok: false }, { status: 401 }");
    expect(r).toContain('admin.login.suspended');
    expect(src('lib/admin-accounts.ts')).toContain('verifyPin(pin, d?.pinHash)');
  });
  it('the accounts route is owner-only by area, and the panel can suspend, resume, change role, reset PIN and delete', () => {
    expect(groupOf('/api/admin/admins')).toBe('owner');
    const p = src('components/admin/admins-panel.tsx');
    for (const s of ["action: 'suspend'", "action: 'resume'", "action: 'role'", "action: 'resetPin'", "'DELETE'"]) expect(p).toContain(s);
  });
  it('the daily job e-mails each staff admin\'s activity to the owner', () => {
    const c = src('app/api/cron/daily-digest/route.ts');
    expect(c).toContain('activityReport(24)');
    expect(c).toContain("s.actor !== 'owner'");
  });
  it('a signed-in staff admin denied by role is not logged out', () => {
    expect(src('components/admin/admin-ui.tsx')).toContain("fetch('/api/admin-auth'");
  });
});
