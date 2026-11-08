import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { needsKyc, canMoveKyc, parseKycRequest, cleanNote } from '@/lib/kyc-rules';

const src = (p: string) => readFileSync(p, 'utf8');

describe('who must verify', () => {
  it('web sign-ins must, Pi users must not', () => {
    expect(needsKyc('web_abc123')).toBe(true);
    expect(needsKyc('3f2b8c1e-aaaa-bbbb-cccc-123456789012')).toBe(false);
    expect(needsKyc('')).toBe(false);
    expect(needsKyc(undefined as never)).toBe(false);
  });
});

describe('status moves', () => {
  it('only forward through review, and a rejected person can ask again', () => {
    expect(canMoveKyc('none', 'pending')).toBe(true);
    expect(canMoveKyc('rejected', 'pending')).toBe(true);
    expect(canMoveKyc('pending', 'pending')).toBe(false);
    expect(canMoveKyc('approved', 'pending')).toBe(false);
    expect(canMoveKyc('pending', 'approved')).toBe(true);
    expect(canMoveKyc('pending', 'rejected')).toBe(true);
    expect(canMoveKyc('approved', 'rejected')).toBe(true); // the team can withdraw an approval
    expect(canMoveKyc('none', 'approved')).toBe(false);
    expect(canMoveKyc('rejected', 'approved')).toBe(false);
  });
});

describe('verification request', () => {
  const good = { legalName: 'Ahmed Mohamed Ali', country: 'eg', phone: '+20 100 123 4567', docType: 'id' };
  it('accepts a full legal name, a known country and a phone number', () => {
    expect(parseKycRequest(good)).toEqual({ legalName: 'Ahmed Mohamed Ali', country: 'EG', phone: '+20 100 123 4567', docType: 'id' });
    expect(parseKycRequest({ ...good, legalName: 'أحمد محمد علي' })).not.toBeNull();
  });
  it('refuses a one-word name, digits, odd country or phone, and non-objects', () => {
    for (const bad of [{ ...good, legalName: 'Ahmed' }, { ...good, legalName: 'A1 B2 C3' }, { ...good, legalName: '<b>x</b> y z' }, { ...good, country: 'XX' }, { ...good, country: '__proto__' }, { ...good, phone: 'abc' }, { ...good, phone: '1' }, { ...good, docType: 'selfie' }, { ...good, docType: undefined }, null, 'x', 5, {}]) {
      expect(parseKycRequest(bad)).toBeNull();
    }
  });
  it('cleans notes', () => {
    expect(cleanNote('  a\n\nb  ')).toBe('a b');
    expect(cleanNote(5)).toBe('');
    expect(cleanNote('x'.repeat(500)).length).toBe(300);
  });
});

describe('wiring', () => {
  it('card checkout refuses unverified web users before doing anything else, and fails closed', () => {
    const s = src('app/api/card/checkout/route.ts');
    expect(s).toContain("code: 'kyc_required'");
    expect(s).toContain("k.status !== 'approved'");
    expect(s.indexOf('needsKyc(user.uid)')).toBeLessThan(s.indexOf('createOrder('));
    expect(s.indexOf('needsKyc(user.uid)')).toBeLessThan(s.indexOf('reserveForPayment('));
  });
  it('requests are rate limited and only for web users; the admin routes are admin only', () => {
    expect(src('app/api/kyc/request/route.ts')).toContain("guardApi(req, { scope: 'kyc-request', limit: 5");
    expect(src('app/api/kyc/request/route.ts')).toContain('needsKyc(user.uid)');
    const a = src('app/api/admin/kyc/route.ts');
    expect(a.match(/isAdminRequest\(req\)/g)?.length).toBe(2);
    expect(a).toContain("logAdmin(`kyc.${decision}`");
    expect(a).toContain("uid.startsWith('web_')");
  });
  it('a rejection needs a reason', () => {
    expect(src('app/api/admin/kyc/route.ts')).toContain("decision === 'rejected' && !reason");
  });
});
