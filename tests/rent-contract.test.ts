import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildContractText } from '@/lib/contract-framework';
import { contractKind } from '@/lib/contract-kind';
import { LOCKED_IDS, EDITABLE_IDS, validateDraft } from '@/lib/contract-terms';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Marina Tower', buyerUsername: 'ahmed', sellerUsername: 'RE-Global-Platform', type: 'rent', amount: 300, currency: 'Pi', paymentId: 'pay1', txid: 'tx1', booking: { start: '2026-12-01', end: '2026-12-31', nights: 30 }, legal: { statusLine: 'Pending', governingLaw: 'the laws of Egypt' } };
const rent = buildContractText(base, { owner: 'Nile Ltd (company)' });
const other = {
  sale: buildContractText({ ...base, type: 'buy', booking: undefined }),
  invest: buildContractText({ ...base, type: 'invest', booking: undefined, shares: { count: 5, totalShares: 100 } }),
  hotel: buildContractText({ ...base, type: 'buy', booking: { start: '2026-12-01', end: '2026-12-04', nights: 3 } }),
};

describe('the rent contract', () => {
  it('is a rent, with the period, the whole rent paid once, and no deposit taken', () => {
    expect(contractKind({ type: 'rent', contractText: rent })).toBe('rent');
    expect(rent).toContain('Stay: 2026-12-01 to 2026-12-31 (30 nights');
    expect(rent).toContain('The whole rent for the period is paid in one payment');
    expect(rent).toContain('There are no instalments, and the Platform takes no security deposit');
    expect(rent).toContain('is outside this contract; the Platform is not a party to it and does not hold it');
  });
  it('has handover, return and early departure, in order, after the price and payment clause', () => {
    for (const s of ['Period, handover and return', 'Early departure and holding over', 'Rent and payment schedule', 'Owner of the Property']) expect(rent).toContain(`. ${s}. `);
    expect(rent.indexOf('Subject and rights')).toBeLessThan(rent.indexOf('Period, handover and return'));
    expect(rent.indexOf('Price and payment')).toBeLessThan(rent.indexOf('Rent and payment schedule'));
  });
  it('names the lessor and keeps the numbering clean', () => {
    expect(rent).toContain('(the lessor)');
    const nums = [...rent.slice(rent.indexOf('\nTERMS\n')).matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
  it('the rent clauses appear in no other kind of contract', () => {
    for (const t of Object.values(other)) {
      for (const s of ['Period, handover and return', 'Early departure and holding over', 'Rent and payment schedule']) expect(t).not.toContain(s);
    }
  });
  it('claims nothing about deposits held, escrow or guaranteed returns', () => {
    expect(rent.toLowerCase()).not.toMatch(/escrow|deposit is held|guaranteed|risk[- ]free/);
  });
});

describe('what the admin may change in a rent contract', () => {
  it('the payment schedule is locked; handover and early departure are editable', () => {
    expect(LOCKED_IDS).toContain('rent-payment');
    expect(EDITABLE_IDS).toEqual(expect.arrayContaining(['rent-period', 'rent-end']));
    expect(validateDraft({ clauses: { 'rent-payment': { text: 'The rent is paid in ten instalments over the year.' } } }).ok).toBe(false);
    expect(validateDraft({ clauses: { 'rent-period': { text: 'Check-in is from 3 pm and check-out is by 11 am on the end date.' } } }).ok).toBe(true);
  });
});

describe('the owner copy', () => {
  it('the admin can copy the public verification link of a rent contract', () => {
    const s = readFileSync('components/admin/payments-list.tsx', 'utf8');
    expect(s).toContain("c.type === 'rent'");
    expect(s).toContain("'/verify/' + c.id");
  });
});
