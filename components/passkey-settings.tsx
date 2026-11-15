'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Fingerprint, Trash2 } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { formatDate } from '@/lib/format';
import { pk, passkeyErrorKey } from '@/lib/passkeys-i18n';
import { deviceNameFromUA } from '@/lib/passkeys';
import { passkeysAvailable, registerPasskey } from '@/lib/passkey-client';
import { FingerprintScanner, type ScanState } from '@/components/fingerprint-scanner';

type Item = { id: string; label: string; backedUp: boolean; createdAt: string | null; lastUsedAt: string | null };

// Settings card: tap the scanner, the phone asks for your fingerprint / face, and this device is added. Not shown when the browser cannot do it.
export function PasskeySettings({ language }: { language: string }) {
  const { accessToken } = usePiAuth();
  const [supported, setSupported] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [scan, setScan] = useState<ScanState>('idle');
  const [err, setErr] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { let alive = true; passkeysAvailable().then((v) => { if (alive) setSupported(v); }); return () => { alive = false; if (timer.current) clearTimeout(timer.current); }; }, []);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/passkeys', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
      if (res.ok) setItems((await res.json()).passkeys as Item[]);
    } catch { /* the list stays as it was */ }
  }, [accessToken]);
  useEffect(() => { if (supported) void load(); }, [supported, load]);

  if (!supported || !accessToken) return null;

  const settle = (s: ScanState) => { setScan(s); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setScan('idle'), s === 'success' ? 3500 : 3000); };
  const start = async () => {
    if (scan === 'scanning') return;
    setScan('scanning'); setErr('');
    const r = await registerPasskey(accessToken, deviceNameFromUA(navigator.userAgent));
    if (r.ok) { try { navigator.vibrate?.(40); } catch { /* not supported */ } settle('success'); void load(); return; }
    if (r.reason === 'cancelled') { setScan('idle'); return; }
    setErr(pk(passkeyErrorKey(r.reason), language)); settle('error');
  };
  const remove = async (id: string) => {
    if (!window.confirm(pk('removeConfirm', language))) return;
    try { await fetch(`/api/passkeys?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }); } catch { /* reloaded below */ }
    void load();
  };
  const label = scan === 'scanning' ? pk('scanning', language) : scan === 'success' ? pk('scanOk', language) : scan === 'error' ? pk('scanFail', language) : pk(items.length ? 'scanIdleMore' : 'scanIdle', language);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2"><Fingerprint className="h-5 w-5 text-accent" aria-hidden /><h3 className="font-semibold text-foreground">{pk('title', language)}</h3></div>
      <p className="mb-4 text-xs text-muted-foreground">{pk('intro', language)}</p>
      <div className="py-2"><FingerprintScanner state={scan} onPress={() => void start()} label={label} /></div>
      {err && <p role="alert" className="mt-1 text-center text-xs text-red-400">{err}</p>}
      {items.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{pk('thisDevice', language)}</p>
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{pk('added', language)} {formatDate(p.createdAt, language)} · {pk('lastUsed', language)} {p.lastUsedAt ? formatDate(p.lastUsedAt, language) : pk('never', language)}</p>
                </div>
                <button type="button" onClick={() => void remove(p.id)} aria-label={pk('remove', language)} className="rounded p-2 text-muted-foreground hover:text-red-400"><Trash2 className="h-4 w-4" aria-hidden /></button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
