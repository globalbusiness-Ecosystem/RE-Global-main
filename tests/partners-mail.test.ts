import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildPartnerMail, PARTNER_MAIL_KINDS, isPartnerMailKind } from '@/lib/partners-mail';

const src = (p: string) => readFileSync(p, 'utf8');
const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('partner mails', () => {
  it('every kind exists in all seven languages with its own subject and text', () => {
    for (const k of PARTNER_MAIL_KINDS) {
      const seen = new Set<string>();
      for (const l of LANGS) {
        const m = buildPartnerMail(k, { amount: '10 EGP' }, l, 'https://x.test');
        expect(m.subject.trim(), `${k}.${l}`).toBeTruthy();
        expect(m.html, `${k}.${l}`).toContain('https://x.test');
        seen.add(m.subject);
      }
      expect(seen.size, k).toBe(7);
    }
  });
  it('Arabic and Urdu mails read right to left', () => {
    expect(buildPartnerMail('approved', {}, 'ar', 'https://x.test').html).toContain('dir="rtl"');
    expect(buildPartnerMail('approved', {}, 'ur', 'https://x.test').html).toContain('dir="rtl"');
    expect(buildPartnerMail('approved', {}, 'en', 'https://x.test').html).toContain('dir="ltr"');
  });
  it('a rejection carries the team note, a paid mail carries the amount', () => {
    expect(buildPartnerMail('rejected', { note: 'Missing license' }, 'en', 'https://x.test').html).toContain('Missing license');
    const paid = buildPartnerMail('paid', { amount: '250 EGP' }, 'fr', 'https://x.test').html;
    expect(paid).toContain('250 EGP');
    expect(paid).not.toContain('{amount}');
  });
  it('escapes a hostile note and caps its length', () => {
    const m = buildPartnerMail('rejected', { note: '<script>alert(1)</script>' + 'x'.repeat(1000) }, 'en', 'https://x.test');
    expect(m.html).not.toContain('<script>');
    expect(m.html.length).toBeLessThan(1500);
  });
  it('knows its own kinds', () => {
    expect(isPartnerMailKind('paid')).toBe(true);
    expect(isPartnerMailKind('nope')).toBe(false);
  });
});

describe('wiring', () => {
  it('only a verified e-mail of a web sign-in is mailed, and a failure never breaks the decision', () => {
    const s = src('lib/partners-notify.ts');
    expect(s).toContain("startsWith('web_')");
    expect(s).toContain('emailVerified');
    expect(s).toContain('catch (err)');
  });
  it('each admin decision and each paid commission sends the mail, and says so to the admin', () => {
    const a = src('app/api/admin/partners/route.ts');
    expect(a).toContain('notifyPartner(username, MAIL[body.action]');
    expect(a).toContain('mailed');
    const c = src('app/api/admin/partner-commissions/route.ts');
    expect(c).toContain("notifyPartner(String(d.partner), 'paid'");
    expect(src('components/admin/partner-applications-panel.tsx')).toContain('mailed');
    expect(src('components/admin/partner-commissions-panel.tsx')).toContain('mailed');
  });
  it('the application stores the language of the applicant and alerts the owner', () => {
    const s = src('app/api/partners/apply/route.ts');
    expect(s).toContain("pickMailLang(req.headers.get('accept-language'))");
    expect(s).toContain('notifyAdminNewApplication');
    expect(src('lib/partners-server.ts')).toContain('username, uid, lang,');
  });
  it('the owner alert is throttled and escapes what applicants typed', () => {
    const s = src('lib/partners-notify.ts');
    expect(s).toContain('consumeRateLimit');
    expect(s).toContain('escapeHtml(a.company)');
  });
});
