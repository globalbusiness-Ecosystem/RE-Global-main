import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { QR_PAY_LABELS, qrp } from '@/lib/qr-pay-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(QR_PAY_LABELS) as (keyof typeof QR_PAY_LABELS)[];

describe('QR window and simple Pi button labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(QR_PAY_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English', () => {
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(QR_PAY_LABELS[k][l]).not.toBe(QR_PAY_LABELS[k].en);
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(qrp('close', bad)).toBe('Close');
    expect(qrp('close', 'fr')).toBe('Fermer');
  });
  it('the QR window has no Arabic/English-only text left', () => {
    const src = readFileSync('components/qr-code-modal.tsx', 'utf8');
    expect(src).not.toMatch(/language *(===|!==) *'en' *\?/);
    for (const k of ['qrTitle', 'location', 'bedrooms', 'shareLink', 'copied', 'copy', 'printTitle', 'print', 'close']) expect(src).toContain(`qrp('${k}', language)`);
    expect(src).toContain("bp('price', language)");
    expect(src).toContain("pd('area', language)");
  });
  it('the simple Pi button is translated and keeps the English error text as it is', () => {
    const src = readFileSync('components/simple-pi-payment-button.tsx', 'utf8');
    expect(src).toContain("pay('piUnavailable', language)");
    expect(src).toContain("pay('processing', language)");
    expect(src).toContain("qrp('paySuccess', language)");
    expect(src).toContain("qrp('payWithPi', language)");
    expect(src).toContain("language === 'en' ? errorMsg : `${pay('errorPrefix', language)}: ${errorMsg}`");
  });
  it('the header takes the settings title from the navigation dictionary', () => {
    const src = readFileSync('components/header.tsx', 'utf8');
    expect(src).toContain('title={t.settings}');
    expect(src).not.toContain("'الإعدادات'");
  });
});
