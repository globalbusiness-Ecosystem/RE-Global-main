'use client';

import { useEffect, useState } from 'react';

export type SlotArt = 'front' | 'back' | 'passport' | 'selfie';

// Gold line drawings, in the same spirit as the sign-in look: corner brackets, a scan line, a card.
function Art({ art }: { art: SlotArt }) {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 30V14h16M130 14h16v16M146 80v16h-16M30 96H14V80" opacity="0.9" />
      {art === 'front' && (<>
        <rect x="32" y="30" width="96" height="52" rx="6" className="text-foreground" />
        <rect x="42" y="42" width="22" height="26" rx="3" /><circle cx="53" cy="50" r="4" /><path d="M46 66c1-6 13-6 14 0" />
        <path d="M72 44h40M72 54h32M72 64h22" className="text-foreground" strokeWidth="2" />
      </>)}
      {art === 'back' && (<>
        <rect x="32" y="30" width="96" height="52" rx="6" className="text-foreground" />
        <path d="M32 42h96" strokeWidth="9" opacity="0.55" />
        <path d="M42 58h30M42 68h44M96 56v18M102 56v18M108 56v18M114 56v18" className="text-foreground" strokeWidth="2" />
      </>)}
      {art === 'passport' && (<>
        <rect x="46" y="22" width="68" height="68" rx="6" className="text-foreground" />
        <circle cx="80" cy="50" r="12" /><path d="M68 50h24M80 38v24M72 42c5 5 11 5 16 0M72 58c5-5 11-5 16 0" strokeWidth="1.6" />
        <path d="M58 76h44M64 82h32" className="text-foreground" strokeWidth="2" />
      </>)}
      {art === 'selfie' && (<>
        <circle cx="64" cy="42" r="14" className="text-foreground" /><path d="M36 92c2-18 14-26 28-26s26 8 28 26" className="text-foreground" />
        <rect x="88" y="54" width="40" height="26" rx="4" /><path d="M95 64h18M95 71h12" strokeWidth="2" />
      </>)}
    </svg>
  );
}

type Props = {
  art: SlotArt;
  title: string;
  hint?: string;
  file?: File;
  onFile: (f: File | undefined) => void;
  addLabel: string;
  retakeLabel: string;
  selfie?: boolean;
};

// One tappable capture card: shows the drawing, then the photo itself with a green tick once chosen.
export function KycPhotoSlot({ art, title, hint, file, onFile, addLabel, retakeLabel, selfie }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <label className={`group relative block cursor-pointer overflow-hidden rounded-2xl border p-3 transition ${file ? 'border-emerald-500/60' : 'border-accent/40 hover:border-accent'} bg-card`}>
      <span className="block text-sm font-semibold">{title}</span>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      <span className="relative mt-2 block h-36 overflow-hidden rounded-xl bg-muted/70">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (<>
          <Art art={art} />
          <span className="kyc-scan" aria-hidden="true" />
        </>)}
        {file && <span className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow">✓</span>}
      </span>
      <span className="mt-2 block text-center text-xs font-medium text-accent">{file ? retakeLabel : addLabel}</span>
      <input
        type="file"
        accept="image/*"
        aria-label={title}
        {...(selfie ? { capture: 'user' as const } : {})}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </label>
  );
}
