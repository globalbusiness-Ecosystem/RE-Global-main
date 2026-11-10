import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseHandle } from '@/lib/handle';
import { normalizeReferralCode } from '@/lib/rewards';
import { buyerHandleFromText } from '@/lib/contract-identity';
import { generateContractText } from '@/lib/contract-signing';

const src = (p: string) => readFileSync(p, 'utf8');

describe('chosen username (also the invite code)', () => {
  it('accepts 4 to 12 letters and digits starting with a letter, and keeps the way it was typed', () => {
    expect(parseHandle('Elsayed77')).toEqual({ handle: 'Elsayed77', key: 'elsayed77', code: 'ELSAYED77' });
    expect(parseHandle('  ahmed7  ')?.handle).toBe('ahmed7');
  });
  it('refuses odd shapes, other characters and names that sound like the platform', () => {
    for (const bad of ['abc', 'a'.repeat(13), '7ahmed', 'ah med', 'ahmed_7', 'ahmed-7', 'أحمد1234', '', null, undefined, 5, 'admin1', 'ReGlobalOfficial', 'support24', 'root'])
      expect(parseHandle(bad)).toBeNull();
  });
  it('the code it makes is always a valid invite code', () => {
    for (const h of ['Elsayed77', 'ahmed', 'Zed9', 'Abcdefghij12']) expect(normalizeReferralCode(parseHandle(h)!.code)).toBe(h.toUpperCase());
  });
  it('names are chosen once, are unique ignoring case, and names are checked together with codes in one transaction', () => {
    const s = src('lib/handle-store.ts');
    expect(s).toContain('runTransaction');
    expect(s).toMatch(/already/);
    expect(s).toContain("doc(p.key)");
    expect(s).toContain("where('code', '==', p.code)");
    expect(s).toContain("startsWith('web_')");
  });
  it('the route needs a signed-in person, limits attempts and never takes the person from the request body', () => {
    const r = src('app/api/handle/route.ts');
    expect(r.match(/guardApi/g)?.length).toBe(3); // import + GET + POST
    expect(r).toContain('user.uid');
    expect(r).not.toMatch(/body\??\.(uid|username)/);
  });
  it('the contract shows the chosen username, and the page reads it back', () => {
    expect(src('lib/card-contract.ts')).toContain('buyerUsername: shownName');
    const t = generateContractText({ contractId: 'c', propertyId: 'p', propertyTitle: 'F', buyerUsername: 'elsayed77', sellerUsername: 'RE-Global-Platform', type: 'buy', amount: 1, currency: 'EGP', paymentId: 'o', txid: '', card: { orderId: 'o', buyerName: 'A B', nameMode: 'alias', inviteCode: 'ELSAYED77' } });
    expect(buyerHandleFromText(t)).toBe('elsayed77');
    expect(buyerHandleFromText('no line here')).toBeNull();
  });
  it('the settings page lets a web account choose it, once', () => {
    const p = src('components/pages/settings-page.tsx');
    expect(p).toContain('/api/handle');
    expect(p).toMatch(/isWebAccount && !handle/);
  });
});
