import { describe, it, expect } from 'vitest';
import { propertyPaymentAmount, checkPropertyPaymentIntent } from '@/lib/payment-rules';

describe('propertyPaymentAmount', () => {
  it('uses payAmountPi first, then the price when priced in Pi', () => {
    expect(propertyPaymentAmount({ price: 100, currency: 'Pi', payAmountPi: 5 })).toBe(5);
    expect(propertyPaymentAmount({ price: 12.5, currency: 'Pi' })).toBe(12.5);
    expect(propertyPaymentAmount({ price: 7 })).toBe(7);
  });
  it('returns null when there is nothing usable (fee rule applies)', () => {
    expect(propertyPaymentAmount({ price: 1000, currency: 'USD' })).toBeNull();
    expect(propertyPaymentAmount({ price: 0, currency: 'Pi' })).toBeNull();
    expect(propertyPaymentAmount(null)).toBeNull();
  });
});

describe('checkPropertyPaymentIntent with a property amount', () => {
  const pay = (amount: number) => ({ amount, metadata: { propertyId: 'p1', transactionType: 'buy' } });
  it('accepts exactly the property amount and rejects anything else', () => {
    expect(checkPropertyPaymentIntent(pay(250), 250).ok).toBe(true);
    expect(checkPropertyPaymentIntent(pay(1), 250).ok).toBe(false);
    expect(checkPropertyPaymentIntent(pay(251), 250).ok).toBe(false);
  });
  it('falls back to the fee rule without an override', () => {
    expect(checkPropertyPaymentIntent(pay(1), null).ok).toBe(true);
    expect(checkPropertyPaymentIntent(pay(250), null).ok).toBe(false);
  });
});

import { piFromUsd, isUsdPegged } from '@/lib/payment-rules';
import { formatPropertyPrice } from '@/lib/price-format';

describe('USD-pegged listings', () => {
  it('converts USD to Pi at the admin rate, rounding up', () => {
    expect(piFromUsd(1000, 0.2)).toBe(5000);
    expect(piFromUsd(100, 0.3)).toBe(333.34);
    expect(piFromUsd(100, 0)).toBeNull();
    expect(piFromUsd(0, 0.2)).toBeNull();
  });
  it('uses the rate only for USD-pegged prices, and payAmountPi still wins', () => {
    expect(propertyPaymentAmount({ price: 1000, currency: 'USD' }, 0.2)).toBe(5000);
    expect(propertyPaymentAmount({ price: 1000, currency: 'OUSD' }, 0.5)).toBe(2000);
    expect(propertyPaymentAmount({ price: 1000, currency: 'USD' })).toBeNull();
    expect(propertyPaymentAmount({ price: 1000, currency: 'USD', payAmountPi: 7 }, 0.2)).toBe(7);
    expect(propertyPaymentAmount({ price: 1000, currency: 'EGP' }, 0.2)).toBeNull();
    expect(isUsdPegged('usd')).toBe(true);
    expect(isUsdPegged('Pi')).toBe(false);
  });
  it('formats prices by currency', () => {
    expect(formatPropertyPrice({ price: 5, currency: 'Pi' })).toBe('5 π');
    expect(formatPropertyPrice({ price: 250000, currency: 'USD' })).toBe('$250,000');
    expect(formatPropertyPrice({ price: 9 })).toBe('9 π');
  });
});
