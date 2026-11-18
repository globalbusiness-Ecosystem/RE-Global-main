'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NavLanguage } from '@/lib/nav-i18n';
import { TOUR_I18N } from '@/lib/tour-i18n';
import { TOUR_EVENT, isTourDone, markTourDone } from '@/lib/tour';

type Box = { top: number; left: number; width: number; height: number };

// A guided tour that starts by itself the first time someone opens the home page (once per device), spotlights each
// part of the app in turn, and can be replayed from the guide page. It waits while a lock or confirm dialog is open.
export default function AppTour({ language }: { language: NavLanguage }) {
  const t = TOUR_I18N[language] ?? TOUR_I18N.en;
  const rtl = language === 'ar' || language === 'ur';
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const step = t.steps[i];

  const close = useCallback(() => { markTourDone(); setActive(false); }, []);

  // First visit: start once nothing else is covering the screen.
  useEffect(() => {
    if (isTourDone()) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const busy = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!busy && document.visibilityState === 'visible') { window.clearInterval(timer); setI(0); setActive(true); }
      else if (tries > 90) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Replay on request.
  useEffect(() => {
    const go = () => { setI(0); setActive(true); };
    window.addEventListener(TOUR_EVENT, go);
    return () => window.removeEventListener(TOUR_EVENT, go);
  }, []);

  // Find the part of the app this step points at; steps whose target is missing show as a centred card.
  const measure = useCallback(() => {
    const sel = t.steps[i]?.target;
    const el = sel ? document.querySelector(sel) : null;
    if (!el) { setBox(null); return; }
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) { setBox(null); return; }
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [i, t]);

  useEffect(() => {
    if (!active) return;
    const sel = t.steps[i]?.target;
    const el = sel ? document.querySelector(sel) : null;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    measure();
    const later = window.setTimeout(measure, 450);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { window.clearTimeout(later); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [active, i, t, measure]);

  useEffect(() => {
    if (!active) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [active, close]);

  if (!active || !step) return null;
  const last = i === t.steps.length - 1;
  const below = box ? box.top < window.innerHeight / 2 : false;
  const pad = 6;
  const cardStyle: React.CSSProperties = box
    ? {
        position: 'fixed',
        left: Math.min(Math.max(12, box.left + box.width / 2 - 170), Math.max(12, window.innerWidth - 352)),
        ...(below ? { top: box.top + box.height + pad + 12 } : { bottom: window.innerHeight - box.top + pad + 12 }),
        width: Math.min(340, window.innerWidth - 24),
      }
    : { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: Math.min(340, window.innerWidth - 24) };

  return (
    <div role="dialog" aria-modal="true" aria-label={step.title} dir={rtl ? 'rtl' : 'ltr'} className="fixed inset-0 z-[110]">
      {/* Blocks taps on the page behind while the tour runs */}
      <div className={`absolute inset-0 ${box ? '' : 'bg-black/70'}`} onClick={(e) => e.stopPropagation()} />
      {box && (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-2xl border-2 border-accent transition-all duration-300"
          style={{ top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: box.height + pad * 2, boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)' }}
        />
      )}
      <div style={cardStyle} className="rounded-2xl border border-accent/50 bg-card p-4 text-foreground shadow-2xl">
        <p className="mb-1 text-[11px] text-muted-foreground">{i + 1} {t.stepOf} {t.steps.length}</p>
        <h4 className="mb-1 text-base font-bold">{step.title}</h4>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
        <div className="flex items-center gap-2">
          {!last && <button type="button" onClick={close} className="text-xs text-muted-foreground underline">{t.skip}</button>}
          <span className="flex-1" />
          {i > 0 && <button type="button" onClick={() => setI(i - 1)} className="rounded-full border border-border px-4 py-1.5 text-sm">{t.back}</button>}
          <button type="button" onClick={() => (last ? close() : setI(i + 1))} className="rounded-full bg-accent px-5 py-1.5 text-sm font-semibold text-black">{last ? t.done : t.next}</button>
        </div>
      </div>
    </div>
  );
}
