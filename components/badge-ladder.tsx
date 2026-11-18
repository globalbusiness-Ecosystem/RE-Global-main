'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { VerifiedBadge } from '@/components/verified-badge';
import { BADGE_LEVELS, badgeLevelName, type BadgeLevel } from '@/lib/badge-level';
import { ladderStrings } from '@/lib/badge-ladder-i18n';
import { rewardStrings, type Rules } from '@/lib/rewards';
import { formatNumber } from '@/lib/format';

/** A button on the Rewards tab that opens a small window explaining how to climb from level 1 to level 7. */
export function BadgeLadder({ language, level, points, thresholds, rules }: { language: string; level: BadgeLevel; points: number; thresholds: number[]; rules: Rules }) {
  const [open, setOpen] = useState(false);
  const t = ladderStrings(language);
  const r = rewardStrings(language);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const next = level < 7 ? thresholds[level] : null;
  const left = next === null ? 0 : Math.max(0, next - points);
  const earn: [string, number][] = [[r.stay, rules.points.stay], [r.purchase, rules.points.purchase], [r.review, rules.points.review], [r.referral, rules.points.referral]];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/40 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/10">
        <BadgeCheck className="h-4 w-4" aria-hidden />{t.open}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={t.title} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-card p-4 sm:rounded-2xl">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-foreground">{t.title}</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t.intro}</p>

            <p className="mb-1 text-sm font-semibold text-foreground">{t.earn}</p>
            <ul className="mb-4 space-y-1">
              {earn.map(([label, pts]) => (
                <li key={label} className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
                  <span>{label}</span><span className="shrink-0 font-bold text-accent">+{formatNumber(pts, language)} {r.unit}</span>
                </li>
              ))}
            </ul>

            <p className="mb-1 text-sm font-semibold text-foreground">{t.levels}</p>
            <ol className="space-y-1.5">
              {BADGE_LEVELS.map((l) => {
                const reached = l < level, here = l === level;
                return (
                  <li key={l} className={`flex items-center gap-3 rounded-lg border p-2.5 ${here ? 'border-accent bg-accent/5' : 'border-border'} ${reached ? 'opacity-70' : ''}`}>
                    <VerifiedBadge language={language} size={28} level={l} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{l} · {badgeLevelName(l, language)}</p>
                      <p className="text-xs text-muted-foreground">{r.from.replace('{n}', formatNumber(thresholds[l - 1], language))}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold ${here ? 'text-accent' : reached ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {here ? t.here : reached ? `✓ ${t.done}` : t.remaining.replace('{n}', formatNumber(Math.max(0, thresholds[l - 1] - points), language))}
                    </span>
                  </li>
                );
              })}
            </ol>

            <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-foreground">
              {next === null
                ? t.top
                : t.approx.replace('{a}', formatNumber(rules.points.stay > 0 ? Math.ceil(left / rules.points.stay) : 0, language)).replace('{b}', formatNumber(rules.points.purchase > 0 ? Math.ceil(left / rules.points.purchase) : 0, language))}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">{t.note}</p>
          </div>
        </div>
      )}
    </>
  );
}
