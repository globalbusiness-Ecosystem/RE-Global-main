import type { NavLanguage } from '@/lib/nav-i18n';
import { kl } from '@/lib/kyc-labels';
import { BADGE_COLORS, badgeLevelLabel, parseBadgeLevel } from '@/lib/badge-level';

// A rosette of 16 points (alternating long and short), drawn once; the rounded stroke softens the corners into a seal.
const SEAL = Array.from({ length: 16 }, (_, k) => {
  const a = (Math.PI * 2 * k) / 16 - Math.PI / 2;
  const r = k % 2 === 0 ? 11 : 9.2;
  return `${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

/** The "verified" seal that sits right after a person's name. Its colour shows the activity level (1 to 7); with no level it is gold. */
export function VerifiedBadge({ language = 'en', size = 18, className = '', level }: { language?: string; size?: number; className?: string; level?: number }) {
  const lv = level === undefined ? 3 : parseBadgeLevel(level);
  const c = BADGE_COLORS[lv];
  const gid = `rg-seal-${lv}`;
  const label = level === undefined ? kl('verifiedBadge', language as NavLanguage) : `${kl('verifiedBadge', language as NavLanguage)} · ${badgeLevelLabel(lv, language)}`;
  return (
    <svg role="img" data-level={lv} aria-label={label} width={size} height={size} viewBox="0 0 24 24" className={`inline-block shrink-0 ${className}`}>
      <title>{label}</title>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.light} />
          <stop offset="0.5" stopColor={c.main} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <polygon points={SEAL} fill={`url(#${gid})`} stroke={`url(#${gid})`} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.6 12.4l3 3 5.8-6.2" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
