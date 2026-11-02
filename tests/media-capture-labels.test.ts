import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MEDIA_LABELS, mediaLabels } from '@/lib/media-capture-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('media capture labels', () => {
  it('has every text in all 7 languages, none empty, differing from English', () => {
    for (const [key, row] of Object.entries(MEDIA_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS.filter((x) => x !== 'en')) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(1);
      // French, Spanish and Portuguese may share a word with English ("Error"); the other languages never do.
      for (const l of ['ar', 'ur', 'zh'] as const) expect((row as Record<string, string>)[l], `${key}.${l}`).not.toBe((row as Record<string, string>).en);
    }
  });
  it('keeps the old English and Arabic texts and falls back to English', () => {
    expect(mediaLabels('en').upload).toBe('Upload to Aladdin');
    expect(mediaLabels('ar').upload).toBe('رفع إلى علاء الدين');
    expect(mediaLabels('xx').cancel).toBe('Cancel');
    expect(mediaLabels('es').takPhoto).toBe('Tomar foto');
  });
  it('the box uses the labels and lays out right-to-left for Arabic and Urdu', () => {
    const src = readFileSync('components/media-capture.tsx', 'utf8');
    expect(src).toContain('mediaLabels(language)');
    expect(src).not.toMatch(/isArabic|labels\[/);
    expect(src).toContain("language === 'ar' || language === 'ur'");
  });
  it('every text the box shows exists', () => {
    const src = readFileSync('components/media-capture.tsx', 'utf8');
    for (const k of [...src.matchAll(/\bt\.([A-Za-z]+)/g)].map((m) => m[1])) expect(Object.keys(MEDIA_LABELS), k).toContain(k);
  });
});
