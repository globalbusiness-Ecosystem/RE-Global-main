import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { idLast4, newSalt, commitmentOf, proofOf, proofText, proofFromText, matchesCommitment } from '@/lib/contract-privacy';
import { cardParty, piParty, buyerDisplayFromText } from '@/lib/contract-identity';
import { generateContractText, hashContract } from '@/lib/contract-signing';

const src = (p: string) => readFileSync(p, 'utf8');
const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Villa', buyerUsername: 'ali', sellerUsername: 'RE-Global-Platform', type: 'buy', amount: 100, currency: 'Pi', paymentId: 'pay1', txid: 'abc' };
const ID = '2900101 123 4567', NAME = 'Ahmed Mohamed Ali', PHONE = '+201001234567';

describe('masking and commitment', () => {
  it('keeps only the last 4 characters, ignoring spaces and dashes', () => {
    expect(idLast4('29001011234567')).toBe('4567');
    expect(idLast4('A-123 456')).toBe('3456');
    expect(idLast4('1234')).toBe('');
  });
  it('is deterministic for the same salt and different for another salt or ID', () => {
    const s = newSalt();
    expect(s).toMatch(/^[a-f0-9]{32}$/);
    expect(commitmentOf(s, NAME, ID)).toBe(commitmentOf(s, NAME, '29001011234567'));
    expect(commitmentOf(s, NAME, ID)).not.toBe(commitmentOf(newSalt(), NAME, ID));
    expect(commitmentOf(s, NAME, ID)).not.toBe(commitmentOf(s, NAME, '29001011234568'));
  });
  it('proves a match with the real details and rejects wrong ones', () => {
    const s = newSalt(), p = proofOf(s, NAME, ID)!;
    expect(matchesCommitment(p, s, NAME, ID)).toBe(true);
    expect(matchesCommitment(p, s, 'Someone Else', ID)).toBe(false);
    expect(matchesCommitment(p, s, NAME, '29001011230000')).toBe(false);
    expect(matchesCommitment(null, s, NAME, ID)).toBe(false);
  });
  it('gives no proof without a usable ID or name', () => {
    expect(proofOf(newSalt(), NAME, '12')).toBeNull();
    expect(proofOf(newSalt(), '  ', ID)).toBeNull();
  });
});

describe('public contract text', () => {
  const s = newSalt(), proof = proofOf(s, NAME, ID)!;
  it('never contains the full ID number, phone or (alias mode) the legal name; it round-trips the proof', () => {
    const text = generateContractText({ ...base, buyerUsername: 'web_x', card: { orderId: 'o1', buyerName: NAME, nameMode: 'alias', inviteCode: 'ABC123', proof } });
    expect(text).not.toContain('2900101');
    expect(text).not.toContain('1234567');
    expect(text).not.toContain(PHONE);
    expect(text).not.toContain(NAME);
    expect(text).toContain('ID ending 4567');
    expect(proofFromText(text)).toEqual(proof);
    expect(buyerDisplayFromText(text)).toEqual({ kind: 'code', value: 'ABC123' });
  });
  it('real-name mode still shows the chosen name but never the ID number', () => {
    const text = generateContractText({ ...base, card: { orderId: 'o1', buyerName: NAME, nameMode: 'real', proof } });
    expect(text).toContain(`name on record: ${NAME}`);
    expect(text).not.toContain('1234567');
    expect(buyerDisplayFromText(text)).toEqual({ kind: 'name', value: NAME });
  });
  it('a Pi contract carries the proof only when the buyer passed KYC, and reads as before otherwise', () => {
    expect(piParty('ali')).toBe('@ali — identity verified via Pi Network payment');
    const t = generateContractText({ ...base, identity: proof });
    expect(t).toContain(proofText(proof));
    expect(generateContractText(base)).not.toContain('identity commitment');
  });
  it('card contracts without a proof read exactly as before', () => {
    expect(cardParty('web_abc', { buyerName: 'A B', nameMode: 'alias', inviteCode: 'X' })).not.toContain('commitment');
  });
  it('the hash changes if the commitment changes, so the public hash binds the identity', () => {
    const a = generateContractText({ ...base, identity: proof }), b = generateContractText({ ...base, identity: proofOf(newSalt(), NAME, ID) });
    expect(a.replace(/Date: .*/, '')).not.toBe(b.replace(/Date: .*/, ''));
    expect(hashContract(a)).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('wiring', () => {
  it('both contract creators save the private record in the same transaction as the contract', () => {
    for (const f of ['lib/card-contract.ts', 'app/api/contracts/sign/route.ts']) {
      const t = src(f);
      expect(t).toContain('identityFor(');
      expect(t).toMatch(/tx\.set\(privateRef\(/);
    }
  });
  it('the private record is only read through the owner route, which is guarded and checks the owner', () => {
    const r = src('app/api/contracts/private/route.ts');
    expect(r).toContain('guardApi(');
    expect(r).toContain('personAccounts(');
    expect(src('lib/contract-private-store.ts')).toMatch(/uids\.includes\(String\(d\.uid/);
    expect(src('lib/contract-private-store.ts')).toContain("status !== 'approved'");
  });
  it('the public contract documents and responses never receive the private fields', () => {
    for (const f of ['lib/card-contract.ts', 'app/api/contracts/sign/route.ts']) {
      const t = src(f);
      expect(t).not.toMatch(/idNumber|legalName:/);
    }
  });
  it('the contract page shows the owner card, and the owner card fetches only on request of the server', () => {
    expect(src('components/contract-detail-view.tsx')).toContain('ContractPrivateCard');
    expect(src('components/contract-private-card.tsx')).toContain('/api/contracts/private');
  });
  it('firestore rules do not open contract_private to clients', () => {
    expect(src('firestore.rules')).not.toMatch(/match \/contract_private/);
  });
});
