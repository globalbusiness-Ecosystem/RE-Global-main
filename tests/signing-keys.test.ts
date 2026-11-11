import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { Keypair } from '@stellar/stellar-sdk';
import { publicOf, anchorSecret } from '@/lib/signing-keys';

const src = (p: string) => readFileSync(p, 'utf8');
const A = Keypair.random();
const B = Keypair.random();

describe('signing keys', () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; });

  it('the public key always comes from the secret', () => {
    expect(publicOf(A.secret())).toBe(A.publicKey());
    expect(publicOf('nonsense')).toBeNull();
    expect(publicOf(undefined)).toBeNull();
  });
  it('the anchoring account is the separate one when set, otherwise the signing one', () => {
    process.env.PI_ISSUER_SECRET_KEY = A.secret();
    delete process.env.CHAIN_ANCHOR_SECRET_KEY;
    expect(anchorSecret()).toBe(A.secret());
    process.env.CHAIN_ANCHOR_SECRET_KEY = B.secret();
    expect(anchorSecret()).toBe(B.secret());
  });
  it('contracts no longer store the public key typed in the settings', () => {
    for (const f of ['app/api/contracts/sign/route.ts', 'lib/resale-contract.ts', 'lib/card-contract.ts']) {
      expect(src(f), f).not.toContain('process.env.PI_ISSUER_PUBLIC_KEY');
    }
  });
  it('anchoring and the registry use the anchoring account, and the admin call repairs old keys', () => {
    const c = src('lib/card-contract.ts');
    expect(c.match(/chainKeys\(\)/g)?.length).toBe(2);
    expect(src('lib/chain-sync.ts')).toContain('repairPlatformKeys');
    expect(src('lib/signing-keys.ts')).toContain('verifyContractSignature');
  });
});
