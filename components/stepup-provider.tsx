'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useLanguage } from '@/contexts/language-context';
import { pk } from '@/lib/passkeys-i18n';
import { passkeysAvailable } from '@/lib/passkey-client';
import { fetchPrefs, fetchStepUpToken, isStepUpRequired } from '@/lib/stepup-client';
import { FingerprintScanner, type ScanState } from '@/components/fingerprint-scanner';

export type EnsureResult = { ok: true; token?: string } | { ok: false; reason: 'cancelled' | 'unsupported' };
type Ctx = {
  /** Opens the fingerprint window and resolves to a one-time token, or null when the person cancels. */
  requestStepUp: () => Promise<string | null>;
  /** For flows that cannot be interrupted (the Pi payment sheet): asks first, only when this account requires it. */
  ensureStepUp: () => Promise<EnsureResult>;
  /** fetch(), and when the server answers "stepup_required" it asks for the fingerprint and retries once. */
  stepUpFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  /** Tell the app the lock was switched on or off (it just verified a fingerprint, so it does not lock again at once). */
  protectionChanged: (on: boolean) => void;
};

const UNLOCK_KEY = 'rg_unlocked_v1';
const RELOCK_AFTER_MS = 60_000; // away from the app for a minute -> locked again, like a banking app
const StepUpContext = createContext<Ctx | null>(null);

export function useStepUp(): Ctx {
  const c = useContext(StepUpContext);
  if (!c) throw new Error('useStepUp must be used inside StepUpProvider');
  return c;
}

