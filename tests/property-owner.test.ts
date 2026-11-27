import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseOwner, ownerLine, parseStoredOwner } from '@/lib/property-owner';
import { buildContractText, buildResaleContractText } from '@/lib/contract-framework';
import { buyerDisplayFromText } from '@/lib/contract-identity';
import { contractKind } from '@/lib/contract-kind';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Marina Tower', buyerUsername: 'ahmed', sellerUsername: 'RE-Global-Platform', type: 'buy', amount: 100, currency: 'Pi', paymentId: 'pay1', txid: 'tx1', legal: { statusLine: 'Pending', governingLaw: 'the laws of Egypt' } };

describe('owner input', () => {
  it('accepts a company and a person, and cleans the text', () => {
    expect(parseOwner({ kind: 'company', name: '  Nile   Real Estate\nLtd ', registrationNo: 'CR 123-456/7' })).toEqual({ ok: true, owner: { kind: 'company', name: 'Nile Real Estate Ltd', registrationNo: 'CR 123-456/7' } });
    expect(parseOwner({ kind: 'individual', name: 'Ali Hassan' })).toEqual({ ok: true, owner: { kind: 'individual', name: 'Ali Hassan' } });
  });
  it('an empty name or null means no owner', () => {
    expect(parseOwner({ kind: 'company', name: '  ' })).toEqual({ ok: true, owner: null });
    expect(parseOwner(null)).toEqual({ ok: true, owner: null });
  });
  it('refuses a bad type, a one letter name and odd registration characters', () => {
    expect(parseOwner({ kind: 'other', name: 'Ali Hassan' }).ok).toBe(false);
    expect(parseOwner({ kind: 'company', name: 'A' }).ok).toBe(false);
    expect(parseOwner({ kind: 'company', name: 'Nile Ltd', registrationNo: '12<script>' }).ok).toBe(false);
    expect(parseOwner('x').ok).toBe(false);
  });
  it('braces and long values are removed or cut', () => {
    const r = parseOwner({ kind: 'company', name: 'Nile {{x}} Ltd' });
    expect(r.ok && r.owner?.name).toBe('Nile x Ltd');
    const long = parseOwner({ kind: 'company', name: 'N'.repeat(300) });
    expect(long.ok && long.owner?.name.length).toBe(120);
  });
});

describe('the masked line', () => {
  it('a company keeps its name and shows the last 4 of the registration number', () => {
    expect(ownerLine({ kind: 'company', name: 'Nile Real Estate Ltd', registrationNo: 'CR1234567' })).toBe('Nile Real Estate Ltd (company, registration no. ***4567)');
    expect(ownerLine({ kind: 'company', name: 'Nile Ltd' })).toBe('Nile Ltd (company)');
  });
  it('a person shows initials only, and the ID by its last 4', () => {
    const l = ownerLine({ kind: 'individual', name: 'Ali Hassan Mahmoud', registrationNo: '29901011234567' });
    expect(l).toBe('A*** H*** M*** (individual, ID ***4567)');
    expect(l).not.toMatch(/Ali|Hassan|Mahmoud|2990101/);
  });
  it('Arabic names are masked too', () => {
    expect(ownerLine({ kind: 'individual', name: 'علي حسن' })).toBe('ع*** ح*** (individual)');
  });
  it('a stored record that is invalid is ignored', () => {
    expect(parseStoredOwner({ kind: 'x', name: 'Ali Hassan' })).toBeUndefined();
    expect(parseStoredOwner(undefined)).toBeUndefined();
  });
});

describe('the Owner clause in a contract', () => {
  const line = ownerLine({ kind: 'company', name: 'Nile Real Estate Ltd', registrationNo: 'CR1234567' });
  it('is printed with the masked line, and not at all when no owner is recorded', () => {
    const t = buildContractText(base, { owner: line });
    expect(t).toMatch(/\d+\. Owner of the Property\. The Listing records the owner of the Property as Nile Real Estate Ltd \(company, registration no\. \*\*\*4567\)\./);
    expect(t).toContain('is not a signatory to this contract');
    expect(buildContractText(base)).not.toContain('Owner of the Property');
  });
  it('names the lessor in a rent contract only', () => {
    const rent = buildContractText({ ...base, type: 'rent', booking: { start: '2026-12-01', end: '2026-12-31', nights: 30 } }, { owner: line });
    expect(rent).toContain('(the lessor)');
    expect(buildContractText(base, { owner: line })).not.toContain('(the lessor)');
  });
  it('comes after the subject and keeps the numbering and the parsers', () => {
    const t = buildContractText({ ...base, type: 'invest', shares: { count: 5, totalShares: 100 } }, { owner: line });
    expect(t.indexOf('Subject and rights')).toBeLessThan(t.indexOf('Owner of the Property'));
    expect(t.indexOf('Owner of the Property')).toBeLessThan(t.indexOf('Price and payment'));
    const nums = [...t.slice(t.indexOf('\nTERMS\n')).matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(nums).toEqual(nums.map((_, i) => i + 1));
    expect(contractKind({ type: 'invest', contractText: t })).toBe('invest');
    expect(buyerDisplayFromText(t)).toBe(buyerDisplayFromText(buildContractText({ ...base, type: 'invest', shares: { count: 5, totalShares: 100 } })));
  });
  it('is in a resale contract too', () => {
    const r = buildResaleContractText({ contractId: 'r1', propertyId: 'p1', propertyTitle: 'T', sellerUsername: 's', buyerUsername: 'b', shares: 1, totalShares: 10, pricePerShare: 5, amount: 5, fee: 0.1, proceeds: 4.9, currency: 'Pi', paymentId: 'p', txid: 't', legal: { statusLine: 'x', governingLaw: 'the laws of Egypt' } }, { owner: line });
    expect(r).toContain('Owner of the Property');
  });
  it('the contract never carries the personal details', () => {
    const t = buildContractText(base, { owner: ownerLine({ kind: 'individual', name: 'Ali Hassan', registrationNo: '29901011234567' }) });
    expect(t).not.toMatch(/Ali|Hassan|29901011234567/);
  });
});

describe('wiring and privacy', () => {
  const read = (p: string) => readFileSync(p, 'utf8');
  it('every place that writes a contract loads the owner line and passes it in', () => {
    for (const f of ['app/api/contracts/sign/route.ts', 'lib/card-contract.ts', 'lib/resale-contract.ts']) {
      const s = read(f);
      expect(s, f).toContain('getOwnerLine');
      expect(s, f).toContain('owner: ownerLine');
    }
  });
  it('the owner is stored apart from the public catalogue, and the log never keeps the name', () => {
    const s = read('app/api/admin/property-owner/route.ts');
    expect(s).toContain('isAdminRequest');
    expect(s).toContain("collection('property_owners')");
    expect(s).toContain("logAdmin('property.owner', { id: body.id, removed: !parsed.owner })");
    expect(read('lib/admin-property.ts')).not.toMatch(/owner/i);
  });
});
