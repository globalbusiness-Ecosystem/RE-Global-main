import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ADVISOR_LABELS, advisorText, isAdvisorLanguage, languageInstruction, ADVISOR_LANGUAGE_NAMES } from '@/lib/advisor-i18n';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const holes = (s: string) => (s.match(/\{[a-z]+\}/g) ?? []).sort().join(',');

describe('advisor i18n', () => {
  it('has the greetings and the tip heading in all 7 languages with the same placeholders', () => {
    for (const [key, row] of Object.entries(ADVISOR_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) {
        expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(5);
        expect(holes((row as Record<string, string>)[l]), `${key}.${l}`).toBe(holes(row.en));
      }
    }
  });
  it('fills in the name and the balance, and falls back to English', () => {
    expect(advisorText('greetingNamed', 'fr', { name: 'Sara', balance: 12 })).toContain('Bonjour Sara');
    expect(advisorText('greetingNamed', 'fr', { name: 'Sara', balance: 12 })).toContain('12 π');
    expect(advisorText('greetingPlain', undefined)).toContain('I\'m Aladdin');
    expect(advisorText('greetingPlain', 'xx')).toContain('I\'m Aladdin');
    expect(advisorText('greetingPlain', 'toString')).toContain('I\'m Aladdin');
  });
  it('the Arabic plain greeting no longer has an English word in the middle', () => {
    expect(ADVISOR_LABELS.greetingPlain.ar).not.toMatch(/ANY/);
  });
  it('tells the AI to answer in the app language, except for Arabic and unknown languages', () => {
    expect(languageInstruction('fr')).toContain('French');
    expect(languageInstruction('fr')).toContain(ADVISOR_LABELS.tipHeading.fr);
    expect(languageInstruction('zh')).toContain('Simplified Chinese');
    expect(languageInstruction('ar')).toBe('');
    expect(languageInstruction('xx')).toBe('');
    expect(Object.keys(ADVISOR_LANGUAGE_NAMES).sort()).toEqual([...LANGS].sort());
  });
  it('recognises exactly the 7 languages', () => {
    for (const l of LANGS) expect(isAdvisorLanguage(l)).toBe(true);
    for (const x of ['xx', '', 5, null, undefined, 'toString']) expect(isAdvisorLanguage(x)).toBe(false);
  });
  it('the advisor route and chat use it', () => {
    const route = readFileSync('app/api/claude-advisor/route.ts', 'utf8');
    const chat = readFileSync('components/ai-advisor-chat.tsx', 'utf8');
    expect(route).toContain('languageInstruction(replyLanguage)');
    expect(route).toContain('language: replyLanguage');
    expect(chat).toContain("advisorText('greetingNamed'");
    expect(chat).not.toContain("I\\'m Aladdin");
  });
});
