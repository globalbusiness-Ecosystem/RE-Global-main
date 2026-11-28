'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { keyTab, pickTab } from '@/lib/sub-tabs';
import { GOLD } from './admin-ui';
import { NAV_EVENT, SUB_STORE_PREFIX } from '@/lib/admin-nav';
import { useAdminLang } from './admin-lang';
import { subLabel } from '@/lib/admin-i18n';

type SubTab = { id: string; icon: string; label: string; badge?: number; render: () => ReactNode };

const KEY = SUB_STORE_PREFIX;

// A tab bar for one admin section. Only the open tab is mounted, so closed
// sections do not load their data. The last open tab is remembered per browser.
export default function SubTabs({ storeKey, tabs }: { storeKey: string; tabs: SubTab[] }) {
  const ids = tabs.map((t) => t.id);
  const [active, setActive] = useState(ids[0] ?? '');
  const { lang } = useAdminLang();
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

  // The "jump to" box asks a bar that is already open to switch tab.
  useEffect(() => {
    const on = (ev: Event) => {
      const d = (ev as CustomEvent<{ storeKey?: string; id?: string }>).detail;
      if (d?.storeKey === storeKey && d.id && ids.includes(d.id)) open(d.id);
    };
    window.addEventListener(NAV_EVENT, on);
    return () => window.removeEventListener(NAV_EVENT, on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey, ids.join('|')]);

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
        className="sticky top-[52px] z-[9] -mx-1 flex gap-1.5 overflow-x-auto bg-background/95 px-1 py-2 backdrop-blur md:static md:flex-wrap md:overflow-visible"
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
              style={on ? { background: GOLD, color: 'var(--accent-foreground)', borderColor: GOLD } : { background: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            >
              <span aria-hidden>{t.icon}</span>
              {subLabel(storeKey, t.id, lang, t.label)}
              {!!t.badge && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-foreground">{t.badge}</span>}
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