export function StepUpProvider({ children }: { children: ReactNode }) {
  const { accessToken } = usePiAuth();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scan, setScan] = useState<ScanState>('idle');
  const waiter = useRef<((t: string | null) => void) | null>(null);
  const pending = useRef<Promise<string | null> | null>(null);
  const [locked, setLocked] = useState(false);
  const [lockScan, setLockScan] = useState<ScanState>('idle');
  const lockOn = useRef(false);
  const hiddenAt = useRef(0);
  const autoLock = useRef(false);
  const autoModal = useRef(false);

  const flag = (v: boolean) => { try { if (v) sessionStorage.setItem(UNLOCK_KEY, '1'); else sessionStorage.removeItem(UNLOCK_KEY); } catch { /* private mode */ } };
  const protectionChanged = useCallback((on: boolean) => { lockOn.current = on; if (on) flag(true); else setLocked(false); }, []);

  // Opening the platform: when this account turned the lock on (and this device can answer), the fingerprint is asked first.
  useEffect(() => {
    if (!accessToken) { lockOn.current = false; setLocked(false); return; }
    let alive = true;
    (async () => {
      const p = await fetchPrefs(accessToken);
      if (!alive || !p) return;
      const on = p.requireStepUp && p.passkeys > 0 && (await passkeysAvailable());
      lockOn.current = on;
      if (!on) return;
      let unlocked = false;
      try { unlocked = sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch { /* private mode */ }
      if (!unlocked && alive) setLocked(true);
    })();
    return () => { alive = false; };
  }, [accessToken]);

  // Coming back after a minute away locks it again.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') { hiddenAt.current = Date.now(); return; }
      if (lockOn.current && hiddenAt.current && Date.now() - hiddenAt.current > RELOCK_AFTER_MS) { flag(false); setLocked(true); }
      hiddenAt.current = 0;
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const finish = useCallback((t: string | null) => {
    const w = waiter.current; waiter.current = null; pending.current = null;
    setOpen(false); setScan('idle');
    w?.(t);
  }, []);

  const requestStepUp = useCallback((): Promise<string | null> => {
    if (!accessToken) return Promise.resolve(null);
    if (pending.current) return pending.current;
    pending.current = new Promise<string | null>((resolve) => { waiter.current = resolve; });
    setScan('idle'); setOpen(true);
    return pending.current;
  }, [accessToken]);

  const ensureStepUp = useCallback(async (): Promise<EnsureResult> => {
    if (!accessToken) return { ok: true };
    const prefs = await fetchPrefs(accessToken);
    if (!prefs || !prefs.requireStepUp) return { ok: true }; // the server still enforces it when the setting is on
    if (!(await passkeysAvailable())) return { ok: false, reason: 'unsupported' };
    const token = await requestStepUp();
    return token ? { ok: true, token } : { ok: false, reason: 'cancelled' };
  }, [accessToken, requestStepUp]);

  const stepUpFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const first = await fetch(input, init);
    if (!(await isStepUpRequired(first))) return first;
    const token = await requestStepUp();
    if (!token) return first;
    const headers = new Headers(init?.headers);
    headers.set('X-Stepup-Token', token);
    return fetch(input, { ...init, headers });
  }, [requestStepUp]);

  const scanNow = async () => {
    if (!accessToken || scan === 'scanning') return;
    setScan('scanning');
    const r = await fetchStepUpToken(accessToken);
    if (r.ok) { try { navigator.vibrate?.(40); } catch { /* not supported */ } setScan('success'); setTimeout(() => finish(r.token), 650); return; }
    if (r.reason === 'cancelled') { setScan('idle'); return; }
    setScan('error'); setTimeout(() => setScan('idle'), 1800);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, finish]);

  const unlock = async () => {
    if (!accessToken || lockScan === 'scanning') return;
    setLockScan('scanning');
    const r = await fetchStepUpToken(accessToken);
    if (r.ok) { try { navigator.vibrate?.(40); } catch { /* not supported */ } flag(true); setLockScan('success'); setTimeout(() => { setLocked(false); setLockScan('idle'); }, 600); return; }
    if (r.reason === 'cancelled') { setLockScan('idle'); return; }
    setLockScan('error'); setTimeout(() => setLockScan('idle'), 1800);
  };

  // The device's own fingerprint sheet opens by itself (no extra tap) - the button stays as the fallback when a browser insists on a tap.
  useEffect(() => { if (open && !autoModal.current) { autoModal.current = true; void scanNow(); } if (!open) autoModal.current = false; }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (locked && !autoLock.current) { autoLock.current = true; void unlock(); } if (!locked) autoLock.current = false; }, [locked]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({ requestStepUp, ensureStepUp, stepUpFetch, protectionChanged }), [requestStepUp, ensureStepUp, stepUpFetch, protectionChanged]);
  const lockLabel = lockScan === 'scanning' ? pk('scanning', language) : lockScan === 'success' ? pk('scanOk', language) : lockScan === 'error' ? pk('scanFail', language) : pk('scanIdle', language);
  const label = scan === 'scanning' ? pk('scanning', language) : scan === 'success' ? pk('scanOk', language) : scan === 'error' ? pk('scanFail', language) : pk('scanIdle', language);

  return (
    <StepUpContext.Provider value={value}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={() => finish(null)}>
          <div role="dialog" aria-modal="true" aria-label={pk('confirmTitle', language)} onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-2xl border border-border bg-card p-6 text-center sm:max-w-sm sm:rounded-2xl">
            <h2 className="text-lg font-bold text-foreground">{pk('confirmTitle', language)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{pk('confirmBody', language)}</p>
            <div className="py-5"><FingerprintScanner state={scan} onPress={() => void scanNow()} label={label} /></div>
            <p className="text-xs text-muted-foreground">{pk('confirmTapHint', language)}</p>
            <button type="button" onClick={() => finish(null)} className="mt-4 w-full rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:border-accent">{pk('cancel', language)}</button>
          </div>
        </div>
      )}
      {locked && (
        <div role="dialog" aria-modal="true" aria-label={pk('lockTitle', language)} className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-2 bg-background p-6 text-center">
          <h2 className="text-xl font-bold text-foreground">{pk('lockTitle', language)}</h2>
          <p className="text-sm text-muted-foreground">{pk('lockBody', language)}</p>
          <div className="py-6"><FingerprintScanner state={lockScan} onPress={() => void unlock()} label={lockLabel} size={160} /></div>
          <p className="max-w-xs text-xs text-muted-foreground">{pk('lockHelp', language)}</p>
        </div>
      )}
    </StepUpContext.Provider>
  );
}
