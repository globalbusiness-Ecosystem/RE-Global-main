import { describe, it, expect } from 'vitest';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

describe('admin activity labels', () => {
  it('has an Arabic label for known actions and falls back to the code', () => {
    expect(auditLabel('payout.paid')).toBe('تعليم مستحق كمدفوع');
    expect(auditLabel('something.new')).toBe('something.new');
  });
  it('summarises only the known fields', () => {
    expect(auditSummary('market.fee', { from: 2, to: 5 })).toBe('2% ← 5%');
    expect(auditSummary('booking.cancel', { title: 'Villa', guest: 'ali', refund: 12.5, secret: 'x' })).toBe('Villa · @ali · استرداد 12.5 π');
    expect(auditSummary('payout.paid', { id: 'p1', note: '' })).toBe('p1');
    expect(auditSummary('property.edit', { id: 'a', title: 'T' })).toBe('T');
    expect(auditSummary('property.edit', null)).toBe('');
  });
  it('cuts long values', () => {
    expect(auditSummary('legal.save', { country: 'x'.repeat(500) }).length).toBe(80);
  });
});
