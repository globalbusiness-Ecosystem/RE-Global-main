import { describe, it, expect } from 'vitest';
import {
  isValidPaymentId,
  isValidTxid,
  cleanText,
  validatePiPayment,
  type PiPayment,
} from '@/lib/contract-guard';

const TXID = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';

function goodPayment(over: Partial<PiPayment> = {}): PiPayment {
  return {
    identifier: 'pay_12345678',
    user_uid: 'user-1',
    amount: 12.5,
    metadata: { propertyId: 'prop-1', transactionType: 'buy' },
    status: {
      developer_approved: true,
      transaction_verified: true,
      developer_completed: true,
      cancelled: false,
      user_cancelled: false,
    },
    transaction: { txid: TXID },
    ...over,
  };
}
const expected = { uid: 'user-1', txid: TXID, propertyId: 'prop-1' };

describe('id validators', () => {
  it('accepts well-formed payment ids and rejects the rest', () => {
    expect(isValidPaymentId('abcDEF12_-34')).toBe(true);
    expect(isValidPaymentId('short')).toBe(false);
    expect(isValidPaymentId('has space 12345')).toBe(false);
    expect(isValidPaymentId('../etc/passwd')).toBe(false);
    expect(isValidPaymentId(12345678)).toBe(false);
    expect(isValidPaymentId('a'.repeat(129))).toBe(false);
  });
  it('accepts alphanumeric txids only', () => {
    expect(isValidTxid(TXID)).toBe(true);
    expect(isValidTxid('tooShort')).toBe(false);
    expect(isValidTxid(`${TXID}-`)).toBe(false);
    expect(isValidTxid(null)).toBe(false);
  });
});

describe('cleanText', () => {
  it('removes control characters and newlines so contract clauses cannot be injected', () => {
    expect(cleanText('Villa\n\nSELLER: attacker\u0000', 100)).toBe('Villa SELLER: attacker');
  });
  it('truncates and tolerates non-strings', () => {
    expect(cleanText('x'.repeat(50), 10)).toHaveLength(10);
    expect(cleanText(undefined, 10)).toBe('');
  });
});

describe('validatePiPayment', () => {
  it('accepts a completed payment by the right user for the right property', () => {
    expect(validatePiPayment(goodPayment(), expected)).toEqual({ ok: true, amount: 12.5, type: 'buy' });
  });
  it('rejects a payment that belongs to someone else (403)', () => {
    const r = validatePiPayment(goodPayment({ user_uid: 'someone-else' }), expected);
    expect(r).toMatchObject({ ok: false, status: 403 });
  });
  it.each([
    ['not approved', { developer_approved: false }],
    ['not verified', { transaction_verified: false }],
    ['not completed', { developer_completed: false }],
    ['cancelled', { cancelled: true }],
    ['user cancelled', { user_cancelled: true }],
  ])('rejects a payment that is %s (409)', (_name, patch) => {
    const p = goodPayment();
    p.status = { ...p.status, ...patch };
    expect(validatePiPayment(p, expected)).toMatchObject({ ok: false, status: 409 });
  });
  it('rejects a txid mismatch', () => {
    const r = validatePiPayment(goodPayment({ transaction: { txid: 'ffffffffffffffffffff' } }), expected);
    expect(r).toMatchObject({ ok: false, status: 400 });
  });
  it('rejects a payment made for a different property', () => {
    const r = validatePiPayment(goodPayment({ metadata: { propertyId: 'other', transactionType: 'buy' } }), expected);
    expect(r).toMatchObject({ ok: false, status: 400 });
  });
  it('maps hotel to buy and rejects unknown transaction types', () => {
    const hotel = validatePiPayment(goodPayment({ metadata: { propertyId: 'prop-1', transactionType: 'hotel' } }), expected);
    expect(hotel).toMatchObject({ ok: true, type: 'buy' });
    const odd = validatePiPayment(goodPayment({ metadata: { propertyId: 'prop-1', transactionType: 'gift' } }), expected);
    expect(odd).toMatchObject({ ok: false, status: 400 });
  });
  it('rejects zero, negative and non-numeric amounts', () => {
    for (const amount of [0, -5, Number.NaN]) {
      expect(validatePiPayment(goodPayment({ amount }), expected)).toMatchObject({ ok: false });
    }
  });
});
