import { describe, it, expect } from 'vitest';
import { blockedSource, pagePath, normalizeCspReport } from '@/lib/csp-report';

describe('csp report', () => {
  it('reduces a blocked uri to its host', () => {
    expect(blockedSource('https://cdn.Example.com/a.js?token=secret')).toBe('cdn.example.com');
    expect(blockedSource('')).toBe('inline');
    expect(blockedSource('eval')).toBe('eval');
    expect(blockedSource('data')).toBe('data');
    expect(blockedSource('not a url')).toBe('unknown');
  });
  it('keeps only the page path, never the query', () => {
    expect(pagePath('https://x.app/buy?id=1&token=abc')).toBe('/buy');
    expect(pagePath('garbage')).toBe('/');
  });
  it('normalises a legacy report', () => {
    expect(normalizeCspReport({ 'csp-report': { 'effective-directive': 'script-src-elem', 'blocked-uri': 'https://evil.test/x.js', 'document-uri': 'https://x.app/admin?a=1' } }))
      .toEqual({ directive: 'script-src-elem', blocked: 'evil.test', page: '/admin' });
    expect(normalizeCspReport({ 'csp-report': { 'violated-directive': 'img-src https:', 'blocked-uri': 'inline' } }))
      .toEqual({ directive: 'img-src', blocked: 'inline', page: '/' });
  });
  it('rejects anything that is not a report', () => {
    expect(normalizeCspReport(null)).toBeNull();
    expect(normalizeCspReport({})).toBeNull();
    expect(normalizeCspReport({ 'csp-report': {} })).toBeNull();
    expect(normalizeCspReport('x')).toBeNull();
  });
});
