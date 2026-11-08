import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildKycMail, pickMailLang, isMailLang } from '@/lib/kyc-mail';

const src = (p: string) => readFileSync(p, 'utf8');

describe('kyc decision mail', () => {
  it('picks the first supported language, else English', () => {
    expect(pickMailLang('ar-EG,ar;q=0.9,en;q=0.8')).toBe('ar');
    expect(pickMailLang('de-DE,fr;q=0.8')).toBe('fr');
    expect(pickMailLang('de')).toBe('en');
    expect(pickMailLang(null)).toBe('en');
    expect(isMailLang('xx')).toBe(false);
  });
  it('approved and rejected mails differ per language and carry the reason', () => {
    const a = buildKycMail('approved', '', 'ar', 'https://x.test/');
    const r = buildKycMail('rejected', 'Blurry photo', 'en', 'https://x.test');
    expect(a.subject).not.toBe(buildKycMail('approved', '', 'en', 'https://x.test').subject);
    expect(a.html).toContain('dir="rtl"');
    expect(r.html).toContain('Blurry photo');
    expect(r.html).toContain('https://x.test/kyc');
  });
  it('escapes a hostile reason', () => {
    const r = buildKycMail('rejected', '<script>alert(1)</script>', 'en', 'https://x.test');
    expect(r.html).not.toContain('<script>');
  });
  it('wiring: decision sends the mail, header shows the verified badge', () => {
    expect(src('lib/kyc-decision.ts')).toContain('notifyKycDecision');
    expect(src('lib/kyc-notify.ts')).toContain('emailVerified');
    expect(src('components/header.tsx')).toContain("kl('verifiedBadge'");
    expect(src('app/api/kyc/request/route.ts')).toContain('accept-language');
  });
});
