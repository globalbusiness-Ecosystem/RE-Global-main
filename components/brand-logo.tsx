'use client';

import { useBranding } from '@/hooks/use-branding';
import type { Branding } from '@/lib/branding';

// The built-in logo: gold RE monogram on deep violet. Shown until the admin uploads a logo.
function DefaultMark() {
  return (
    <svg viewBox="0 0 512 512" className="h-full w-full" role="img" aria-label="RE Platform">
      <defs>
        <linearGradient id="reBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a1a5e" /><stop offset="1" stopColor="#0c0820" /></linearGradient>
        <linearGradient id="reGold" gradientUnits="userSpaceOnUse" x1="120" y1="130" x2="404" y2="380"><stop offset="0" stopColor="#fbe7a1" /><stop offset=".55" stopColor="#e0b24a" /><stop offset="1" stopColor="#b7822a" /></linearGradient>
        <radialGradient id="reGlow" cx=".8" cy=".1" r=".75"><stop offset="0" stopColor="#8b5cf6" stopOpacity=".55" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="512" height="512" fill="url(#reBg)" />
      <rect width="512" height="512" fill="url(#reGlow)" />
      <g fill="url(#reGold)">
        <path fillRule="evenodd" d="M112 140H214A66 66 0 0 1 214 272H150V372H112ZM150 176V236H212A30 30 0 0 0 212 176Z" />
        <path d="M196 268H244L292 372H246Z" />
        <path d="M322 140H408V176H360V238H394V274H360V336H408V372H322Z" />
      </g>
      <path d="M410 70l24 24-24 24-24-24z" fill="#a78bfa" />
    </svg>
  );
}

type Props = {
  height: number;
  // "wide" keeps the 3:2 shape of a landscape logo; "square" crops to the middle.
  shape?: 'square' | 'wide';
  rounded?: string;
  className?: string;
  // The admin preview passes what is about to be saved.
  preview?: Branding;
};

export function BrandLogo({ height, shape = 'square', rounded = 'rounded-xl', className = '', preview }: Props) {
  const saved = useBranding();
  const b = preview ?? saved;
  const width = shape === 'wide' && b.logoUrl ? Math.round(height * 1.5) : height;
  return (
    <span
      className={`re-logo ${b.animated ? 're-logo-anim' : ''} ${rounded} ${className}`}
      style={{ height, width }}
    >
      {b.logoUrl ? (
        <img src={b.logoUrl} alt="RE Platform" className="h-full w-full object-cover" style={{ objectPosition: '56% 50%' }} draggable={false} />
      ) : (
        <DefaultMark />
      )}
    </span>
  );
}
