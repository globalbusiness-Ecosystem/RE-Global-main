import type { Founder } from './founder';
import { founderVisible } from './founder';

// The facts search engines read to connect the founder's name with the platform: an Organization, a WebSite and,
// when the founder card is on, a Person whose address (/about#founder) is the same on every page that mentions them.
export const ORG_NAME = 'RE Global';
export const ORG_ALT_NAMES = ['RE Platform', 'GlobalBusiness Ecosystem'];

const pick = (t: { en?: string; ar?: string } | null | undefined) => t?.en || t?.ar || undefined;

export function founderPerson(base: string, f: Founder) {
  const same = [f.linkedin, f.website].filter((x): x is string => !!x);
  return {
    '@type': 'Person',
    '@id': `${base}/about#founder`,
    name: f.name,
    ...(pick(f.role) ? { jobTitle: pick(f.role) } : {}),
    ...(f.photoUrl ? { image: f.photoUrl } : {}),
    url: `${base}/about`,
    ...(same.length ? { sameAs: same } : {}),
    worksFor: { '@id': `${base}/#org` },
  };
}

export function siteJsonLd(base: string, f: Founder) {
  const withFounder = founderVisible(f);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#org`,
        name: ORG_NAME,
        alternateName: ORG_ALT_NAMES,
        url: base,
        logo: { '@type': 'ImageObject', url: `${base}/icon-512.png` },
        ...(withFounder ? { founder: { '@id': `${base}/about#founder` } } : {}),
      },
      { '@type': 'WebSite', '@id': `${base}/#website`, url: base, name: ORG_NAME, publisher: { '@id': `${base}/#org` } },
      ...(withFounder ? [founderPerson(base, f)] : []),
    ],
  };
}

/** The /about page: the same graph plus a ProfilePage whose main subject is the founder. */
export function aboutJsonLd(base: string, f: Founder, description: string) {
  const g = siteJsonLd(base, f);
  if (!founderVisible(f)) return g;
  return { ...g, '@graph': [...g['@graph'], { '@type': 'ProfilePage', '@id': `${base}/about#page`, url: `${base}/about`, name: `${f.name} | ${ORG_NAME}`, description, mainEntity: { '@id': `${base}/about#founder` }, isPartOf: { '@id': `${base}/#website` } }] };
}

/** JSON for a <script type="application/ld+json">: "<" is escaped so a stored value can never close the tag. */
export const ldString = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

/** Meta description of the home page, with the founder's name once the card is on. */
export function homeDescription(base: string, f: Founder) {
  return founderVisible(f) ? `${base} Founded by ${f.name}.` : base;
}
