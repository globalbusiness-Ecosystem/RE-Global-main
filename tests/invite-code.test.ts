import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INVITE_CODE_LENGTH, inviteUrl, legacyInviteCode, randomInviteCode } from '@/lib/invite-code';
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
