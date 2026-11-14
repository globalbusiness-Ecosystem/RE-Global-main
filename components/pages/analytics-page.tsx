'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { Home, Globe2, Handshake, BadgeDollarSign } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMarketStats } from '@/hooks/use-market-stats';
import { formatNumber, localeFor } from '@/lib/format';
import { st, typeLabel, regionName, compact } from '@/lib/market-stats-i18n';
import type { MarketStats } from '@/lib/market-stats';

interface AnalyticsPageProps {
  language: NavLanguage;
  currency: 'PI' | 'USD';
}

// Colours come from the theme (gold and violet first), so every chart follows light and dark mode.
const PALETTE = ['var(--accent)', 'var(--secondary)', 'oklch(0.68 0.12 190)', 'oklch(0.68 0.16 25)', 'oklch(0.7 0.12 140)', 'oklch(0.62 0.03 285)'];
const tick = { fill: 'var(--muted-foreground)', fontSize: 11 };
const tip = {
  contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontSize: 12 },
  labelStyle: { color: 'var(--muted-foreground)' },
  itemStyle: { color: 'var(--foreground)' },
};
const box = 'rounded-2xl border border-border bg-card p-4';

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Home; label: string; value: string; sub?: string }) {
  return (
    <div className={`${box} min-w-0`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm leading-tight text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent/15 text-accent"><Icon className="h-4 w-4" aria-hidden /></span>
      </div>
      <p className="mt-2 truncate text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}</div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

function Body({ s, language }: { s: MarketStats; language: NavLanguage }) {
  const locale = localeFor(language);
  const monthName = (m: string) => new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(new Date(`${m}-01T00:00:00Z`));
  const months = s.months.map((m) => ({ ...m, label: monthName(m.month) }));
  const types = s.byType.map((t, i) => ({ ...t, label: typeLabel(t.type, language), color: PALETTE[i % PALETTE.length] }));
  const countries = s.countries.map((c) => ({ ...c, label: regionName(c.country, language) }));
  const totalTyped = types.reduce((n, t) => n + t.count, 0) || 1;
  const empty = s.listings.total === 0 && s.deals12m === 0;

  if (empty) return <p className={`${box} text-sm text-muted-foreground`}>{st('noData', language)}</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon={Home} label={st('listings', language)} value={formatNumber(s.listings.total, language, 0)} sub={`${formatNumber(s.listings.available, language, 0)} ${st('available', language)} · ${formatNumber(s.listings.sold, language, 0)} ${st('sold', language)}`} />
        <Kpi icon={Globe2} label={st('countries', language)} value={formatNumber(s.countryCount, language, 0)} sub={st('countriesNote', language)} />
        <Kpi icon={Handshake} label={st('deals', language)} value={formatNumber(s.deals12m, language, 0)} sub={st('last12', language)} />
        <Kpi icon={BadgeDollarSign} label={st('median', language)} value={s.headline ? `${compact(s.headline.median, locale)} ${s.headline.currency}` : '—'} sub={s.headline ? st('basedOn', language).replace('{n}', formatNumber(s.headline.count, language, 0)) : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={box}>
          <h2 className="mb-3 text-base font-semibold text-foreground">{st('chartDeals', language)}</h2>
          <div dir="ltr" className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dealsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: 'var(--border)' }} interval="preserveStartEnd" minTickGap={12} />
                <YAxis allowDecimals={false} width={32} tick={tick} tickLine={false} axisLine={false} />
                <Tooltip {...tip} formatter={(v) => [formatNumber(v as number, language, 0), st('deals', language)]} />
                <Area type="monotone" dataKey="deals" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dealsFill)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {s.volume12m.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{st('volume', language)}:</span>
              {s.volume12m.map((v) => <span key={v.currency} dir="ltr" className="font-semibold text-accent">{compact(v.amount, locale)} {v.currency}</span>)}
            </p>
          )}
        </section>

        <section className={box}>
          <h2 className="mb-3 text-base font-semibold text-foreground">{st('chartTypes', language)}</h2>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div dir="ltr" className="h-48 w-48 flex-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={types} dataKey="count" nameKey="label" innerRadius="58%" outerRadius="95%" paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
                    {types.map((t) => <Cell key={t.type} fill={t.color} />)}
                  </Pie>
                  <Tooltip {...tip} formatter={(v, n) => [formatNumber(v as number, language, 0), n as string]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full min-w-0 flex-1 space-y-2">
              {types.map((t) => (
                <li key={t.type} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 flex-none rounded-sm" style={{ background: t.color }} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-foreground">{t.label}</span>
                  <span className="text-muted-foreground">{formatNumber(t.count, language, 0)}</span>
                  <span className="w-10 text-end font-semibold text-foreground">{Math.round((t.count / totalTyped) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {countries.length > 0 && (
          <section className={box}>
            <h2 className="mb-3 text-base font-semibold text-foreground">{st('chartCountries', language)}</h2>
            <div dir="ltr" style={{ height: Math.max(160, countries.length * 36 + 16) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countries} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" width={92} tick={tick} tickLine={false} axisLine={false} />
                  <Tooltip {...tip} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} formatter={(v) => [formatNumber(v as number, language, 0), st('listings', language)]} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {s.prices.length > 0 && (
          <section className={box}>
            <h2 className="mb-3 text-base font-semibold text-foreground">{st('tablePrices', language)}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="p-2 text-start font-medium">{st('colType', language)}</th>
                    <th className="p-2 text-end font-medium">{st('colCount', language)}</th>
                    <th className="p-2 text-end font-medium">{st('colMedian', language)}</th>
                    <th className="p-2 text-end font-medium">{st('colRange', language)}</th>
                  </tr>
                </thead>
                <tbody>
                  {s.prices.map((p) => (
                    <tr key={`${p.type}-${p.currency}`} className="border-b border-border/60 last:border-0">
                      <td className="p-2 font-medium text-foreground">{typeLabel(p.type, language)}</td>
                      <td className="p-2 text-end text-muted-foreground">{formatNumber(p.count, language, 0)}</td>
                      <td className="p-2 text-end font-semibold text-accent" dir="ltr">{compact(p.median, locale)} {p.currency}</td>
                      <td className="p-2 text-end text-xs text-muted-foreground" dir="ltr">{compact(p.min, locale)} – {compact(p.max, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{st('note', language)}</p>
    </div>
  );
}

export default function AnalyticsPage({ language }: AnalyticsPageProps) {
  const { data, state, reload } = useMarketStats();
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-3xl font-bold text-accent">{st('title', language)}</h1>
        <p className="mt-1 text-muted-foreground">{st('subtitle', language)}</p>
      </header>

      {state === 'loading' && <Skeleton />}
      {state === 'error' && (
        <div className={box}><p className="text-sm text-red-400">{st('loadError', language)}</p><button type="button" onClick={reload} className="mt-2 text-sm text-accent hover:underline">{st('retry', language)}</button></div>
      )}
      {state === 'ready' && data && <Body s={data} language={language} />}
    </main>
  );
}
