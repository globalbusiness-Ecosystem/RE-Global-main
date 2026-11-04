import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CONTRACT_UI_LABELS, cu, type ContractUiKey } from '@/lib/contract-ui-labels';
import { checkContractFile, contractErrorKey, buildContractRequest, contractInputError, CLIENT_MAX_FILE_BYTES } from '@/lib/contract-client';
import { parseMiniMarkdown, parseInline } from '@/lib/mini-markdown';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const holes = (s: string) => (s.match(/\{[a-z]+\}/g) ?? []).sort().join(',');
const rows = Object.entries(CONTRACT_UI_LABELS) as [string, Record<string, string>][];

describe('contract panel labels', () => {
  it('has every text in all 7 languages, none empty, same placeholders; ar/ur/zh differ from English', () => {
    for (const [key, row] of rows) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) {
        expect(row[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
        expect(holes(row[l]), `${key}.${l}`).toBe(holes(row.en));
      }
      for (const l of ['ar', 'ur', 'zh']) expect(row[l], `${key}.${l}`).not.toBe(row.en);
    }
  });
  it('fills names and counts and falls back to English', () => {
    expect(cu('chosen', 'fr', { name: 'a.pdf' })).toBe('Sélectionné : a.pdf');
    expect(cu('userText', 'ar', { count: 120 })).toContain('120');
    expect(cu('analyze', 'xx')).toBe('Analyze contract');
    expect(cu('analyze', undefined)).toBe('Analyze contract');
    expect(cu('analyze', 'toString')).toBe('Analyze contract');
  });
});

