import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { hasLocalAnswers } from '@/lib/advisor-local';
import { MEMORY_INSTRUCTIONS } from '@/lib/advisor-history';

describe('Aladdin built-in answers only for the languages they are written in', () => {
  it('Arabic, English and unset use the built-in answers', () => {
    expect(hasLocalAnswers('ar')).toBe(true);
    expect(hasLocalAnswers('en')).toBe(true);
    expect(hasLocalAnswers(undefined)).toBe(true);
  });
  it('the other languages (and anything unknown) go to the AI', () => {
    for (const l of ['fr', 'es', 'pt', 'ur', 'zh', '', 'xx', '__proto__']) expect(hasLocalAnswers(l)).toBe(false);
  });
  it('the chat sends those questions to the AI before any built-in rule runs', () => {
    const chat = readFileSync('components/ai-advisor-chat.tsx', 'utf8');
    const start = chat.indexOf('const generateResponse = (userMessage: string)');
    expect(start).toBeGreaterThan(0);
    const guard = chat.indexOf('if (!hasLocalAnswers(language)) return null;', start);
    expect(guard).toBeGreaterThan(start);
    expect(guard).toBeLessThan(chat.indexOf('hasLegalKeywords(userMessage)', start));
  });
  it('the AI is told to close legal, tax and investment answers with a short not-professional-advice line in the user language', () => {
    expect(MEMORY_INSTRUCTIONS).toMatch(/not professional advice/);
    expect(MEMORY_INSTRUCTIONS).toMatch(/language you are answering in/);
  });
});
