import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CARD_RETURN_LABELS, cr, type CardReturnKey } from '@/lib/card-return-labels';
import { PAY_METHOD_LABELS } from '@/lib/pay-method-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const src = (p: string) => readFileSync(p, 'utf8');

describe('card return labels', () => {
  const keys = Object.keys(CARD_RETURN_LABELS) as CardReturnKey[];
  it('has all 7 languages and ar/ur/zh differ from English', () => {
    for (const k of keys) for (const l of LANGS) expect(CARD_RETURN_LABELS[k][l].trim().length).toBeGreaterThan(0);
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(CARD_RETURN_LABELS[k][l]).not.toBe(CARD_RETURN_LABELS[k].en);
  });
  it('falls back to English for hostile codes and the page uses every label', () => {
    for (const bad of ['__proto__', 'constructor', 'xx', undefined]) expect(cr('title', bad)).toBe('Thank you');
    const page = src('app/payment/card-return/page.tsx');
    for (const k of keys) expect(page, k).toContain(`cr('${k}'`);
  });
  it('the return page never claims the payment succeeded', () => {
    for (const l of LANGS) expect(CARD_RETURN_LABELS.body[l]).toBeTruthy();
    expect(CARD_RETURN_LABELS.body.en).toContain('confirming');
  });
  it('the two new button labels exist in all languages', () => {
    for (const k of ['payByCard', 'cardFailed'] as const) for (const l of LANGS) expect(PAY_METHOD_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
});

describe('card button wiring', () => {
  it('the pay button hands outside-Pi people to the card button, which only starts checkout through the API', () => {
    expect(src('components/unified-payment-button.tsx')).toContain('<CardPayButton');
    const b = src('components/card-pay-button.tsx');
    expect(b).toContain('/api/card/checkout');
    expect(b).toContain("transactionType === 'buy'");
    expect(b).not.toMatch(/card.?number|cvv|cvc/i);
  });
  it('the availability endpoint is rate limited', () => {
    expect(src('app/api/card/config/route.ts')).toContain('ipLimited(');
  });
});
