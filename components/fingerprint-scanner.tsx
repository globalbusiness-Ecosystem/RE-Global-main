'use client';
import { Fingerprint, Check, X } from 'lucide-react';
import { useLockImage } from '@/hooks/use-lock-image';

export type ScanState = 'idle' | 'scanning' | 'success' | 'error';

// A big round fingerprint button in the style of banking / wallet apps: pulses while waiting, sweeps a scan line and sends out rings while the
// device is reading, turns green with a tick on success and shakes red on failure. The animation stops for people who asked for less motion.
export function FingerprintScanner({ state, onPress, label, disabled, size = 128 }: { state: ScanState; onPress: () => void; label: string; disabled?: boolean; size?: number }) {
  const { imageUrl } = useLockImage(); // the admin's picture (e.g. the key) instead of the plain fingerprint icon
  const tone = state === 'success' ? 'var(--scan-ok)' : state === 'error' ? 'var(--scan-bad)' : 'var(--scan-accent)';
  return (
    <div className="flex flex-col items-center gap-3">
      <style>{`
        .fp-root{--scan-accent:var(--accent,#d4af37);--scan-ok:#22c55e;--scan-bad:#ef4444}
        @keyframes fp-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--scan-accent) 35%,transparent)}50%{box-shadow:0 0 0 14px transparent}}
        @keyframes fp-ring{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.7);opacity:0}}
        @keyframes fp-sweep{0%{top:8%}50%{top:88%}100%{top:8%}}
        @keyframes fp-pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes fp-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
        .fp-idle{animation:fp-pulse 2.4s ease-in-out infinite}
        .fp-ring{animation:fp-ring 1.6s ease-out infinite}
        .fp-ring2{animation:fp-ring 1.6s ease-out .8s infinite}
        .fp-sweep{animation:fp-sweep 1.5s ease-in-out infinite}
        .fp-pop{animation:fp-pop .45s ease-out both}
        .fp-shake{animation:fp-shake .45s ease-in-out}
        @media (prefers-reduced-motion:reduce){.fp-idle,.fp-ring,.fp-ring2,.fp-sweep,.fp-pop,.fp-shake{animation:none}}
      `}</style>
      <div className="fp-root relative" style={{ width: size, height: size }}>
        {state === 'scanning' && (<><span aria-hidden className="fp-ring absolute inset-0 rounded-full border-2" style={{ borderColor: tone }} /><span aria-hidden className="fp-ring2 absolute inset-0 rounded-full border-2" style={{ borderColor: tone }} /></>)}
        <button type="button" onClick={onPress} disabled={disabled || state === 'scanning'} aria-label={label}
          className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 bg-background transition-colors disabled:cursor-wait ${state === 'idle' ? 'fp-idle' : ''} ${state === 'error' ? 'fp-shake' : ''}`}
          style={{ borderColor: tone, color: tone }}>
          {state === 'success' ? <Check key="ok" className="fp-pop" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={3} aria-hidden />
            : state === 'error' ? <X style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={3} aria-hidden />
            : imageUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={imageUrl} alt="" aria-hidden draggable={false} className="h-full w-full rounded-full object-cover" />
            : <Fingerprint style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={1.4} aria-hidden />}
          {state === 'scanning' && <span aria-hidden className="fp-sweep absolute inset-x-3 h-0.5 rounded-full" style={{ background: tone, boxShadow: `0 0 10px ${tone}` }} />}
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm" style={{ color: state === 'idle' || state === 'scanning' ? undefined : tone }}>{label}</p>
    </div>
  );
}
