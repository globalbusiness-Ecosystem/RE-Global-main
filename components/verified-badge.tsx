import type { NavLanguage } from '@/lib/nav-i18n';
import { kl } from '@/lib/kyc-labels';

// A rosette of 16 points (alternating long and short), drawn once; the rounded stroke softens the corners into a seal.
const SEAL = Array.from({ length: 16 }, (_, k) => {
  const a = (Math.PI * 2 * k) / 16 - Math.PI / 2;
  const r = k % 2 === 0 ? 11 : 9.2;
  return `${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

/** The gold "verified" seal that sits right after a person's name, like on the big global platforms. */
export function VerifiedBadge({ language = 'en', size = 18, className = '' }: { language?: NavLanguage; size?: number; className?: string }) {
  const label = kl('verifiedBadge', language);
  return (
    <svg role="img" aria-label={label} width={size} height={size} viewBox="0 0 24 24" className={`inline-block shrink-0 ${className}`}>
      <title>{label}</title>
      <defs>
        <linearGradient id="rg-gold-seal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e08a" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#a8821c" />
        </linearGradient>
      </defs>
      <polygon points={SEAL} fill="url(#rg-gold-seal)" stroke="url(#rg-gold-seal)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.6 12.4l3 3 5.8-6.2" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
