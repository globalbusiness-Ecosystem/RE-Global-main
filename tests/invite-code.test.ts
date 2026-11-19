import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INVITE_CODE_LENGTH, inviteUrl, legacyInviteCode, piNameCode, randomInviteCode } from '@/lib/invite-code';
import { parseRefCode } from '@/lib/ref-code';

const src = (p: string) => readFileSync(p, 'utf8');

describe('invite code', () => {
  it('new codes are valid ref codes without look-alike letters', () => {
    for (let i = 0; i < 200; i++) {
      const c = randomInviteCode(Math.random);
      expect(c).toHaveLength(INVITE_CODE_LENGTH);
      expect(parseRefCode(c)).toBe(c);
      expect(c).not.toMatch(/[01IO]/);
    }
  });
  it('the legacy Pi code stays the same for an account', () => {
    expect(legacyInviteCode('Elsayed777x')).toBe(legacyInviteCode('Elsayed777x'));
    expect(legacyInviteCode('Elsayed777x')).toMatch(/^[A-Z0-9]{1,8}$/);
  });
  it('builds the share link', () => {
    expect(inviteUrl('https://a.app/', 'ABC12345')).toBe('https://a.app/r/ABC12345');
  });
});

describe('one invite network for Pi and web', () => {
  it('the store reserves codes and checks both the reservation and the field', () => {
    const s = src('lib/invite-store.ts');
    expect(s).toContain("collection(CODES)");
    expect(s).toContain("where('code', '==', candidate)");
    expect(s).toContain('runTransaction');
  });
  it('the route is guarded and the settings page uses it for every account', () => {
    expect(src('app/api/invite/route.ts')).toContain('guardApi');
    const s = src('components/pages/settings-page.tsx');
    expect(s).toContain("fetch('/api/invite'");
    expect(s).toContain('inviteUrl(window.location.origin, referralCode)');
  });
  it('redeem resolves the owner from the reserved list first; web handles reserve their code too', () => {
    expect(src('lib/referrals-server.ts')).toContain("collection('inviteCodes').doc(code)");
    expect(src('lib/handle-store.ts')).toContain("collection('inviteCodes')");
  });
});

describe('a Pi account\'s invite code is its Pi name', () => {
  it('uses capitals and digits, at most 12 characters', () => {
    expect(piNameCode('Elsayed777x')).toBe('ELSAYED777X');
    expect(piNameCode('a_b.c-d1')).toBe('ABCD1');
    expect(piNameCode('averyveryverylongpiname')).toBe('AVERYVERYVER');
    expect(piNameCode('averyveryverylongpiname')).toHaveLength(12);
  });
  it('is not made for names that are too short once cleaned', () => {
    expect(piNameCode('ab')).toBeNull();
    expect(piNameCode('_a_')).toBeNull();
  });
  it('the store tries the Pi name first for Pi accounts and keeps the old code as an alias', () => {
    const s = readFileSync('lib/invite-store.ts', 'utf8');
    expect(s).toContain("uid.startsWith('web_') ? null : piNameCode(username)");
    expect(s).toContain('alias: true');
  });
});
