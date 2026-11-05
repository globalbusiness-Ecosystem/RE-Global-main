import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { HOME_LABELS, hm } from '@/lib/home-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(HOME_LABELS) as (keyof typeof HOME_LABELS)[];

describe('home page labels in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(HOME_LABELS[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar and ur differ from English; zh differs except for the brand name WhatsApp', () => {
    for (const k of keys) for (const l of ['ar', 'ur'] as const) {
      if (k === 'whatsapp' && l !== 'ar' && l !== 'ur') continue;
      expect(HOME_LABELS[k][l]).not.toBe(HOME_LABELS[k].en);
    }
    for (const k of keys.filter((x) => x !== 'whatsapp')) expect(HOME_LABELS[k].zh).not.toBe(HOME_LABELS[k].en);
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(hm('pinInvalid', bad)).toBe('Invalid PIN');
    expect(hm('pinInvalid', 'fr')).toBe('Code PIN invalide');
  });
  it('the home page has no Arabic/English-only text left and uses every key', () => {
    const src = readFileSync('app/page.tsx', 'utf8');
    expect(src).not.toMatch(/language *(===|!==) *'en' *\?/);
    for (const k of keys) expect(src).toContain(`hm('${k}', language)`);
    expect(src.split('\n')[0]).toBe("'use client';");
  });
});
