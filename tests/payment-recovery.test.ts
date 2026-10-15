import { describe, it, expect } from 'vitest';
import { planRecovery } from '@/lib/payment-recovery';

const base = { identifier: 'pay_1234567890', metadata: { propertyId: 'prop1', propertyTitle: 'Villa', transactionType: 'buy' } };
const TX = 'a'.repeat(64);

describe('planRecovery', () => {
  it('ignores empty, unreadable and already cancelled payments', () => {
    expect(planRecovery(null).action).toBe('ignore');
    expect(planRecovery({}).action).toBe('ignore');
    expect(planRecovery({ identifier: 'bad id!' }).action).toBe('ignore');
    expect(planRecovery({ ...base, status: { cancelled: true } }).action).toBe('ignore');
    expect(planRecovery({ ...base, status: { user_cancelled: true }, transaction: { txid: TX } }).action).toBe('ignore');
  });
  it('cancels a payment that never reached the blockchain', () => {
    expect(planRecovery({ ...base, status: { developer_approved: true } })).toEqual({ action: 'cancel', paymentId: 'pay_1234567890' });
    expect(planRecovery({ ...base, transaction: { txid: 'short' } }).action).toBe('cancel');
  });
  it('completes then records a paid purchase', () => {
    expect(planRecovery({ ...base, status: { developer_approved: true }, transaction: { txid: TX } })).toEqual({
      action: 'finish', paymentId: 'pay_1234567890', txid: TX, complete: true, resale: false, propertyId: 'prop1', propertyTitle: 'Villa',
    });
  });
  it('only records when Pi already has the payment completed', () => {
    const p = planRecovery({ ...base, status: { developer_completed: true }, transaction: { txid: TX } });
    expect(p.action === 'finish' && p.complete).toBe(false);
  });
  it('routes a resale to the market settlement', () => {
    const p = planRecovery({ identifier: 'pay_1234567890', metadata: { transactionType: 'resale', propertyId: 'prop1' }, transaction: { txid: TX } });
    expect(p.action === 'finish' && p.resale).toBe(true);
  });
});
