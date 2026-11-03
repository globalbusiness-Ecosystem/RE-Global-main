import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PAYMENT_LABELS, pay, type PaymentLabelKey } from '@/lib/payment-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const rows = Object.entries(PAYMENT_LABELS) as [string, Record<string, string>][];

describe('payment button labels', () => {
  it('has every text in all 7 languages, none empty; ar/ur/zh differ from English', () => {
    for (const [key, row] of rows) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect(row[l].trim().length, `${key}.${l}`).toBeGreaterThan(1);
      for (const l of ['ar', 'ur', 'zh']) expect(row[l], `${key}.${l}`).not.toBe(row.en);
    }
  });
  it('keeps the {amount} placeholder in every language of the success message', () => {
    for (const l of LANGS) expect(PAYMENT_LABELS.paidOk[l], l).toContain('{amount}');
    for (const [key, row] of rows) if (key !== 'paidOk') for (const l of LANGS) expect(row[l], `${key}.${l}`).not.toContain('{');
  });
  it('fills the amount and keeps the old English/Arabic texts', () => {
    expect(pay('paidOk', 'en', 12.5)).toBe('Payment of 12.5 Pi processed successfully!');
    expect(pay('paidOk', 'ar', 3)).toBe('تم معالجة دفع 3 Pi بنجاح!');
    expect(pay('buy', 'ar')).toBe('شراء');
    expect(pay('resale', 'en')).toBe('Buy shares');
  });
  it('French/Spanish/Chinese users no longer get Arabic', () => {
    expect(pay('cancel', 'fr')).toBe('Annuler');
    expect(pay('cancel', 'es')).toBe('Cancelar');
    expect(pay('cancel', 'zh')).toBe('取消');
  });
  it('falls back to English for unknown or inherited language names', () => {
    for (const l of ['xx', 'constructor', 'toString', undefined]) expect(pay('cancel', l)).toBe('Cancel');
  });
  it('the button uses the labels and no longer decides by Arabic fallbacks', () => {
    const src = readFileSync('components/unified-payment-button.tsx', 'utf8');
    expect(src).not.toMatch(/[؀-ۿ]/);
    expect(src.match(/language === 'en'/g)?.length).toBe(1);
    expect(src).toContain("pay(transactionType, language)");
    for (const k of [...src.matchAll(/pay\('([A-Za-z]+)'/g)].map((m) => m[1])) expect(Object.keys(PAYMENT_LABELS), k).toContain(k as PaymentLabelKey);
  });
});
