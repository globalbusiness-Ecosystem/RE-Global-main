import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buyerDisplayFromText, isCardContractText } from '@/lib/contract-identity';
import { generateContractText } from '@/lib/contract-signing';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Flat', buyerUsername: 'web_abc', sellerUsername: 'RE-Global-Platform', type: 'buy', amount: 10, currency: 'EGP', paymentId: 'o1', txid: '' };
const src = (p: string) => readFileSync(p, 'utf8');

describe('what the contract page shows about the buyer', () => {
  it('reads the legal name from a real-name contract', () => {
    const t = generateContractText({ ...base, card: { orderId: 'o1', buyerName: 'Ahmed Mohamed Ali', nameMode: 'real' } });
    expect(buyerDisplayFromText(t)).toEqual({ kind: 'name', value: 'Ahmed Mohamed Ali' });
  });
  it('reads the invite code from an alias contract and never a name', () => {
    const t = generateContractText({ ...base, card: { orderId: 'o1', buyerName: 'Ahmed Mohamed Ali', nameMode: 'alias', inviteCode: 'AB12CD34' } });
    expect(buyerDisplayFromText(t)).toEqual({ kind: 'code', value: 'AB12CD34' });
  });
  it('contracts made before the choice existed (old wording) still show the name', () => {
    expect(buyerDisplayFromText("Party A (Buyer): @web_x — identity verified by the Platform's KYC/AML review (name on record: Elsayed Asaad)")).toEqual({ kind: 'name', value: 'Elsayed Asaad' });
  });
  it('shows nothing for a Pi contract or missing text', () => {
    expect(buyerDisplayFromText(generateContractText({ ...base, txid: 'abc' }))).toBeNull();
    expect(buyerDisplayFromText(undefined)).toBeNull();
  });
  it('tells a card contract from a Pi one, so the badge says the truth', () => {
    expect(isCardContractText(generateContractText({ ...base, card: { orderId: 'o1', buyerName: 'A B' } }))).toBe(true);
    expect(isCardContractText(generateContractText({ ...base, txid: 'abc' }))).toBe(false);
  });
  it('the page and the PDF both show it', () => {
    const v = src('components/contract-detail-view.tsx');
    expect(v).toContain("cv(buyer.kind === 'name' ? 'nameOnRecord' : 'inviteCode', language)");
    expect(v).toContain('Personal invite code');
    expect(v).toContain("'verifiedCard'");
  });
});
