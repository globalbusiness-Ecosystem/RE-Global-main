import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Keypair, TransactionBuilder, Memo } from '@stellar/stellar-sdk';
import { buildAnchorTx, anchorHash, PI_TESTNET_PASSPHRASE } from '@/lib/chain-anchor';
import { generateContractText, hashContract, verifyContractSignature, signContractHash } from '@/lib/contract-signing';
import { buildAttention } from '@/lib/attention-rules';

const src = (p: string) => readFileSync(p, 'utf8');
const kp = Keypair.random();
const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Villa', buyerUsername: 'web_abc', sellerUsername: 'RE-Global-Platform', type: 'buy', amount: 100, currency: 'EGP', paymentId: 'order1', txid: '' };

describe('anchoring transaction', () => {
  it('carries the contract fingerprint as its memo and is signed by the platform account', () => {
    const hash = hashContract('hello');
    const b = buildAnchorTx(kp.secret(), '12345', hash)!;
    const tx = TransactionBuilder.fromXDR(b.xdr, PI_TESTNET_PASSPHRASE);
    expect('memo' in tx && tx.memo instanceof Memo).toBe(true);
    expect((tx as { memo: Memo }).memo.type).toBe('hash');
    expect(Buffer.from((tx as { memo: Memo }).memo.value as Buffer).toString('hex')).toBe(hash);
    expect(tx.hash().toString('hex')).toBe(b.txid);
    expect(tx.signatures.length).toBe(1);
  });
  it('refuses anything that is not a SHA-256 fingerprint', async () => {
    expect(buildAnchorTx(kp.secret(), '1', 'nothex')).toBeNull();
    expect(await anchorHash(kp.secret(), 'x')).toEqual({ ok: false, error: 'bad_hash' });
  });
});

describe('card contract text', () => {
  it('names the card order and the verified name, not a Pi payment', () => {
    const t = generateContractText({ ...base, card: { orderId: 'order1', buyerName: 'Ahmed Mohamed Ali' } });
    expect(t).toContain('Order ID: order1');
    expect(t).toContain('Ahmed Mohamed Ali');
    expect(t).toContain('KYC/AML');
    expect(t).not.toContain('Pi Network payment system');
  });
  it('a Pi contract reads exactly as before', () => {
    const t = generateContractText({ ...base, currency: 'Pi', txid: 'abc' });
    expect(t).toContain('identity verified via Pi Network payment');
    expect(t).toContain('Pi Network payment system (Payment ID: order1, Transaction: abc)');
  });
  it('the platform signature of a card contract verifies', () => {
    const h = hashContract(generateContractText({ ...base, card: { orderId: 'o', buyerName: 'A B' } }));
    expect(verifyContractSignature(h, signContractHash(h, kp.secret()), kp.publicKey())).toBe(true);
  });
});

describe('wiring', () => {
  it('a paid card order creates the contract and passes its id on; anchoring never blocks the sale', () => {
    const d = src('lib/card-pay/deps.ts');
    expect(d).toContain('createCardContract');
    expect(d).toContain('.catch(');
    expect(d).not.toContain("contractId: '',");
    const c = src('lib/card-contract.ts');
    expect(c).toContain("paymentMethod: 'card'");
    expect(c).toContain('await anchorContract(o.id).catch');
  });
  it('re-anchoring is admin only and logged; unanchored contracts raise an alert', () => {
    const r = src('app/api/admin/contracts/anchor/route.ts');
    expect(r).toContain('isAdminRequest');
    expect(r).toContain("logAdmin('contracts.anchor'");
    const a = buildAttention({ env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true }, usdProperties: 0, piRateSet: false, pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 }, cardContractsUnanchored: 2 });
    expect(a.some((x) => x.id === 'card-contracts')).toBe(true);
  });
});

describe('paid card orders without a contract', () => {
  it('raise a blocking alert and the admin button creates them', () => {
    const base = { env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true }, usdProperties: 0, piRateSet: false, pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 } };
    const a = buildAttention({ ...base, cardOrdersWithoutContract: 3 });
    expect(a[0]).toMatchObject({ id: 'card-no-contract', level: 'bad' });
    expect(buildAttention({ ...base, cardOrdersWithoutContract: 0 })).toEqual([]);
    expect(src('app/api/admin/contracts/anchor/route.ts')).toContain('createMissingCardContracts');
    expect(src('lib/card-contract.ts')).toContain('ordersWithoutContract');
  });
});

describe('web buyers see their contracts', () => {
  it('the web username used for every saved record is the rule-matching name, not the e-mail', () => {
    const ctx = src('contexts/pi-auth-context.tsx');
    expect(ctx).toContain('setUsername(name);');
    expect(ctx).not.toContain('setUsername(u.email');
  });
  it('the admin anchor call reports why it failed', () => {
    expect(src('app/api/admin/contracts/anchor/route.ts')).toContain('errors');
    expect(src('components/admin/card-orders-panel.tsx')).toContain('ANCHOR_HELP');
  });
});
