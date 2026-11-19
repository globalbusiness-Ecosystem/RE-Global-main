'use client';

import { useEffect, useState } from 'react';
import { Pencil, RefreshCw } from 'lucide-react';
import { VerifiedBadge } from '@/components/verified-badge';
import { authHeaders } from '@/lib/api-token';
import { announceName } from '@/hooks/use-identity';
import { nameStrings } from '@/lib/display-name-i18n';
import { NAME_MAX } from '@/lib/display-name';
import type { BadgeLevel } from '@/lib/badge-level';

const VIEW_KEY = 'rg_profile_line_v1';

/**
 * The line under the profile picture: the person's name, or their invite code. The round two-arrow button switches between
 * them (remembered on this device); the pencil edits the name. The seal stays beside whatever is shown.
 */
export function ProfileIdentityLine({ language, name, code, showBadge, level, canEdit }: { language: string; name: string; code: string | null; showBadge: boolean; level: BadgeLevel; canEdit: boolean }) {
  const t = nameStrings(language);
  const [view, setView] = useState<'name' | 'code'>('name');
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { try { if (localStorage.getItem(VIEW_KEY) === 'code') setView('code'); } catch { /* private mode */ } }, []);
  const showing: 'name' | 'code' = view === 'code' && code ? 'code' : 'name';
  const flip = () => {
    const next = showing === 'name' ? 'code' : 'name';
    setView(next);
    try { localStorage.setItem(VIEW_KEY, next); } catch { /* private mode */ }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/display-name', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ name: input }) });
      const j = await r.json().catch(() => null);
      if (r.ok && typeof j?.name === 'string') { announceName(j.name); setMsg({ ok: true, text: t.saved }); setTimeout(() => setOpen(false), 700); return; }
      if (j?.error === 'invalid') setMsg({ ok: false, text: t.invalid });
      else if (j?.error === 'taken') setMsg({ ok: false, text: t.taken });
      else if (j?.error === 'cooldown') setMsg({ ok: false, text: t.cooldown.replace('{d}', String(Math.max(1, Math.ceil(((Number(j.nextChangeAt) || Date.now()) - Date.now()) / 86_400_000)))) });
      else setMsg({ ok: false, text: t.failed });
    } catch { setMsg({ ok: false, text: t.failed }); } finally { setBusy(false); }
  };

  const btn = 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent';
  return (
    <>
      <p className="flex min-w-0 items-center justify-center gap-1.5 text-lg font-bold text-foreground">
        {showing === 'code'
          ? <span dir="ltr" className="truncate font-mono tracking-wider" aria-label={t.inviteCode}>{code}</span>
          : <span className="truncate">{name}</span>}
        {showBadge && <VerifiedBadge language={language} level={level} />}
      </p>
      <div className="mt-1 flex items-center justify-center gap-2">
        {showing === 'code' && <span className="text-[11px] text-muted-foreground">{t.inviteCode}</span>}
        <button type="button" onClick={flip} disabled={!code && showing === 'name'} title={showing === 'name' ? (code ? t.showCode : t.codeSoon) : t.showName} aria-label={showing === 'name' ? t.showCode : t.showName} className={btn}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        </button>
        {canEdit && (
          <button type="button" onClick={() => { setInput(name); setMsg(null); setOpen(true); }} title={t.edit} aria-label={t.edit} className={btn}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={t.title} onClick={(e) => e.stopPropagation()} className="w-full rounded-t-2xl border border-border bg-card p-5 text-start sm:max-w-sm sm:rounded-2xl">
            <h3 className="mb-3 text-base font-bold text-foreground">{t.title}</h3>
            <label htmlFor="display-name-input" className="mb-1 block text-xs text-muted-foreground">{t.label}</label>
            <input id="display-name-input" value={input} maxLength={NAME_MAX} onChange={(e) => setInput(e.target.value)} dir="auto" autoFocus className="w-full rounded-lg bg-muted px-3 py-2.5 text-sm text-foreground" />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{t.hint}</p>
            {msg && <p role="status" className={`mt-2 text-xs ${msg.ok ? 'text-emerald-500' : 'text-red-400'}`}>{msg.text}</p>}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => void save()} disabled={busy || input.trim().length < 2} className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50">{t.save}</button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-sm text-foreground hover:border-accent">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
