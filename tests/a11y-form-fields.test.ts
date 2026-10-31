import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? (n === 'ui' || n === 'node_modules' ? [] : walk(p)) : p.endsWith('.tsx') ? [p] : [];
  });

// End of an opening tag, skipping {...} expressions and quoted strings (so "=>" inside handlers does not end it).
function tagEnd(s: string, from: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = from; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === '"' || (depth > 0 && (c === "'" || c === '`'))) quote = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0 && s[i - 1] !== '=') return i;
  }
  return -1;
}

// A form field needs a name a screen reader can read: aria-label, aria-labelledby, an id (for <label htmlFor>),
// or to sit inside a <label> / the admin <Field> wrapper. A placeholder alone is not a reliable name.
export function unnamedFields(src: string): number[] {
  const found: number[] = [];
  for (const m of src.matchAll(/<(input|textarea|select)\b/g)) {
    const end = tagEnd(src, (m.index ?? 0) + m[0].length);
    const attrs = src.slice((m.index ?? 0) + m[0].length, end);
    if (/type=["'](hidden|checkbox|radio|file|submit)/.test(attrs)) continue;
    if (/aria-label=(""|'')/.test(attrs)) { found.push(src.slice(0, m.index).split('\n').length); continue; } // an empty name is no name
    if (/aria-label|aria-labelledby|\bid=|\{\.\.\./.test(attrs)) continue;
    const before = src.slice(0, m.index);
    if (before.lastIndexOf('<label') > before.lastIndexOf('</label>')) continue;
    if (before.lastIndexOf('<Field ') > before.lastIndexOf('</Field>')) continue;
    found.push(before.split('\n').length);
  }
  return found;
}

describe('form fields have a name', () => {
  it('finds no unnamed input / textarea / select in components/ and app/', () => {
    const bad: string[] = [];
    for (const f of [...walk('components'), ...walk('app')]) {
      for (const line of unnamedFields(readFileSync(f, 'utf8'))) bad.push(`${f}:${line}`);
    }
    expect(bad).toEqual([]);
  });
  it('the detector catches a bare field and accepts named ones', () => {
    expect(unnamedFields('<input type="text" placeholder="Search" onChange={(e) => f(e)} />')).toEqual([1]);
    expect(unnamedFields('<input aria-label="Search" placeholder="Search" onChange={(e) => f(e)} />')).toEqual([]);
    expect(unnamedFields('<label>Name <input value={v} /></label>')).toEqual([]);
    expect(unnamedFields('<Field label="x"><select value={v}></select></Field>')).toEqual([]);
    expect(unnamedFields('<input aria-label="" />')).toEqual([1]);
    expect(unnamedFields('<input type="checkbox" />')).toEqual([]);
    expect(unnamedFields('<textarea\n rows={3}\n/>')).toEqual([1]);
  });
});
