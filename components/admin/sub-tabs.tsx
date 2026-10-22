'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { keyTab, pickTab } from '@/lib/sub-tabs';
import { GOLD } from './admin-ui';

export type SubTab = { id: string; icon: string; label: string; badge?: number; render: () => ReactNode };

const KEY = 'admin-sub-';

// A tab bar for one admin section. Only the open tab is mounted, so closed
// sections do not load their data. The last open tab is remembered per browser.
export default function SubTabs({ storeKey, tabs }: { storeKey: string; tabs: SubTab[] }) {
  const ids = tabs.map((t) => t.id);
  const [active, setActive] = useState(ids[0] ?? '');
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setActive(pickTab(ids, localStorage.getItem(KEY + storeKey)));
    } catch {
      /* storage can be blocked: stay on the first tab */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey]);

  const open = (id: string) => {
    setActive(id);
    try {
      localStorage.setItem(KEY + storeKey, id);
    } catch {
      /* ignore */
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    const rtl = bar.current ? getComputedStyle(bar.current).direction === 'rtl' : false;
    const next = keyTab(ids, active, e.key, rtl);
    if (!next) return;
    e.preventDefault();
    open(next);
    requestAnimationFrame(() => bar.current?.querySelector<HTMLElement>(`[data-tab="${next}"]`)?.focus());
  };

  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div className="space-y-3">
      <div
        ref={bar}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKey}
        className="sticky top-[52px] z-[9] -mx-1 md:top-0 flex gap-1.5 overflow-x-auto bg-[#0a0a0a]/95 px-1 py-2 backdrop-blur"
      >
        {tabs.map((t) => {
          const on = t.id === current.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`st-${storeKey}-${t.id}`}
              data-tab={t.id}
              aria-selected={on}
              aria-controls={`sp-${storeKey}`}
              tabIndex={on ? 0 : -1}
              onClick={() => open(t.id)}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-bold transition"
              style={on ? { background: GOLD, color: '#111', borderColor: GOLD } : { background: '#141414', color: '#d1d5db', borderColor: '#2a2a2a' }}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
              {!!t.badge && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{t.badge}</span>}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`sp-${storeKey}`} aria-labelledby={`st-${storeKey}-${current.id}`} className="space-y-3">
        {current.render()}
      </div>
    </div>
  );
}
