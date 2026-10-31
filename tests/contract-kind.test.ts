import { describe, it, expect } from 'vitest';
import { contractKind, CONTRACT_KINDS, KIND_LABELS, KIND_ICON, KIND_STYLE, KIND_TITLE, KIND_PARTY } from '@/lib/contract-kind';
import { generateContractText } from '@/lib/contract-signing';
import { SEO_LANGS } from '@/lib/seo-i18n';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Nile Suite', buyerUsername: 'ann', sellerUsername: 'RE', amount: 10, currency: 'Pi', paymentId: 'pay', txid: 'tx' };
const text = (extra: object) => generateContractText({ ...base, type: 'buy', ...extra });

describe('contractKind', () => {
  it('a plain purchase is a sale', () => {
    expect(contractKind({ type: 'buy', contractText: text({}) })).toBe('sale');
    expect(contractKind({ type: 'buy' })).toBe('sale');
  });
  it('a dated stay signed as "buy" (how hotels are stored) is a hotel stay', () => {
    expect(contractKind({ type: 'buy', contractText: text({ booking: { start: '2026-11-01', end: '2026-11-02', nights: 1 } }) })).toBe('hotel');
  });
  it('a rent stays a rent, with or without dates', () => {
    expect(contractKind({ type: 'rent', contractText: text({ type: 'rent', booking: { start: '2026-11-01', end: '2026-11-08', nights: 7 } }) })).toBe('rent');
    expect(contractKind({ type: 'rent' })).toBe('rent');
  });
  it('invest and tokenized are investments, and so is any purchase of shares', () => {
    expect(contractKind({ type: 'invest' })).toBe('invest');
    expect(contractKind({ type: 'tokenized' })).toBe('invest');
    expect(contractKind({ type: 'buy', contractText: text({ shares: { count: 5, totalShares: 1000 } }) })).toBe('invest');
  });
  it('is not fooled by a property called "Stay: ..." in the middle of a line', () => {
    expect(contractKind({ type: 'buy', contractText: 'Property: Hotel Stay: Deluxe (ID: 1)\nAmount: 5 Pi' })).toBe('sale');
  });
  it('has an icon, a style and a label in every language for every kind', () => {
    for (const k of CONTRACT_KINDS) {
      expect(KIND_ICON[k].length).toBeGreaterThan(0);
      expect(KIND_STYLE[k].length).toBeGreaterThan(0);
      for (const l of SEO_LANGS) expect(KIND_LABELS[l][k].length, `${l}.${k}`).toBeGreaterThan(1);
    }
  });
  it('the four kinds read differently in Arabic', () => {
    expect(new Set(CONTRACT_KINDS.map((k) => KIND_LABELS.ar[k])).size).toBe(4);
  });
  it('each kind has its own contract title and party name, so a hotel guest is not called a buyer', () => {
    expect(new Set(CONTRACT_KINDS.map((k) => KIND_TITLE[k])).size).toBe(4);
    expect(KIND_PARTY.hotel).toBe('Guest');
    expect(KIND_PARTY.rent).toBe('Tenant');
    expect(KIND_PARTY.invest).toBe('Investor');
    expect(KIND_PARTY.sale).toBe('Buyer');
  });
});
