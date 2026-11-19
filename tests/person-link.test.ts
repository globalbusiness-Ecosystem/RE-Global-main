import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LINKED_I18N } from '@/lib/linked-accounts-i18n';
import { MAX_LINKED_ACCOUNTS, accountKind, afterUnlink, linkCodeExpired, mergeAccounts, parseLinkCode, primaryOf, randomLinkCode } from '@/lib/person-link';

const src = (p: string) => readFileSync(p, 'utf8');
const A = { uid: 'web_a', username: 'a' };
const B = { uid: 'p1', username: 'b' };
const C = { uid: 'p2', username: 'c' };

describe('link codes', () => {
  it('make valid codes and tidy what people type', () => {
    const c = randomLinkCode(Math.random);
    expect(parseLinkCode(c)).toBe(c);
    expect(parseLinkCode(` ${c.slice(0, 4).toLowerCase()}-${c.slice(4).toLowerCase()} `)).toBe(c);
    expect(parseLinkCode('abc')).toBeNull();
    expect(parseLinkCode('0000OOOO')).toBeNull();
    expect(parseLinkCode(42)).toBeNull();
  });
  it('expire', () => {
    expect(linkCodeExpired(1000, 2000)).toBe(true);
    expect(linkCodeExpired(3000, 2000)).toBe(false);
    expect(linkCodeExpired(NaN, 2000)).toBe(true);
  });
});

describe('accounts of one person', () => {
  it('tells web accounts from Pi accounts', () => {
    expect(accountKind('web_x')).toBe('web');
    expect(accountKind('abc')).toBe('pi');
  });
  it('merges without repeats and stops at the limit', () => {
    expect(mergeAccounts([A], [A, B])).toEqual([A, B]);
    const many = Array.from({ length: MAX_LINKED_ACCOUNTS }, (_, i) => ({ uid: 'u' + i, username: 'n' + i }));
    expect(mergeAccounts(many, [C])).toBeNull();
  });
  it('picks the primary and moves it when it leaves', () => {
    expect(primaryOf([A, B], 'p1')).toEqual(B);
    expect(primaryOf([A, B], null)).toEqual(A);
    expect(afterUnlink([A, B, C], 'web_a', 'web_a')).toEqual({ accounts: [B, C], primaryUid: 'p1' });
    expect(afterUnlink([A, B], 'web_a', 'p1')).toEqual({ accounts: [], primaryUid: null });
  });
});

describe('wiring', () => {
  it('routes are guarded', () => {
    for (const f of ['app/api/identity/route.ts', 'app/api/identity/link/route.ts', 'app/api/identity/link-code/route.ts']) expect(src(f)).toContain('guardApi');
  });
  it('rewards add up all linked accounts, invites use the primary code, redeem blocks self-invites across accounts', () => {
    expect(src('lib/rewards-server.ts')).toContain('personAccounts');
    expect(src('lib/invite-store.ts')).toContain('primaryOf');
    const r = src('lib/referrals-server.ts');
    expect(r).toContain('personAccounts');
    expect(r).toContain("names.includes(ownerName)");
  });
  it('the invite path /r/CODE redirects to the app', () => {
    const s = src('app/r/[code]/route.ts');
    expect(s).toContain('parseRefCode');
    expect(s).toContain("searchParams.set('ref'");
  });
  it('settings shows the linked accounts card', () => {
    expect(src('components/pages/settings-page.tsx')).toContain('<LinkedAccounts language={language} />');
  });
  it('has all 7 languages with the same keys', () => {
    const keys = Object.keys(LINKED_I18N.en).sort();
    for (const l of ['ar', 'fr', 'es', 'pt', 'ur', 'zh']) expect(Object.keys(LINKED_I18N[l]).sort()).toEqual(keys);
  });
});
