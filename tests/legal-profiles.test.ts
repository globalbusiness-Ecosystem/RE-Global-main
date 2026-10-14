import { describe, it, expect } from 'vitest';
import { defaultProfile, mergeProfile, sanitizeLegalOverride, isCountry, COUNTRIES } from '@/lib/legal-profiles';
import { generateContractText } from '@/lib/contract-signing';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'T', buyerUsername: 'u', sellerUsername: 'RE', type: 'buy', amount: 5, currency: 'Pi', paymentId: 'pay', txid: 'tx' };

describe('legal profiles', () => {
  it('keeps the original UAE wording for AE and is generic elsewhere', () => {
    expect(defaultProfile('AE').statusLine).toContain('Federal Decree-Law No. 46/2021');
    expect(defaultProfile('EG').governingLaw).toBe('the laws of Egypt');
    expect(defaultProfile('EG').statusLine).not.toContain('UAE');
    expect(defaultProfile(undefined).governingLaw).toContain('jurisdiction where the property is located');
    expect(defaultProfile('ZZ').governingLaw).toContain('jurisdiction where the property is located');
  });
  it('merges only non-empty overrides', () => {
    const m = mergeProfile('EG', { governingLaw: 'Egyptian law', extraClause: '  ', noticeEn: 'x' });
    expect(m.governingLaw).toBe('Egyptian law');
    expect(m.noticeEn).toBe('x');
    expect(m.extraClause).toBe('');
    expect(m.statusLine).toBe(defaultProfile('EG').statusLine);
  });
  it('sanitizes admin input', () => {
    expect(sanitizeLegalOverride({ governingLaw: ' a\nb ', bogus: 'x' })).toEqual({ ok: true, override: { governingLaw: 'a b' } });
    expect(sanitizeLegalOverride({ extraClause: 'x'.repeat(1501) }).ok).toBe(false);
    expect(sanitizeLegalOverride({ noticeAr: 5 }).ok).toBe(false);
    expect(sanitizeLegalOverride(null).ok).toBe(false);
  });
  it('knows its countries', () => {
    expect(isCountry('EG')).toBe(true);
    expect(isCountry('XX')).toBe(false);
    expect(Object.keys(COUNTRIES).length).toBeGreaterThan(10);
  });
});

describe('contract text per country', () => {
  it('is unchanged without a legal profile (UAE pilot wording)', () => {
    const t = generateContractText(base);
    expect(t).toContain('Pending UAE Legal Review (Federal Decree-Law No. 46/2021)');
    expect(t).toContain('governed by the laws of the United Arab Emirates.');
    expect(t).not.toContain('Additional terms');
  });
  it('uses the country profile and its extra clause', () => {
    const p = mergeProfile('EG', { extraClause: 'Registration costs are borne by the Buyer.' });
    const t = generateContractText({ ...base, legal: { statusLine: p.statusLine, governingLaw: p.governingLaw, extraClause: p.extraClause } });
    expect(t).toContain('Pending legal review in Egypt');
    expect(t).toContain('governed by the laws of Egypt.');
    expect(t).toContain('7. Additional terms. Registration costs are borne by the Buyer.');
    expect(t).not.toContain('United Arab Emirates');
  });
});
