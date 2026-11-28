'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { searchNav, type NavEntry } from '@/lib/admin-nav';

// "Jump to" box: type a few letters (Arabic or English), pick a section. Opened from the header button or Ctrl/Cmd+K.
export default function QuickNav({ entries, onPick, onClose }: { entries: NavEntry[]; onPick: (e: NavEntry) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchNav(q, entries), [q, entries]);
  const at = Math.min(i, Math.max(0, results.length - 1));

  useEffect(() => { input.current?.focus(); }, []);

  const onKey = (ev: React.KeyboardEvent) => {
    if (ev.key === 'Escape') { ev.preventDefault(); onClose(); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); setI((n) => Math.min(n + 1, results.length - 1)); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setI((n) => Math.max(n - 1, 0)); }
    else if (ev.key === 'Enter' && results[at]) { ev.preventDefault(); onPick(results[at]); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh]" onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="انتقل بسرعة" onKeyDown={onKey} className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <input
          ref={input} type="text" value={q} onChange={(ev) => { setQ(ev.target.value); setI(0); }}
          placeholder="🔎 اكتب اسم القسم… (مثلًا: هوية، payouts، سعر)" aria-label="ابحث عن قسم في الأدمن"
          className="w-full border-b border-border bg-background px-4 py-3 text-foreground outline-none"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-1">
          {results.map((r, n) => (
            <li key={`${r.tab}/${r.sub ?? ''}`}>
              <button type="button" onClick={() => onPick(r)} onMouseEnter={() => setI(n)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-sm ${n === at ? 'bg-accent text-black' : 'text-foreground hover:bg-muted'}`}>
                <span aria-hidden>{r.icon}</span>
                <span className="flex-1 font-semibold">{r.label}</span>
                <span className="text-xs opacity-70" dir="ltr">{r.en}</span>
              </button>
            </li>
          ))}
          {!results.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">مفيش قسم بالاسم ده</li>}
        </ul>
      </div>
    </div>
  );
}
