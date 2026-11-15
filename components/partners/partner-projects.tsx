'use client';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { formatMoney } from '@/lib/format';
import { pt, countryName } from '@/lib/partners-i18n';
import { pp } from '@/lib/partner-projects-i18n';
import { MAX_PROJECTS } from '@/lib/partner-projects';
import { PartnerProjectForm, type MyProject } from './partner-project-form';

const TONE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground', pending: 'bg-amber-500/15 text-amber-500', approved: 'bg-emerald-500/15 text-emerald-500',
  rejected: 'bg-red-500/15 text-red-400', hidden: 'bg-muted text-muted-foreground',
};

// "My projects": the partner's own portfolio with its review status, and the editor.
export function PartnerProjects({ language }: { language: string }) {
  const { accessToken } = usePiAuth();
  const [projects, setProjects] = useState<MyProject[] | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [editing, setEditing] = useState<MyProject | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  const auth = { Authorization: `Bearer ${accessToken}` };

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/partners/projects', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      setProjects((await res.json()).projects as MyProject[]); setState('ready');
    } catch { setState('error'); }
  }, [accessToken]);
  useEffect(() => { void load(); }, [load]);

  const remove = async (p: MyProject) => {
    if (!window.confirm(pp('delConfirm', language))) return;
    try { await fetch(`/api/partners/projects?id=${encodeURIComponent(p.id)}`, { method: 'DELETE', headers: auth }); } catch { /* reloaded below */ }
    void load();
  };

  if (editing) {
    return <PartnerProjectForm language={language} project={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onDone={(m) => { setEditing(null); setNotice(m); void load(); }} />;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{pp('myProjects', language)}</h3>
          <p className="text-xs text-muted-foreground">{pp('myProjectsHint', language)}</p>
        </div>
        <button type="button" disabled={(projects?.length ?? 0) >= MAX_PROJECTS} onClick={() => { setNotice(''); setEditing('new'); }} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50">
          <Plus className="h-4 w-4" aria-hidden />{pp('addProject', language)}
        </button>
      </div>
      {notice && <p role="status" className="mt-3 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">{notice}</p>}
      <div className="mt-3">
        {state === 'loading' && <p className="text-sm text-muted-foreground">{pt('loading', language)}</p>}
        {state === 'error' && <p className="text-sm text-red-400">{pt('loadError', language)} <button type="button" onClick={() => { setState('loading'); void load(); }} className="underline">{pt('retry', language)}</button></p>}
        {state === 'ready' && projects?.length === 0 && <p className="text-sm text-muted-foreground">{pp('noProjects', language)}</p>}
        {state === 'ready' && !!projects?.length && (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.id} className="flex gap-3 rounded-lg border border-border p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">{p.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[p.status]}`}>{pp(`st_${p.status}`, language)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pp(`k_${p.kind}`, language)} · {p.city}, {countryName(p.country, language)} · {formatMoney(p.price, p.currency, language)}</p>
                  {p.note && (p.status === 'rejected' || p.status === 'hidden') && <p className="mt-1 text-xs text-red-400">{pp('teamNote', language)}: {p.note}</p>}
                  {p.status === 'hidden' && <p className="mt-1 text-xs text-muted-foreground">{pp('lockedMsg', language)}</p>}
                  {p.status !== 'hidden' && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => { setNotice(''); setEditing(p); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:border-accent"><Pencil className="h-3.5 w-3.5" aria-hidden />{pp('edit', language)}</button>
                      <button type="button" onClick={() => void remove(p)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-red-400 hover:border-red-400"><Trash2 className="h-3.5 w-3.5" aria-hidden />{pp('del', language)}</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