describe('contract client rules', () => {
  it('accepts PDF, images and TXT and refuses other types', () => {
    expect(checkContractFile({ name: 'c.PDF', type: '', size: 1000 })).toEqual({ ok: true, kind: 'pdf' });
    expect(checkContractFile({ name: 'c', type: 'application/pdf', size: 1000 })).toEqual({ ok: true, kind: 'pdf' });
    expect(checkContractFile({ name: 'p.jpeg', type: 'image/jpeg', size: 1000 })).toEqual({ ok: true, kind: 'image' });
    expect(checkContractFile({ name: 'p.webp', type: '', size: 1000 })).toEqual({ ok: true, kind: 'image' });
    expect(checkContractFile({ name: 'c.txt', type: 'text/plain', size: 1000 })).toEqual({ ok: true, kind: 'txt' });
    expect(checkContractFile({ name: 'c.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1000 })).toEqual({ ok: false, error: 'errType' });
    expect(checkContractFile({ name: 'x.exe', type: 'application/octet-stream', size: 1000 })).toEqual({ ok: false, error: 'errType' });
    expect(checkContractFile({ name: 'x.svg', type: 'image/svg+xml', size: 1000 })).toEqual({ ok: false, error: 'errType' });
  });
  it('limits the PDF to 3 MB, the TXT to 200 KB, lets big camera photos through (they are scaled down)', () => {
    expect(checkContractFile({ name: 'c.pdf', type: 'application/pdf', size: CLIENT_MAX_FILE_BYTES + 1 })).toEqual({ ok: false, error: 'errTooBig' });
    expect(checkContractFile({ name: 'c.pdf', type: 'application/pdf', size: CLIENT_MAX_FILE_BYTES })).toMatchObject({ ok: true });
    expect(checkContractFile({ name: 'c.txt', type: 'text/plain', size: 300_000 })).toEqual({ ok: false, error: 'errTooBig' });
    expect(checkContractFile({ name: 'p.jpg', type: 'image/jpeg', size: 8 * 1024 * 1024 })).toMatchObject({ ok: true });
    expect(checkContractFile({ name: 'p.jpg', type: 'image/jpeg', size: 40 * 1024 * 1024 })).toEqual({ ok: false, error: 'errTooBig' });
  });
  it('maps every server answer to a message that exists in all languages', () => {
    const expected: Record<number, ContractUiKey> = { 401: 'errAuth', 403: 'errAuth', 413: 'errTooBig', 415: 'errType', 429: 'errBusy', 503: 'errNotConfigured', 400: 'errInvalid', 500: 'errFailed', 502: 'errFailed' };
    for (const [status, key] of Object.entries(expected)) {
      expect(contractErrorKey(Number(status))).toBe(key);
      expect(Object.keys(CONTRACT_UI_LABELS)).toContain(key);
    }
  });
  it('checks the text before sending and builds the request body', () => {
    expect(contractInputError({ text: '', hasFile: false })).toBe('errShort');
    expect(contractInputError({ text: 'short', hasFile: false })).toBe('errShort');
    expect(contractInputError({ text: 'x'.repeat(40_001), hasFile: false })).toBe('errLong');
    expect(contractInputError({ text: 'x'.repeat(100), hasFile: false })).toBeNull();
    expect(contractInputError({ text: '', hasFile: true })).toBeNull();
    expect(buildContractRequest({ language: 'fr', text: '  abc  ', question: ' ', file: null })).toEqual({ language: 'fr', text: 'abc' });
    const f = { mediaType: 'application/pdf', data: 'data:application/pdf;base64,AAAA' };
    expect(buildContractRequest({ language: 'ar', text: 'ignored', question: ' why? ', file: f })).toEqual({ language: 'ar', question: 'why?', file: f });
  });
});

describe('mini markdown', () => {
  it('reads headings, bullets, numbered items and paragraphs', () => {
    const blocks = parseMiniMarkdown('## Summary\nLine one\nline two\n\n- first\n* second\n1. third\n\n## Risks ##');
    expect(blocks.map((b) => b.type)).toEqual(['heading', 'paragraph', 'item', 'item', 'item', 'heading']);
    expect(blocks[1]).toMatchObject({ inline: [{ text: 'Line one line two', bold: false }] });
    expect(blocks[4]).toMatchObject({ marker: '1.' });
    expect(blocks[5]).toMatchObject({ inline: [{ text: 'Risks', bold: false }] });
  });
  it('handles bold, an unclosed ** and Arabic text', () => {
    expect(parseInline('a **b** c')).toEqual([{ text: 'a ', bold: false }, { text: 'b', bold: true }, { text: ' c', bold: false }]);
    expect(parseInline('a **b')).toEqual([{ text: 'a ', bold: false }, { text: 'b', bold: false }]);
    expect(parseMiniMarkdown('## الملخص\n- **خطر عالٍ**: غرامة')[1]).toMatchObject({ type: 'item' });
  });
  it('never produces markup: html stays plain text', () => {
    const blocks = parseMiniMarkdown('<script>alert(1)</script>\n- <img src=x onerror=alert(1)>');
    expect(JSON.stringify(blocks)).toContain('<script>');
    expect(blocks.every((b) => ['heading', 'item', 'paragraph'].includes(b.type))).toBe(true);
    expect(readFileSync('components/mini-markdown.tsx', 'utf8')).not.toMatch(/dangerouslySetInnerHTML|innerHTML/);
  });
});

describe('Aladdin chat wiring', () => {
  const chat = readFileSync('components/ai-advisor-chat.tsx', 'utf8');
  const panel = readFileSync('components/contract-panel.tsx', 'utf8');
  it('has the contract button and panel and shows rich answers with the disclaimer', () => {
    expect(chat).toContain('<ContractPanel');
    expect(chat).toContain("cu('openTitle', language)");
    expect(chat).toContain('<MiniMarkdown');
    expect(chat).toContain('message.disclaimer');
    expect(chat).toContain('handleContractAnalyzed');
  });
  it('the panel sends the user token, calls the contract API, and uses the labels for every message', () => {
    expect(panel).toContain("fetch('/api/analyze-contract'");
    expect(panel).toContain('authHeaders(');
    expect(panel).not.toMatch(/language === 'ar'|language !== 'ar'/);
    expect(panel).not.toMatch(/[؀-ۿ]/);
    for (const k of [...panel.matchAll(/cu\('([A-Za-z]+)'/g)].map((m) => m[1])) expect(Object.keys(CONTRACT_UI_LABELS), k).toContain(k);
  });
  it('the contract is never kept in the browser storage', () => {
    expect(panel).not.toMatch(/localStorage|sessionStorage|indexedDB/);
  });
});
