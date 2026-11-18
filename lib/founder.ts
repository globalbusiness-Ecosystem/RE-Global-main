import { FEATURE_LANGS, type FeatureText } from './home-features';
import { parseLogoUrl } from './branding';

// The founder card on the "About us" page: a photo and words the founder writes. (Which account is the founder is kept
// separately and never sent to visitors; see lib/founder-server.ts.)
export type Founder = {
  enabled: boolean;
  name: string | null;
  photoUrl: string | null;
  role: FeatureText | null;
  bio: FeatureText | null;
  quote: FeatureText | null;
  linkedin: string | null;
  website: string | null;
};
export const DEFAULT_FOUNDER: Founder = { enabled: true, name: null, photoUrl: null, role: null, bio: null, quote: null, linkedin: null, website: null };

export const MAX_FOUNDER_NAME = 60;
export const MAX_FOUNDER_ROLE = 90;
export const MAX_FOUNDER_BIO = 1500;
export const MAX_FOUNDER_QUOTE = 240;

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '');

function parseText(v: unknown, max: number): FeatureText | null {
  if (!v || typeof v !== 'object') return null;
  const out: FeatureText = {};
  for (const l of FEATURE_LANGS) {
    const x = (v as Record<string, unknown>)[l];
    if (typeof x === 'string') { const s = x.replace(/\r\n/g, '\n').trim(); if (s && s.length <= max) out[l] = s; }
  }
  return out.en || out.ar ? out : null;
}

/** LinkedIn address: https only, and it must really be on linkedin.com. */
export function parseLinkedIn(v: unknown): string | null {
  const u = parseLogoUrl(v);
  if (!u) return null;
  const h = new URL(u).hostname.toLowerCase();
  return h === 'linkedin.com' || h.endsWith('.linkedin.com') ? u : null;
}

export function parseFounder(data: unknown): Founder {
  const d = (data ?? {}) as Record<string, unknown>;
  return {
    enabled: typeof d.enabled === 'boolean' ? d.enabled : true,
    name: clean(d.name, MAX_FOUNDER_NAME) || null,
    photoUrl: parseLogoUrl(d.photoUrl),
    role: parseText(d.role, MAX_FOUNDER_ROLE),
    bio: parseText(d.bio, MAX_FOUNDER_BIO),
    quote: parseText(d.quote, MAX_FOUNDER_QUOTE),
    linkedin: parseLinkedIn(d.linkedin),
    website: parseLogoUrl(d.website),
  };
}

/** Visitors see the card only when it is on and has a name. */
export const founderVisible = (f: Founder) => f.enabled && !!f.name;
