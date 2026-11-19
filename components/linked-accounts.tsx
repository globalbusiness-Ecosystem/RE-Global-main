'use client';
import { useCallback, useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import { authHeaders } from '@/lib/api-token';
import { linkedStrings } from '@/lib/linked-accounts-i18n';

type Acc = { username: string; kind: 'pi' | 'web'; isMe: boolean; isPrimary: boolean };

// Links this person's Pi and web accounts. One account makes a short code, the other types it.
export function LinkedAccounts({ language }: { language: string }) {
  const t = linkedStrings(language);
  const [accounts, setAccounts] = useState<Acc[]>([]);
  const [linked, setLinked] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    fetch('/api/identity', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j) { setAccounts(Array.isArray(j.accounts) ? j.accounts : []); setLinked(!!j.linked); } })
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  const makeCode = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/identity/link-code', { method: 'POST', headers: authHeaders(), cache: 'no-store' });
      const j = await r.json().catch(() => null);
      if (r.ok && typeof j?.code === 'string') setCode(j.code); else setMsg({ ok: false, text: t.failed });
    } catch { setMsg({ ok: false, text: t.failed }); }
    setBusy(false);
  };

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/identity/link', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ code: input }) });
      const j = await r.json().catch(() => null);
      if (r.ok) { setInput(''); setCode(null); setMsg({ ok: true, text: t.done }); load(); }
      else {
        const e = j?.error;
        setMsg({ ok: false, text: e === 'invalid' ? t.invalid : e === 'self' ? t.self : e === 'already' ? t.already : e === 'both_linked' ? t.bothLinked : e === 'limit' ? t.limit : t.failed });
      }
    } catch { setMsg({ ok: false, text: t.failed }); }
    setBusy(false);
  };

  const unlink = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/identity', { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { setMsg({ ok: true, text: t.left }); load(); } else setMsg({ ok: false, text: t.failed });
    } catch { setMsg({ ok: false, text: t.failed }); }
    setBusy(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Link2 className="w-4 h-4 text-accent" aria-hidden />{t.title}</div>
      <p className="text-xs text-muted-foreground mt-1">{t.hint}</p>

      <p className="mt-3 text-xs font-medium text-foreground">{t.linked}</p>
      {linked ? (
        <ul className="mt-1 space-y-1">
          {accounts.map((a) => (
            <li key={a.username + a.kind} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span dir="ltr" className="truncate">{a.username}{a.isMe ? ` · ${t.me}` : ''}</span>
              <span className="text-[11px] text-muted-foreground shrink-0">{a.kind === 'pi' ? t.pi : t.web}{a.isPrimary ? ` · ${t.main}` : ''}</span>
            </li>
          ))}
        </ul>
      ) : <p className="mt-1 text-xs text-muted-foreground">{t.none}</p>}

      <div className="mt-3 border-t border-border pt-3 space-y-2">
        <button type="button" disabled={busy} onClick={makeCode} className="text-xs font-medium text-accent border border-accent/40 rounded-full px-3 py-1 hover:bg-accent/10 transition disabled:opacity-50">{t.makeCode}</button>
        {code && (
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{t.codeIs}</p>
            <p dir="ltr" className="font-mono text-lg tracking-widest text-foreground select-all">{code}</p>
            <p className="text-[11px] text-muted-foreground">{t.codeHelp}</p>
          </div>
        )}
        <div className="flex gap-2">
          <input dir="ltr" aria-label={t.enterCode} placeholder={t.enterCode} value={input} onChange={(e) => setInput(e.target.value)} maxLength={12} autoCapitalize="characters" autoComplete="off" className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono" />
          <button type="button" disabled={busy || input.trim().length < 8} onClick={submit} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50">{t.link}</button>
        </div>
        {linked && <button type="button" disabled={busy} onClick={unlink} className="text-xs text-red-400 underline">{t.unlink}</button>}
        {msg && <p role="status" className={`text-xs ${msg.ok ? 'text-green-500' : 'text-red-400'}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
