'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { VerifiedBadge } from '@/components/verified-badge';
import { celebrationStrings } from '@/lib/celebration-i18n';
import { SPEECH_LANG, type CelebrationKind, type KindSettings } from '@/lib/celebration';
import { playAudioUrl, speak, startMusic, stopSpeaking, type SoundHandle } from '@/lib/celebration-sound';
import type { BadgeLevel } from '@/lib/badge-level';

type Props = {
  kind: CelebrationKind;
  language: string;
  level: BadgeLevel;
  name?: string | null;
  settings: KindSettings & { voice?: boolean; voiceUrl?: string | null };
  greeting?: string;
  onClose: () => void;
};

const FLOWERS = ['🌸', '🌹', '🌷', '🌺', '🌼', '💐'];
const CONFETTI = ['#d4af37', '#f6e08a', '#e11d48', '#3b82f6', '#10b981', '#a855f7', '#f59e0b'];

/** Full-screen celebration: falling flowers and confetti, soft music, and (for the founder) a spoken greeting. Tap anywhere to close. */
export function CelebrationOverlay({ kind, language, level, name, settings, greeting, onClose }: Props) {
  const t = celebrationStrings(language);
  const founder = kind === 'founder';
  const [needsTap, setNeedsTap] = useState(false);
  const handles = useRef<SoundHandle[]>([]);
  const timers = useRef<number[]>([]);

  const reduced = useMemo(() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } }, []);
  const pieces = useMemo(() => {
    if (reduced) return [];
    const n = founder ? 70 : 34;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      flower: i % 3 !== 0,
      glyph: FLOWERS[i % FLOWERS.length],
      color: CONFETTI[i % CONFETTI.length],
      left: Math.round(Math.random() * 100),
      size: 14 + Math.round(Math.random() * (founder ? 22 : 14)),
      dur: 5 + Math.random() * 5,
      delay: Math.random() * (founder ? 5 : 3),
    }));
  }, [founder, reduced]);

  const stopAll = useCallback(() => {
    handles.current.forEach((h) => h.stop());
    handles.current = [];
    timers.current.forEach((x) => window.clearTimeout(x));
    timers.current = [];
    stopSpeaking();
  }, []);

  const start = useCallback(() => {
    stopAll();
    const vol = settings.volume / 100;
    if (settings.music && vol > 0) {
      const h = settings.musicUrl ? playAudioUrl(settings.musicUrl, vol) : startMusic(vol, { grand: founder, seconds: founder ? 14 : 10 });
      if (h) handles.current.push(h);
    }
    if (founder && settings.voice && vol > 0 && greeting) {
      // A moment after the fanfare begins.
      timers.current.push(window.setTimeout(() => {
        if (settings.voiceUrl) { const v = playAudioUrl(settings.voiceUrl, Math.min(1, vol + 0.3)); handles.current.push(v); }
        else speak(greeting, SPEECH_LANG[language] ?? 'en-US', Math.min(1, vol + 0.3));
      }, 1300));
    }
    // If the browser keeps the sound closed, ask for a tap (the tap is the permission).
    timers.current.push(window.setTimeout(() => setNeedsTap(handles.current.some((h) => h.blocked())), 700));
  }, [founder, greeting, language, settings.music, settings.musicUrl, settings.voice, settings.voiceUrl, settings.volume, stopAll]);

  useEffect(() => {
    start();
    const auto = window.setTimeout(onClose, founder ? 16_000 : 11_000);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(auto); window.removeEventListener('keydown', onKey); stopAll(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div role="dialog" aria-modal="true" aria-label={founder ? (greeting ?? t.founderSub) : t.userTitle} onClick={onClose} className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-black/80 p-4">
      <style>{`@keyframes rg-fall{0%{transform:translate3d(0,-12vh,0) rotate(0deg);opacity:0}8%{opacity:1}100%{transform:translate3d(24px,112vh,0) rotate(720deg);opacity:.9}}@keyframes rg-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}@keyframes rg-glow{0%,100%{box-shadow:0 0 30px 6px rgba(212,175,55,.35)}50%{box-shadow:0 0 70px 18px rgba(212,175,55,.6)}}`}</style>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {pieces.map((p) => p.flower
          ? <span key={p.id} className="absolute top-0 select-none" style={{ left: `${p.left}%`, fontSize: p.size, animation: `rg-fall ${p.dur}s linear ${p.delay}s infinite` }}>{p.glyph}</span>
          : <span key={p.id} className="absolute top-0 rounded-[2px]" style={{ left: `${p.left}%`, width: p.size / 2, height: p.size / 1.4, background: p.color, animation: `rg-fall ${p.dur}s linear ${p.delay}s infinite` }} />)}
      </div>

      <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-sm rounded-3xl border p-7 text-center ${founder ? 'border-[#d4af37] bg-gradient-to-b from-[#241c06] to-[#0e0b02]' : 'border-border bg-card'}`}
        style={{ animation: reduced ? undefined : `rg-pop .7s ease-out both${founder ? ', rg-glow 2.4s ease-in-out infinite' : ''}` }}>
        <button type="button" onClick={onClose} aria-label={t.close} className="absolute end-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" aria-hidden /></button>
        {founder && <div aria-hidden className="mb-1 text-6xl">👑</div>}
        <div className="mb-3 flex justify-center"><VerifiedBadge language={language} level={level} size={founder ? 64 : 76} /></div>
        {founder ? (
          <>
            <h2 className="text-2xl font-extrabold leading-snug text-[#f6e08a]" dir="auto">{greeting}</h2>
            {name && <p className="mt-2 text-lg font-bold text-white" dir="auto">{name}</p>}
            <p className="mt-1 text-sm text-[#d4af37]">{t.founderSub}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-foreground">{t.userTitle}</h2>
            {name && <p className="mt-2 text-base font-bold text-accent" dir="auto">{name}</p>}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.userBody}</p>
          </>
        )}
        {needsTap && (
          <button type="button" onClick={() => { setNeedsTap(false); start(); }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
            <Volume2 className="h-4 w-4" aria-hidden />{t.tapSound}
          </button>
        )}
      </div>
    </div>
  );
}
