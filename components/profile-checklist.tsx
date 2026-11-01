/** @jsxRuntime automatic */
import { Check, Circle } from 'lucide-react';
import { PROFILE_STEPS_I18N, profilePercent, type ProfileStep, type ProfileStepId } from '@/lib/profile-steps';
import type { NavLanguage } from '@/lib/nav-i18n';

// Shows what is left to do on the profile. A step can be tapped when there is something to do about it.
export function ProfileChecklist({ steps, language, onStep }: { steps: ProfileStep[]; language: NavLanguage; onStep?: (id: ProfileStepId) => void }) {
  const t = PROFILE_STEPS_I18N[language] ?? PROFILE_STEPS_I18N.en;
  const pct = profilePercent(steps);
  return (
    <div className="bg-card border border-border rounded-lg p-4" role="group" aria-label={t.title}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-foreground">{pct === 100 ? t.complete : t.title}</p>
        <span className="text-sm font-bold text-accent">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      {pct < 100 && (
        <ul className="space-y-1">
          {steps.map((s) => (
            <li key={s.id}>
              <button type="button" disabled={s.done || !onStep} onClick={() => onStep?.(s.id)} className="w-full flex items-center gap-2.5 py-1.5 text-sm text-start disabled:cursor-default">
                {s.done ? <Check className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />}
                <span className={s.done ? 'text-muted-foreground line-through' : 'text-foreground'}>{t[s.id]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
