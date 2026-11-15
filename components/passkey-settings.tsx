'use client';
import { useCallback, useEffect, useState } from 'react';
import { Fingerprint, Trash2 } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { formatDate } from '@/lib/format';
import { pk, passkeyErrorKey } from '@/lib/passkeys-i18n';
import { passkeysAvailable, registerPasskey } from '@/lib/passkey-client';

type Item = { id: string; label: string; backedUp: boolean; createdAt: string | null; lastUsedAt: string | null };

// Settings card: the devices whose fingerprint / face can confirm this account. Not shown when the browser cannot do it.
export function PasskeySettings({ language }: { language: string }) {
  const { accessToken } = usePiAuth();
  const [supported, setSupported] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { let alive = true; passkeysAvailable().then((v) => { if (alive) setSupported(v); }); return () => { alive = false; }; }, []);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/passkeys', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
      if (res.ok) setItems((await res.json()).passkeys as Item[]);
    } catch { /* the list stays as it was */ }
  }, [accessToken]);
  useEffect(() => { if (supported) void load(); }, [supported, load]);

  if (!supported || !accessToken) return null;

  const add = async () => {
    if (busy) return;
    setBusy(true); setMsg(null);
    const r = await registerPasskey(accessToken, label);
    setBusy(false);
    if (r.ok) { setLabel(''); setMsg({ ok: true, text: pk('okAdded', language) }); void load(); return; }
    setMsg(r.reason === 'cancelled' ? { ok: false, text: pk('cancelled', language) } : { ok: false, text: pk(passkeyErrorKey(r.reason), language) });
  };
  const remove = async (id: string) => {
    if (!window.confirm(pk('removeConfirm', language))) return;
    try { await fetch(`/api/passkeys?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }); } catch { /* reloaded below */ }
    void load();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2"><Fingerprint className="h-5 w-5 text-accent" aria-hidden /><h3 className="font-semibold text-foreground">{pk('title', language)}</h3></div>
      <p className="mb-3 text-xs text-muted-foreground">{pk('intro', language)}</p>
      {items.length === 0 ? <p className="mb-3 text-sm text-muted-foreground">{pk('none', language)}</p> : (
        <ul className="mb-3 divide-y divide-border">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{p.label}</p>
                <p className="text-xs text-muted-foreground">{pk('added', language)} {formatDate(p.createdAt, language)} · {pk('lastUsed', language)} {p.lastUsedAt ? formatDate(p.lastUsedAt, language) : pk('never', language)}{p.backedUp ? ` · ${pk('synced', language)}` : ''}</p>
              </div>
              <button type="button" onClick={() => void remove(p.id)} aria-label={pk('remove', language)} className="rounded p-2 text-muted-foreground hover:text-red-400"><Trash2 className="h-4 w-4" aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <input aria-label={pk('labelPh', language)} placeholder={pk('labelPh', language)} maxLength={40} value={label} onChange={(e) => setLabel(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent" />
        <button type="button" disabled={busy} onClick={() => void add()} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60">{busy ? pk('adding', language) : pk('add', language)}</button>
      </div>
      {msg && <p role="status" className={`mt-2 text-sm ${msg.ok ? 'text-emerald-500' : 'text-red-400'}`}>{msg.text}</p>}
    </div>
  );
}
