'use client';

import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useLanguage } from '@/contexts/language-context';
import { MY_DATA_I18N } from '@/lib/my-data-i18n';
import { ERASE_WORD, exportFilename } from '@/lib/my-data';

// Settings card: download everything the platform holds about the user, or delete the personal data.
export function MyDataPanel() {
  const { accessToken } = usePiAuth();
  const { language } = useLanguage();
  const t = MY_DATA_I18N[language] ?? MY_DATA_I18N.en;
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [word, setWord] = useState('');
  const [msg, setMsg] = useState('');

  const failure = (status: number) => setMsg(status === 429 ? t.tooMany : t.failed);

  async function download() {
    if (!accessToken || busy) return;
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/my-data', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
      if (!res.ok) { failure(res.status); return; }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = exportFilename(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setMsg(t.failed); } finally { setBusy(false); }
  }

  async function erase() {
    if (!accessToken || busy || word !== ERASE_WORD) return;
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/my-data', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: ERASE_WORD }),
      });
      if (!res.ok) { failure(res.status); return; }
      setMsg(t.erased); setAsking(false); setWord('');
    } catch { setMsg(t.failed); } finally { setBusy(false); }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-accent">{t.title}</h3>
      <p className="text-xs text-muted-foreground">{accessToken ? t.intro : t.signIn}</p>
      {accessToken && (
        <>
          <button onClick={download} disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
            <Download className="w-4 h-4" />{busy ? t.working : t.download}
          </button>
          {!asking ? (
            <button onClick={() => { setAsking(true); setMsg(''); }}
              className="w-full flex items-center justify-center gap-2 border border-red-500/60 text-red-400 py-2 rounded-lg text-sm hover:bg-red-500/10 transition">
              <Trash2 className="w-4 h-4" />{t.erase}
            </button>
          ) : (
            <div className="space-y-2 border border-red-500/40 rounded-lg p-3">
              <p className="text-xs text-red-300">{t.eraseInfo}</p>
              <input value={word} onChange={(e) => setWord(e.target.value)} placeholder={t.typeWord} dir="ltr" autoComplete="off"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={erase} disabled={busy || word !== ERASE_WORD}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40">{busy ? t.working : t.confirmErase}</button>
                <button onClick={() => { setAsking(false); setWord(''); }} disabled={busy}
                  className="flex-1 border border-border py-2 rounded-lg text-sm">{t.cancel}</button>
              </div>
            </div>
          )}
        </>
      )}
      {msg && <p className="text-xs text-muted-foreground" role="status">{msg}</p>}
    </div>
  );
}
