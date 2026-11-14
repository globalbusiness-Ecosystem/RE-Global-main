import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PARTNER_TEXT, pt, countryName, FIELD_ERROR } from '@/lib/partners-i18n';
import { parseRefCode, inviteLink } from '@/lib/ref-code';
import { ROLE_META } from '@/components/partners/partner-types';
import { PARTNER_ROLES } from '@/lib/partners';

const src = (p: string) => readFileSync(p, 'utf8');
const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('partner texts', () => {
  it('every text exists in all seven languages', () => {
    for (const [key, row] of Object.entries(PARTNER_TEXT)) for (const l of LANGS) expect((row as Record<string, string>)[l]?.trim(), `${key}.${l}`).toBeTruthy();
  });
  it('falls back to English for an unknown language', () => {
    expect(pt('submit', 'xx')).toBe('Send application');
    expect(pt('submit', 'ar')).not.toBe(pt('submit', 'en'));
  });
  it('every role has a name, a pitch and an icon, and every server error field has a message', () => {
    for (const r of PARTNER_ROLES) { expect(ROLE_META[r].icon).toBeTruthy(); expect(PARTNER_TEXT[ROLE_META[r].name]).toBeTruthy(); expect(PARTNER_TEXT[ROLE_META[r].pitch]).toBeTruthy(); }
    for (const f of ['role', 'company', 'country', 'phone', 'about', 'website']) expect(PARTNER_TEXT[FIELD_ERROR[f]]).toBeTruthy();
  });
  it('country names: Arabic in Arabic, English elsewhere, the code when unknown', () => {
    expect(countryName('EG', 'ar')).toBe('مصر');
    expect(countryName('EG', 'fr')).toBe('Egypt');
    expect(countryName('ZZ', 'en')).toBe('ZZ');
  });
});

describe('invite links', () => {
  it('keeps only a plausible code, in capitals', () => {
    expect(parseRefCode(' abc123xy ')).toBe('ABC123XY');
    for (const bad of ['', 'abc', 'a b c d', '<script>', 'x'.repeat(13), null, undefined, 5]) expect(parseRefCode(bad as any)).toBeNull();
  });
  it('builds the link from the site address', () => {
    expect(inviteLink('https://re.example/', 'AB12CD34')).toBe('https://re.example/?ref=AB12CD34');
  });
});

describe('wiring', () => {
  it('the page shows the hub and keeps the logos the team added', () => {
    const s = src('components/pages/partners-page.tsx');
    expect(s).toContain('<PartnerHub');
    expect(s).toContain("useSiteContent<any>('partners')");
  });
  it('the hub reads /api/partners/me and the form posts to /api/partners/apply with the sign-in token', () => {
    expect(src('components/partners/partner-hub.tsx')).toContain('/api/partners/me');
    const f = src('components/partners/partner-apply-form.tsx');
    expect(f).toContain('/api/partners/apply');
    expect(f).toContain('Authorization');
  });
  it('every form field has a label for screen readers', () => {
    const f = src('components/partners/partner-apply-form.tsx');
    const fields = (f.match(/<(input|select|textarea)\b/g) ?? []).length;
    expect((f.match(/aria-label=/g) ?? []).length).toBeGreaterThanOrEqual(fields);
  });
  it('the public directory only links out safely', () => {
    expect(src('components/partners/partner-directory.tsx')).toContain('noopener noreferrer nofollow');
  });
  it('the invite code is captured app-wide and redeemed after sign-in', () => {
    expect(src('components/app-wrapper.tsx')).toContain('<RefCapture />');
    const s = src('components/ref-capture.tsx');
    expect(s).toContain('/api/referrals/redeem');
    expect(s).toContain('parseRefCode');
  });
  it('no hard-coded dark colours on the partner screens', () => {
    for (const f of ['partner-hub', 'partner-apply-form', 'partner-dashboard', 'partner-directory']) expect(src(`components/partners/${f}.tsx`), f).not.toMatch(/bg-(black|gray-[0-9]|slate-[0-9])|text-gray-[0-9]/);
    expect(src('components/pages/partners-page.tsx')).not.toMatch(/bg-(black|gray-[0-9])|text-gray-[0-9]/);
  });
});
