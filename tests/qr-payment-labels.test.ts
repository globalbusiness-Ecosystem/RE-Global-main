import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { QR_PAYMENT_LABELS, qp, qrMessages } from '@/lib/qr-payment-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('QR payment button labels', () => {
  it('has every text in all 7 languages, none empty, differing from English', () => {
    for (const [key, row] of Object.entries(QR_PAYMENT_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS.filter((x) => x !== 'en')) {
        expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(1);
        expect((row as Record<string, string>)[l], `${key}.${l}`).not.toBe((row as Record<string, string>).en);
      }
    }
  });
  it('keeps the {price} placeholder in the two price texts of every language', () => {
    for (const key of ['generateQRPrice', 'generateQRTitle'] as const)
      for (const l of LANGS) expect((QR_PAYMENT_LABELS[key] as Record<string, string>)[l], `${key}.${l}`).toContain('{price}');
  });
  it('puts the price in and falls back to English', () => {
    expect(qp('generateQRPrice', 'fr', 'π1.50')).toBe('Générer le QR - π1.50');
    expect(qp('generateQRPrice', 'xx', 'π1.50')).toBe('Generate QR - π1.50');
    expect(qp('qrSystem', 'ar')).toBe('نظام QR');
  });
  it('gives the same English and Arabic messages the button used before', () => {
    expect(qrMessages('en').paymentFailed).toBe('Payment failed');
    expect(qrMessages('ar').retry).toBe('إعادة محاولة');
    expect(Object.keys(qrMessages('zh')).sort()).toEqual(['generateQR', 'notAvailable', 'paymentFailed', 'productNotFound', 'purchaseCancelled', 'purchaseError', 'qrGenerated', 'retry', 'success']);
  });
});
