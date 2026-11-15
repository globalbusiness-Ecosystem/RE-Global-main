import { formatMoney } from '@/lib/format';
import { installmentSchedule, type InstallmentPlan } from '@/lib/partner-projects';
import { pp } from '@/lib/partner-projects-i18n';

// What one instalment plan means in money, calculated from the project price (shared by the editor preview and the public view).
export function InstallmentTable({ price, currency, plan, language }: { price: number; currency: string; plan: InstallmentPlan; language: string }) {
  const s = installmentSchedule(price, plan);
  const money = (n: number) => formatMoney(n, currency, language);
  const rows: [string, string, boolean?][] = [
    [`${pp('down', language)} (${plan.downPct}%)`, money(s.down)],
    [pp('financed', language), money(s.financed)],
    ...(plan.extraPct > 0 ? [[`${pp('extra', language)} (${plan.extraPct}%)`, money(s.extra)] as [string, string]] : []),
    [`${pp('monthly', language)} × ${s.months} ${pp('months', language)}`, money(s.monthly), true],
    [pp('total', language), money(s.total)],
  ];
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      {plan.label && <p className="mb-2 text-sm font-semibold text-foreground">{plan.label}</p>}
      <dl className="space-y-1 text-sm">
        {rows.map(([k, v, hi]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className={hi ? 'font-bold text-accent' : 'text-foreground'}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
