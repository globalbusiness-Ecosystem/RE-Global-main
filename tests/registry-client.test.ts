import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Keypair, xdr, scValToNative } from '@stellar/stellar-sdk';
import { buildRecordOp, buyerRef, registryKind, NO_REPLACES, recordOnRegistry } from '@/lib/registry-client';

const H = 'a'.repeat(64);
const CONTRACT = 'CBSNKBKIAUWS7XIC7M4AMY5273XH6OV757XOH32HCNSC6VQP4DG6VROY';
const src = (p: string) => readFileSync(p, 'utf8');

describe('registry call', () => {
  it('calls record with the six arguments in the contract order and types', () => {
    const op = buildRecordOp(CONTRACT, { propertyId: 'villa-1', buyerRef: buyerRef('web_x'), contractHash: H, kind: 'buy' })!;
    const fn = (op.body().invokeHostFunctionOp().hostFunction().invokeContract());
    expect(fn.functionName().toString()).toBe('record');
    const a = fn.args();
    expect(a.length).toBe(6);
    expect(a[0].switch()).toBe(xdr.ScValType.scvString());
    expect(a[1].switch()).toBe(xdr.ScValType.scvBytes());
    expect(a[2].bytes().toString('hex')).toBe(H);
    expect(a[3].switch()).toBe(xdr.ScValType.scvSymbol());
    expect(scValToNative(a[3])).toBe('buy');
    expect(scValToNative(a[4])).toBe(0);
    expect(scValToNative(a[5])).toBe(NO_REPLACES);
  });
  it('refuses a bad fingerprint, a bad buyer reference or a long property id', () => {
    const ok = { propertyId: 'p', buyerRef: H, contractHash: H, kind: 'buy' as const };
    expect(buildRecordOp(CONTRACT, { ...ok, contractHash: 'zz' })).toBeNull();
    expect(buildRecordOp(CONTRACT, { ...ok, buyerRef: 'abc' })).toBeNull();
    expect(buildRecordOp(CONTRACT, { ...ok, propertyId: 'x'.repeat(129) })).toBeNull();
  });
  it('the buyer reference is a stable hash that shows nothing about the buyer', () => {
    expect(buyerRef('web_x')).toBe(buyerRef('web_x'));
    expect(buyerRef('web_x')).not.toBe(buyerRef('web_y'));
    expect(buyerRef('web_x')).toMatch(/^[0-9a-f]{64}$/);
    expect(buyerRef('web_x')).not.toContain('web_x');
  });
  it('only the four words the contract accepts are ever sent', () => {
    expect(['buy', 'sale', 'rent', 'hotel', 'stay', 'invest', 'tokenized', 'weird'].map(registryKind)).toEqual(['buy', 'buy', 'rent', 'rent', 'rent', 'invest', 'tokenized', 'buy']);
  });
  it('a bad input never reaches the network', async () => {
    expect(await recordOnRegistry(Keypair.random().secret(), CONTRACT, { propertyId: '', buyerRef: H, contractHash: H, kind: 'buy' })).toEqual({ ok: false, error: 'bad_input' });
  });
});

describe('the smart contract source', () => {
  const rs = src('contracts/ownership-registry/src/lib.rs');
  it('is admin only, append only and stores no personal data', () => {
    expect(rs).toContain('admin(&env).require_auth()');
    expect(rs).not.toMatch(/fn (delete|remove|update)\b/);
    expect(rs).toContain('DuplicateContract');
    expect(rs).not.toMatch(/name|email|phone/i);
  });
  it('the app and the contract agree on the argument order', () => {
    expect(rs).toMatch(/pub fn record\(\s*env: Env,\s*property_id: String,\s*buyer_ref: BytesN<32>,\s*contract_hash: BytesN<32>,\s*kind: Symbol,\s*shares: u32,\s*replaces: u32,/);
  });
  it('card contracts are written to the registry without blocking the sale', () => {
    const c = src('lib/card-contract.ts');
    expect(c).toContain('await recordContract(o.id).catch');
    expect(c).toContain('REGISTRY_CONTRACT_ID');
  });
});
