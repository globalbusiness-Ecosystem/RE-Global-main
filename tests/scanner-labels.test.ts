import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SCANNER_LABELS, qs, type ScannerLabelKey } from '@/lib/scanner-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('scanner and partners labels', () => {
  it('has every label in all 7 languages, none empty, and differing from English', () => {
    for (const [key, row] of Object.entries(SCANNER_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(1);
      for (const l of LANGS.filter((x) => x !== 'en')) expect((row as Record<string, string>)[l], `${key}.${l}`).not.toBe((row as Record<string, string>).en);
    }
  });
  it('falls back to English for an unknown language', () => {
    expect(qs('uploadImage', 'xx')).toBe('Upload image');
    expect(qs('uploadImage', 'fr')).toBe('Importer une image');
  });
  it('the scanner and the partners page use the accessor, not Arabic/English-only ternaries', () => {
    const scanner = readFileSync('components/qr-scanner-modal.tsx', 'utf8');
    const partners = readFileSync('components/pages/partners-page.tsx', 'utf8');
    expect(scanner).not.toMatch(/isArabic/);
    expect(partners).not.toMatch(/language === 'en'/);
    for (const src of [scanner, partners]) {
      const used = [...src.matchAll(/qs\('([A-Za-z]+)'/g)].map((m) => m[1]);
      for (const k of used) expect(Object.keys(SCANNER_LABELS), k).toContain(k as ScannerLabelKey);
    }
  });
  it('every label is used somewhere', () => {
    const src = readFileSync('components/qr-scanner-modal.tsx', 'utf8') + readFileSync('components/pages/partners-page.tsx', 'utf8');
    for (const k of Object.keys(SCANNER_LABELS)) expect(src, k).toContain(`qs('${k}'`);
  });
});
