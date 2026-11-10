import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { cardParty, parseNameMode, referralCodeOf } from '@/lib/contract-identity';
import { generateContractText } from '@/lib/contract-signing';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Flat', buyerUsername: 'web_abc', sellerUsername: 'RE-Global-Platform', type: 'buy', amount: 10, currency: 'EGP', paymentId: 'o1', txid: '' };
const src = (p: string) => readFileSync(p, 'utf8');

describe('how a card buyer is named in a contract', () => {
  it('alias is the default and any odd value falls back to it', () => {
    expect(parseNameMode(undefined)).toBe('alias');
    expect(parseNameMode('x')).toBe('alias');
    expect(parseNameMode('real')).toBe('real');
  });
  it('alias shows the account name and invite code and never the legal name', () => {
    const t = generateContractText({ ...base, card: { orderId: 'o1', buyerName: 'Ahmed Mohamed Ali', nameMode: 'alias', inviteCode: 'AB12CD34' } });
    expect(t).toContain('@web_abc (personal invite code AB12CD34)');
    expect(t).not.toContain('Ahmed');
  });
  it('real shows the legal name, and no mode keeps the old wording exactly', () => {
    expect(cardParty('web_abc', { buyerName: 'Ahmed Mohamed Ali', nameMode: 'real' })).toContain('name on record: Ahmed Mohamed Ali');
    expect(cardParty('web_abc', { buyerName: 'A B' })).toBe(cardParty('web_abc', { buyerName: 'A B', nameMode: 'real' }));
  });
  it('the invite code is the same formula the referral page uses (stable, 8 characters at most)', () => {
    expect(referralCodeOf('web_abc')).toBe(referralCodeOf('web_abc'));
    expect(referralCodeOf('web_abc').length).toBeLessThanOrEqual(8);
    expect(src('lib/referrals.ts')).toContain('referralCodeOf');
  });
  it('the card contract reads the choice, defaults to alias, and saves the invite code so it can be used', () => {
    const s = src('lib/card-contract.ts');
    expect(s).toContain("parseNameMode(kyc.data()?.contractName)");
    expect(s).toMatch(/nameMode === 'alias' \? await inviteCodeOf/);
    expect(s).toContain("{ username, uid, code");
  });
  it('the choice is saved by the server only, for the signed-in person only', () => {
    const r = src('app/api/kyc/contract-name/route.ts');
    expect(r).toContain('guardApi');
    expect(r).toContain('user.uid');
    expect(src('app/api/kyc/request/route.ts')).toContain('setContractName(user.uid');
    expect(src('app/kyc/page.tsx')).toContain('/api/kyc/contract-name');
  });
});
