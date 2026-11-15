'use client';
import { useState } from 'react';
import { Copy, Check, Users, ShoppingBag } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { inviteLink } from '@/lib/ref-code';
import { pt } from '@/lib/partners-i18n';
import { ROLE_META, type MyPartner } from './partner-types';
import { IconBadge } from '@/components/ui/icon-badge';
import { PartnerProjects } from './partner-projects';

// What an approved partner sees: personal invite link, how many came and bought, and the commission lines.
export function PartnerDashboard({ language, me }: { language: string; me: MyPartner }) {
  const [copied, setCopied] = useState(false);
  const { profile, invite, commissions, program } = me;
  if (!profile || !invite) return null;
  const link = inviteLink(typeof window === 'undefined' ? '' : window.location.origin, invite.code);
  const rate = program.rates[profile.role];

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };
  const box = 'rounded-lg border border-border bg-card p-4';

  return (
    <section className="space-y-4">
      <div className={box}>
        <div className="flex items-center gap-3">
          <IconBadge icon={ROLE_META[profile.role].icon} />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground">{pt('approvedT', language)}</h2>
            <p className="truncate text-sm text-muted-foreground">{profile.company} · {pt(ROLE_META[profile.role].name, language)}</p>
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">{pt('rate', language)}</p>
            <p className="font-bold text-accent">{rate > 0 ? `${formatNumber(rate, language)}%` : '—'}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{rate > 0 ? pt('ratePer', language) : pt('rateNone', language)}</p>
        {!program.enabled && <p className="mt-2 text-sm text-amber-500">{pt('programOff', language)}</p>}
      </div>

      <PartnerProjects language={language} />

      <div className={box}>
        <p className="text-sm text-muted-foreground">{pt('inviteLink', language)}</p>
        <p dir="ltr" className="mt-1 break-all rounded-md bg-muted px-3 py-2 text-sm text-foreground">{link}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{pt('inviteCode', language)}: <span dir="ltr" className="font-mono font-semibold text-foreground">{invite.code}</span></span>
          <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-lg border border-accent px-3 py-1.5 text-sm text-accent transition hover:bg-accent/10">
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}{copied ? pt('copied', language) : pt('copy', language)}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3"><Users className="h-5 w-5 text-accent" aria-hidden /><div><p className="text-xs text-muted-foreground">{pt('invited', language)}</p><p className="text-lg font-bold text-foreground">{formatNumber(invite.invited, language, 0)}</p></div></div>
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3"><ShoppingBag className="h-5 w-5 text-accent" aria-hidden /><div><p className="text-xs text-muted-foreground">{pt('qualified', language)}</p><p className="text-lg font-bold text-foreground">{formatNumber(invite.qualified, language, 0)}</p></div></div>
        </div>
      </div>

      <div className={box}>
        <h3 className="mb-3 font-semibold text-foreground">{pt('earnings', language)}</h3>
        {!commissions || commissions.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">{pt('noEarnings', language)}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {commissions.totals.map((t) => (
                <div key={t.currency} className="col-span-2 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{pt('owed', language)}</p><p className="font-bold text-foreground">{formatNumber(t.accrued, language)} <span className="text-xs font-normal">{t.currency}</span></p></div>
                  <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{pt('paid', language)}</p><p className="font-bold text-emerald-500">{formatNumber(t.paid, language)} <span className="text-xs font-normal">{t.currency}</span></p></div>
                </div>
              ))}
            </div>
            <h4 className="mb-2 mt-4 text-sm font-medium text-muted-foreground">{pt('recent', language)}</h4>
            <ul className="divide-y divide-border">
              {commissions.recent.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground"><span dir="ltr">{c.contractId}</span> · {formatNumber(c.rate, language)}%</span>
                  <span className={c.status === 'paid' ? 'font-semibold text-emerald-500' : c.status === 'void' ? 'text-muted-foreground line-through' : 'font-semibold text-foreground'}>{formatNumber(c.amount, language)} {c.currency}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{pt('rulesNote', language)}</p>
    </section>
  );
}
