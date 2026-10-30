import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { A11Y_LABELS, a11yLabels } from '@/lib/a11y-labels';
import { SEO_LANGS } from '@/lib/seo-i18n';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? (n === 'ui' || n === 'node_modules' ? [] : walk(p)) : p.endsWith('.tsx') ? [p] : [];
  });

// An icon-only <button>: it contains an icon (a capitalised self-closing tag) and no text and no text expression,
// and has no aria-label / aria-labelledby / title. Screen readers would announce it as just "button".
function unnamedIconButtons(src: string): number[] {
  const found: number[] = [];
  for (const m of src.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const [, attrs, inner] = m;
    if (/aria-label|aria-labelledby|\btitle=/.test(attrs)) continue;
    if (!/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/.test(inner)) continue;
    const text = inner.replace(/<[A-Z][A-Za-z0-9]*\b[\s\S]*?\/>/g, '').replace(/<[^>]+>/g, '');
    if (/[A-Za-z؀-ۿ0-9]/.test(text.replace(/\{[^}]*\}/g, ''))) continue;
    // A text expression: a quoted string, or a member such as {t.refresh} / {labels.stop}.
    if (/\{[^}]*(?:\w\.\w|['"`])[^}]*\}/.test(text)) continue;
    found.push(src.slice(0, m.index).split('\n').length);
  }
  return found;
}

describe('icon-only buttons have a name', () => {
  it('finds none in components/ and app/', () => {
    const bad: string[] = [];
    for (const f of [...walk('components'), ...walk('app')]) {
      for (const line of unnamedIconButtons(readFileSync(f, 'utf8'))) bad.push(`${f}:${line}`);
    }
    // The one allowed exception: the hidden tap-counter on the settings avatar (not a real control for users).
    expect(bad.filter((x) => !x.startsWith('components/pages/settings-page.tsx'))).toEqual([]);
  });
  it('the detector itself catches an unnamed icon button and accepts named ones', () => {
    expect(unnamedIconButtons('<button onClick={f}>\n  <X className="w-4" />\n</button>')).toEqual([1]);
    expect(unnamedIconButtons('<button aria-label="Close" onClick={f}><X /></button>')).toEqual([]);
    expect(unnamedIconButtons('<button onClick={f}><X /> Close</button>')).toEqual([]);
    expect(unnamedIconButtons("<button onClick={f}><X />{ok ? 'Yes' : 'No'}</button>")).toEqual([]);
    expect(unnamedIconButtons('<button onClick={f}><X />{t.refresh}</button>')).toEqual([]);
  });
});

describe('a11y labels', () => {
  it('exist in every language, with no empty text', () => {
    for (const l of SEO_LANGS) for (const [k, v] of Object.entries(A11Y_LABELS[l])) expect(v.length, `${l}.${k}`).toBeGreaterThan(1);
  });
  it('fall back to English', () => {
    expect(a11yLabels('xx').close).toBe('Close');
    expect(a11yLabels('ar').close).toBe('إغلاق');
  });
});
