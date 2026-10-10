import { describe, it, expect } from 'vitest';
import { expectedAmountFor, checkPropertyPaymentIntent } from '@/lib/payment-rules';
import { validatePiPayment, type PiPayment } from '@/lib/contract-guard';

describe('expectedAmountFor', () => {
  it('charges 1 for buy (also the default) and 50 for the other types', () => {
    expect(expectedAmountFor('buy')).toBe(1);
    expect(expectedAmountFor(undefined)).toBe(1);
    for (const t of ['rent', 'hotel', 'invest', 'tokenized']) expect(expectedAmountFor(t)).toBe(50);
  });
  it('rejects unknown types', () => {
    expect(expectedAmountFor('free')).toBeNull();
    expect(expectedAmountFor({})).toBeNull();
  });
});

describe('checkPropertyPaymentIntent', () => {
  it('ignores payments that are not about a property', () => {
    expect(checkPropertyPaymentIntent({ amount: 0.0001, metadata: { foo: 1 } as any })).toEqual({ ok: true });
    expect(checkPropertyPaymentIntent({ amount: 3 })).toEqual({ ok: true });
  });
  it('accepts the exact platform amount', () => {
    expect(checkPropertyPaymentIntent({ amount: 1, metadata: { propertyId: 'p1' } }).ok).toBe(true);
    expect(checkPropertyPaymentIntent({ amount: 50, metadata: { propertyId: 'p1', transactionType: 'rent' } }).ok).toBe(true);
  });
  it('rejects a tampered amount or type', () => {
    expect(checkPropertyPaymentIntent({ amount: 0.001, metadata: { propertyId: 'p1' } }).ok).toBe(false);
    expect(checkPropertyPaymentIntent({ amount: 1, metadata: { propertyId: 'p1', transactionType: 'rent' } }).ok).toBe(false);
    expect(checkPropertyPaymentIntent({ amount: 1, metadata: { propertyId: 'p1', transactionType: 'weird' } }).ok).toBe(false);
    expect(checkPropertyPaymentIntent({ amount: Number.NaN, metadata: { propertyId: 'p1' } }).ok).toBe(false);
  });
});

describe('contract signing uses the amount rule', () => {
  const TXID = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
  const pay = (amount: number): PiPayment => ({
    user_uid: 'u',
    amount,
    metadata: { propertyId: 'p1', transactionType: 'buy' },
    status: { developer_approved: true, transaction_verified: true, developer_completed: true },
    transaction: { txid: TXID },
  });
  it('refuses a contract for an underpaid payment', () => {
    expect(validatePiPayment(pay(0.01), { uid: 'u', txid: TXID, propertyId: 'p1' })).toMatchObject({ ok: false, status: 400 });
    expect(validatePiPayment(pay(1), { uid: 'u', txid: TXID, propertyId: 'p1' })).toMatchObject({ ok: true });
  });
});
