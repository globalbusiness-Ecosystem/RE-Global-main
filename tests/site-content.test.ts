import { describe, it, expect } from 'vitest';
import { parseContent, isKind } from '@/lib/site-content';

describe('site content validation', () => {
  it('accepts a banner and normalises it', () => {
    const r = parseContent('banners', { title: ' Hello ', image: 'https://x.test/a.jpg', link: 'invest', order: '2' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.doc).toMatchObject({ title: 'Hello', link: 'invest', order: 2, active: true });
  });
  it('rejects bad banner input', () => {
    expect(parseContent('banners', { title: '' }).ok).toBe(false);
    expect(parseContent('banners', { title: 'a', image: 'javascript:alert(1)' }).ok).toBe(false);
    expect(parseContent('banners', { title: 'a', link: 'admin' }).ok).toBe(false);
  });
  it('validates partners', () => {
    expect(parseContent('partners', { name: 'Acme', logo: 'https://x.test/l.png', active: false }).ok).toBe(true);
    expect(parseContent('partners', { name: '' }).ok).toBe(false);
    expect(parseContent('partners', { name: 'A', website: 'ftp://x' }).ok).toBe(false);
  });
  it('only knows banners and partners', () => {
    expect(isKind('banners')).toBe(true);
    expect(isKind('users')).toBe(false);
  });
});
