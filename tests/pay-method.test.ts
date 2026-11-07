import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { payMethod, CARD_PAYMENTS_ENABLED } from '@/lib/pay-method';
import { PAY_METHOD_LABELS, pm, type PayMethodLabelKey } from '@/lib/pay-method-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(PAY_METHOD_LABELS) as PayMethodLabelKey[];

describe('payMethod', () => {
  it('inside the Pi Browser it is always Pi', () => {
    expect(payMethod({ inPiBrowser: true, signedIn: false })).toBe('pi');
    expect(payMethod({ inPiBrowser: true, signedIn: true, cardEnabled: true })).toBe('pi');
  });
  it('outside it asks for sign-in first, then offers a card only once a provider is connected', () => {
    expect(payMethod({ inPiBrowser: false, signedIn: false, cardEnabled: true })).toBe('signin');
    expect(payMethod({ inPiBrowser: false, signedIn: true, cardEnabled: false })).toBe('card-soon');
    expect(payMethod({ inPiBrowser: false, signedIn: true, cardEnabled: true })).toBe('card');
  });
  it('card payments stay off until a provider is wired in', () => {
    expect(CARD_PAYMENTS_ENABLED).toBe(false);
  });
});

describe('pay method labels', () => {
  it('has all 7 languages and ar/ur/zh differ from English', () => {
    for (const k of keys) for (const l of LANGS) expect(PAY_METHOD_LABELS[k][l].trim().length).toBeGreaterThan(0);
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(PAY_METHOD_LABELS[k][l]).not.toBe(PAY_METHOD_LABELS[k].en);
  });
  it('falls back to English for hostile codes', () => {
    for (const bad of ['__proto__', 'constructor', 'xx', undefined]) expect(pm('cardSoon', bad)).toBe('Card payment coming soon');
  });
  it('the payment button uses the decision and every label', () => {
    const s = readFileSync('components/unified-payment-button.tsx', 'utf8') + readFileSync('components/card-pay-button.tsx', 'utf8');
    expect(s).toContain('payMethod(');
    for (const k of keys) expect(s, k).toContain(`pm('${k}'`);
  });
});
