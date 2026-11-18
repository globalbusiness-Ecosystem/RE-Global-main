import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseFounder } from '@/lib/founder';
import { siteJsonLd, aboutJsonLd, ldString, founderPerson } from '@/lib/seo-site';

const src = (p: string) => readFileSync(p, 'utf8');
const base = 'https://example.com';
const named = parseFounder({ name: 'Elsayed Al-shaib', role: { en: 'Founder & CEO' }, photoUrl: 'https://cdn.x.com/a.webp', linkedin: 'https://www.linkedin.com/in/x' });

describe('search-engine data', () => {
  it('links the founder to the platform with one shared address', () => {
    const g = siteJsonLd(base, named)['@graph'];
    const org = g.find((x: any) => x['@type'] === 'Organization') as any;
    const person = g.find((x: any) => x['@type'] === 'Person') as any;
    expect(org.founder['@id']).toBe(`${base}/about#founder`);
    expect(person['@id']).toBe(`${base}/about#founder`);
    expect(person.name).toBe('Elsayed Al-shaib');
    expect(person.sameAs).toContain('https://www.linkedin.com/in/x');
    expect(person.worksFor['@id']).toBe(`${base}/#org`);
  });
  it('says nothing about a founder until the card is on and named', () => {
    expect(JSON.stringify(siteJsonLd(base, parseFounder({})))).not.toContain('Person');
    expect(JSON.stringify(siteJsonLd(base, parseFounder({ name: 'A', enabled: false })))).not.toContain('Person');
  });
  it('the About page adds a profile page about the founder', () => {
    const g = aboutJsonLd(base, named, 'x')['@graph'] as any[];
    expect(g.some((x) => x['@type'] === 'ProfilePage' && x.mainEntity['@id'] === `${base}/about#founder`)).toBe(true);
    expect(founderPerson(base, named).url).toBe(`${base}/about`);
  });
  it('a stored value can never close the script tag', () => {
    expect(ldString({ name: '</script><b>' })).not.toContain('</script>');
  });
});

describe('wiring', () => {
  it('the home page carries the data, the preview picture and optional search-console verification', () => {
    const l = src('app/layout.tsx');
    expect(l).toContain('<SiteJsonLd />');
    expect(l).toContain('/icon-512.png');
    expect(l).toContain('GOOGLE_SITE_VERIFICATION');
    expect(l).toContain('export const revalidate');
  });
  it('/about is a real page, in the sitemap, and never blocked', () => {
    expect(src('app/about/page.tsx')).toContain('aboutJsonLd');
    expect(src('app/sitemap.ts')).toContain('/about');
    expect(src('app/robots.ts')).not.toContain("'/about'");
  });
});
