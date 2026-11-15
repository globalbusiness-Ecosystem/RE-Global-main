'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { PARTNER_ROLES, type PartnerRole } from '@/lib/partners';
import { pt } from '@/lib/partners-i18n';
import { formatNumber } from '@/lib/format';
import { IconBadge } from '@/components/ui/icon-badge';
import { ROLE_META, type MyPartner } from './partner-types';
import { PartnerApplyForm } from './partner-apply-form';
import { PartnerDashboard } from './partner-dashboard';
import { PartnerDirectory } from './partner-directory';

// The partner hub: four partner types, the application (or its status, or the dashboard once approved), and the public directory.
export function PartnerHub({ language, showDirectory = true }: { language: string; showDirectory?: boolean }) {
  const { accessToken } = usePiAuth();
  const [me, setMe] = useState<MyPartner | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [role, setRole] = useState<PartnerRole | null>(null);
  const [reapply, setReapply] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
    setState('loading');
    fetch('/api/partners/me', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('x'))))
      .then((d: MyPartner) => { setMe(d); setState('ready'); })
      .catch(() => setState('error'));
  }, [accessToken]);
  useEffect(() => { load(); }, [load]);

  const rates = me?.program.rates;
  const status = me?.profile?.status;
  const showForm = !!accessToken && state === 'ready' && (!me?.profile || (status === 'rejected' && reapply));
  const pick = (r: PartnerRole) => { setRole(r); setTimeout(() => document.getElementById('partner-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); };
  const box = 'rounded-lg border border-border bg-card p-4';

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">{pt('tracksTitle', language)}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PARTNER_ROLES.map((k) => {
            const m = ROLE_META[k];
            const pct = rates?.[k] ?? 0;
            const on = role === k;
            return (
              <button key={k} type="button" onClick={() => pick(k)} aria-pressed={on}
                className={`rounded-lg border bg-card p-4 text-start transition hover:border-accent ${on ? 'border-accent ring-1 ring-accent' : 'border-border'}`}>
                <div className="flex items-center gap-3"><IconBadge icon={m.icon} /><span className="font-semibold text-foreground">{pt(m.name, language)}</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{pt(m.pitch, language)}</p>
                <p className="mt-3 text-xs text-muted-foreground">{pt('rate', language)}: <span className="font-semibold text-accent">{pct > 0 ? `${formatNumber(pct, language)}% ${pt('ratePer', language)}` : pt('rateNone', language)}</span></p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {(['how1', 'how2', 'how3'] as const).map((k) => (
          <div key={k} className={box}><p className="font-semibold text-foreground">{pt(k, language)}</p><p className="mt-1 text-sm text-muted-foreground">{pt(`${k}d` as 'how1d', language)}</p></div>
        ))}
      </section>

      {!accessToken && <p className={`${box} text-sm text-muted-foreground`}>{pt('signIn', language)}</p>}
      {accessToken && state === 'loading' && <p className="text-sm text-muted-foreground">{pt('loading', language)}</p>}
      {accessToken && state === 'error' && (
        <div className={box}><p className="text-sm text-red-400">{pt('loadError', language)}</p><button type="button" onClick={load} className="mt-2 text-sm text-accent hover:underline">{pt('retry', language)}</button></div>
      )}

      {state === 'ready' && me?.profile && status === 'pending' && (
        <div className={box}><h2 className="font-semibold text-foreground">{pt('pendingT', language)}</h2><p className="mt-1 text-sm text-muted-foreground">{pt('pendingB', language)}</p></div>
      )}
      {state === 'ready' && me?.profile && status === 'rejected' && !reapply && (
        <div className={box}>
          <h2 className="font-semibold text-foreground">{pt('rejectedT', language)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{pt('rejectedB', language)}</p>
          {me.profile.note && <p className="mt-2 rounded-md bg-muted p-3 text-sm text-foreground"><span className="text-xs text-muted-foreground">{pt('noteLabel', language)}: </span>{me.profile.note}</p>}
          <button type="button" onClick={() => { setReapply(true); setRole(me.profile!.role); }} className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">{pt('reapply', language)}</button>
        </div>
      )}
      {state === 'ready' && me?.profile && status === 'suspended' && (
        <div className={box}><h2 className="font-semibold text-foreground">{pt('suspendedT', language)}</h2><p className="mt-1 text-sm text-muted-foreground">{pt('suspendedB', language)}</p>{me.profile.note && <p className="mt-2 text-sm text-foreground">{me.profile.note}</p>}</div>
      )}
      {state === 'ready' && me?.profile && status === 'approved' && <PartnerDashboard language={language} me={me} />}
      {showForm && <PartnerApplyForm language={language} role={role} onRole={setRole} onSent={() => { setReapply(false); load(); }} />}

      {showDirectory && <PartnerDirectory language={language} />}
    </div>
  );
}
