'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { idleState, type IdleState } from '@/lib/idle';

const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;

// Signs the admin out after 20 minutes without activity, with a 60-second warning first.
export default function IdleGuard({ onTimeout }: { onTimeout: () => void }) {
  const last = useRef(Date.now());
  const fired = useRef(false);
  const [state, setState] = useState<IdleState>({ phase: 'active', secondsLeft: 0 });

  const tick = useCallback(() => {
    const s = idleState(Date.now(), last.current);
    setState((cur) => (cur.phase === s.phase && (s.phase !== 'warning' || cur.secondsLeft === s.secondsLeft) ? cur : s));
    if (s.phase === 'expired' && !fired.current) {
      fired.current = true;
      onTimeout();
    }
  }, [onTimeout]);

  useEffect(() => {
    const touch = () => { if (!fired.current) last.current = Date.now(); };
    EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(tick, 1000);
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [tick]);

  if (state.phase !== 'warning') return null;
  return (
    <div className="fixed inset-x-3 bottom-24 z-50 flex items-center justify-between gap-3 rounded-xl border border-[#d4af37] bg-[#141414] p-3 text-sm text-white shadow-lg md:bottom-6 md:left-auto md:right-6 md:max-w-sm" role="alert" dir="rtl">
      <span>هتخرج تلقائياً بعد {state.secondsLeft} ثانية لعدم النشاط.</span>
      <button type="button" onClick={() => { last.current = Date.now(); tick(); }} className="rounded-lg bg-[#d4af37] px-3 py-1.5 font-semibold text-black">ابقَ متصل</button>
    </div>
  );
}
