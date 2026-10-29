'use client';

import { useEffect, useState } from 'react';
import { Award, Gift, Star, Home, MessageSquare, BedDouble, UserPlus, Ticket, type LucideIcon } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { TIER_IDS, rewardStrings, tierName, type Counts, type Rules, type TierId } from '@/lib/rewards';
import { formatNumber } from '@/lib/format';
import { IconBadge } from '@/components/ui/icon-badge';

type Data = { points: number; counts: Counts; rules: Rules; referral: { invited: number; qualified: number; referredBy: boolean }; tier: TierId; next: TierId | null; remaining: number; pct: number };

const TIER_COLOR: Record<TierId, string> = { bronze: '#cd7f32', silver: '#9ca3af', gold: '#d4af37', platinum: '#7dd3fc' };

// The "Rewards" tab of the settings page: points, level, progress, and how to earn more.
export function RewardsPanel({ language }: { language: string }) {
  const { accessToken } = usePiAuth();
  const t = rewardStrings(language);
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reload, setReload] = useState(0);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    let alive = true;
    setState('loading');
    fetch('/api/my-rewards', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('x'))))
      .then((d) => { if (alive) { setData(d); setState('ready'); } })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [accessToken, reload]);

  const applyCode = async () => {
    if (!accessToken || applying) return;
    setApplying(true); setCodeMsg(null);
    try {
      const r = await fetch('/api/referrals/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ code }) });
      const d = await r.json().catch(() => null);
      if (r.ok) { setCodeMsg({ ok: true, text: t.applied }); setCode(''); setReload((n) => n + 1); }
      else {
        const map: Record<string, string> = { notFound: t.errNotFound, own: t.errOwn, already: t.errAlready, notNew: t.errNotNew, mutual: t.errMutual, invalid: t.errInvalid };
        setCodeMsg({ ok: false, text: map[d?.error] ?? t.errInvalid });
      }
    } catch { setCodeMsg({ ok: false, text: t.loadError }); }
    finally { setApplying(false); }
  };

  const card = 'bg-card border border-border rounded-lg p-4';
  const head = (icon: LucideIcon, text: string) => (
    <div className="mb-3 flex items-center gap-2 font-semibold text-foreground"><IconBadge icon={icon} />{text}</div>
  );

  if (!accessToken) return <div className={card}><p className="text-sm text-muted-foreground">{t.signIn}</p></div>;
  if (state === 'loading') return <div className={card}><p className="text-sm text-muted-foreground">{t.loading}</p></div>;
  if (state === 'error' || !data) return <div className={card}><p className="text-sm text-red-400">{t.loadError}</p></div>;

  const color = TIER_COLOR[data.tier];
  const rows: { icon: LucideIcon; label: string; each: number; count: number }[] = [
    { icon: BedDouble, label: t.stay, each: data.rules.points.stay, count: data.counts.stays },
    { icon: Home, label: t.purchase, each: data.rules.points.purchase, count: data.counts.purchases },
    { icon: MessageSquare, label: t.review, each: data.rules.points.review, count: data.counts.reviews },
    { icon: UserPlus, label: t.referral, each: data.rules.points.referral, count: data.counts.referrals },
  ];
  const benefit = data.rules.benefits[data.tier];

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}22` }}>
            <Award className="h-7 w-7" style={{ color }} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{t.yourLevel}</p>
            <p className="text-lg font-bold" style={{ color }}>{tierName(language, data.tier)}</p>
            <p className="text-sm text-foreground">{t.points}: <span className="font-bold">{formatNumber(data.points, language)}</span> {t.unit}</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={data.pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full transition-all" style={{ width: `${data.pct}%`, backgroundColor: color }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {data.next ? t.nextLevel.replace('{n}', formatNumber(data.remaining, language)).replace('{tier}', tierName(language, data.next)) : t.topLevel}
        </p>
        {data.points === 0 && <p className="mt-2 text-xs text-muted-foreground">{t.start}</p>}
        {benefit && <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-foreground"><span className="font-semibold">{t.benefits}: </span>{benefit}</p>}
      </div>

      <div className={card}>
        {head(Star, t.howTitle)}
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3">
              <IconBadge icon={r.icon} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{t.perEach.replace('{n}', formatNumber(r.each, language))}</p>
              </div>
              <span className="text-sm font-bold text-accent">{formatNumber(r.count, language)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        {head(UserPlus, t.inviteTitle)}
        <p className="text-xs text-muted-foreground">{t.inviteLine.replace('{n}', formatNumber(data.referral.invited, language)).replace('{m}', formatNumber(data.referral.qualified, language))}</p>
        {!data.referral.referredBy && (
          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><IconBadge icon={Ticket} size="sm" />{t.codeTitle}</div>
            <p className="mb-2 text-xs text-muted-foreground">{t.codeHint}</p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
                placeholder={t.codePlaceholder}
                dir="ltr"
                className="min-w-0 flex-1 rounded-lg bg-muted px-3 py-2.5 font-mono text-sm text-foreground"
                aria-label={t.codePlaceholder}
              />
              <button onClick={applyCode} disabled={applying || code.length < 4} className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50">{t.apply}</button>
            </div>
            {codeMsg && <p className={`mt-2 text-xs ${codeMsg.ok ? 'text-emerald-500' : 'text-red-400'}`} role="status">{codeMsg.text}</p>}
          </div>
        )}
      </div>

      <div className={card}>
        {head(Gift, t.levels)}
        <div className="space-y-2">
          {TIER_IDS.map((id) => {
            const on = id === data.tier;
            return (
              <div key={id} className={`flex items-center gap-3 rounded-lg border p-3 ${on ? 'border-accent bg-accent/5' : 'border-border'}`}>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${TIER_COLOR[id]}22` }}>
                  <Award className="h-4 w-4" style={{ color: TIER_COLOR[id] }} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{tierName(language, id)}</p>
                  <p className="text-xs text-muted-foreground">{t.from.replace('{n}', formatNumber(data.rules.tiers[id], language))}</p>
                  {data.rules.benefits[id] && <p className="mt-1 text-xs text-foreground">{data.rules.benefits[id]}</p>}
                </div>
                {on && <span className="text-xs font-semibold text-accent">{t.yourLevel}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
