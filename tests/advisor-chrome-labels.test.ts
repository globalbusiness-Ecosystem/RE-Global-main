import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ADVISOR_CHROME, ac } from '@/lib/advisor-chrome-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(ADVISOR_CHROME) as (keyof typeof ADVISOR_CHROME)[];
const placeholders = (t: string) => (t.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('advisor chat chrome in 7 languages', () => {
  it('every key has a non-empty text in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(ADVISOR_CHROME[k][l].trim().length).toBeGreaterThan(0);
  });
  it('ar, ur and zh differ from English; the other languages differ for sentences', () => {
    for (const k of keys.filter((x) => x !== 'title')) for (const l of ['ar', 'ur', 'zh'] as const) expect(ADVISOR_CHROME[k][l]).not.toBe(ADVISOR_CHROME[k].en);
    for (const l of ['fr', 'es', 'pt'] as const) expect(ADVISOR_CHROME.disclaimer[l]).not.toBe(ADVISOR_CHROME.disclaimer.en);
  });
  it('placeholders match English in every language', () => {
    for (const k of keys) for (const l of LANGS) expect(placeholders(ADVISOR_CHROME[k][l])).toBe(placeholders(ADVISOR_CHROME[k].en));
  });
  it('fills the photo result and falls back to English for unknown or hostile languages', () => {
    const v = { room: 'Kitchen', city: 'Cairo', condition: 'good' };
    for (const l of LANGS) {
      const t = ac('photoDone', l, v);
      expect(t).toContain('Cairo');
      expect(t).not.toMatch(/\{\w+\}/);
    }
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) expect(ac('stop', bad)).toBe('Stop');
  });
  it('the chat has no ar/en-only text left in its chrome', () => {
    const chat = readFileSync('components/ai-advisor-chat.tsx', 'utf8');
    for (const k of ['title', 'subtitle', 'listen', 'stop', 'listenTitle', 'analyzeFor', 'placeholder', 'uploadPhoto', 'disclaimer', 'error', 'photoAnalyzing', 'photoError', 'photoDone']) {
      expect(chat).toContain(`ac('${k}', language`);
    }
    expect(chat).not.toContain("'World-Class Real Estate Advisor'");
    expect(chat).not.toContain("'Analyze for:'");
    expect(chat).not.toContain('General information only, not financial');
  });
});
