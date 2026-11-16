'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Coins, Handshake, Search, Eye, Lock, ShieldCheck, Mail, Globe, MessageCircle, Network } from 'lucide-react';
import { ABOUT_I18N } from '@/lib/about-i18n';
import { DEFAULT_ABOUT, parseAbout, type AboutSettings } from '@/lib/about-settings';
import { useTexts } from '@/lib/useTexts';
import { BrandLogo } from '@/components/brand-logo';

interface AboutPageProps {
  language: NavLanguage;
  onBack: () => void;
  showBackButton?: boolean;
}

const WHAT_ICONS = [Search, Building2, Coins, Handshake];
const VALUE_ICONS = [ShieldCheck, Eye, Lock];

// One fetch per session: the cover picture and contact links the admin set.
let aboutCache: Promise<AboutSettings> | null = null;
const loadAbout = () => (aboutCache ??= fetch('/api/about').then((r) => (r.ok ? r.json() : null)).then((j) => (j ? parseAbout(j) : DEFAULT_ABOUT)).catch(() => DEFAULT_ABOUT));

export default function AboutPage({ language, onBack, showBackButton = true }: AboutPageProps) {
  const t = useTexts('about', language, ABOUT_I18N[language] ?? ABOUT_I18N.en);
  const [about, setAbout] = useState<AboutSettings>(DEFAULT_ABOUT);
  useEffect(() => { let alive = true; void loadAbout().then((a) => { if (alive) setAbout(a); }); return () => { alive = false; }; }, []);
  const rtl = language === 'ar' || language === 'ur';
  const contacts = [
    about.email && { icon: Mail, label: t.emailLabel, text: about.email, href: `mailto:${about.email}` },
    about.website && { icon: Globe, label: t.websiteLabel, text: about.website.replace(/^https:\/\//, '').replace(/\/$/, ''), href: about.website },
    about.whatsapp && { icon: MessageCircle, label: t.whatsappLabel, text: `+${about.whatsapp}`, href: `https://wa.me/${about.whatsapp}` },
  ].filter(Boolean) as { icon: typeof Mail; label: string; text: string; href: string }[];

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-background pb-24">
      {showBackButton && (
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3">
            <button type="button" onClick={onBack} aria-label="Back" className="rounded p-2 transition hover:bg-accent/10"><ArrowLeft className={`h-5 w-5 text-accent ${rtl ? 'rotate-180' : ''}`} aria-hidden /></button>
            <h2 className="text-lg font-bold text-accent">{t.headerTitle}</h2>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden border-b border-border">
        {about.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={about.coverUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" draggable={false} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-background/60 to-background" aria-hidden />
        <div className="relative mx-auto max-w-2xl px-4 py-14 text-center">
          <div className="mb-6 flex justify-center"><BrandLogo height={88} rounded="rounded-2xl" /></div>
          <h1 className="mb-3 text-balance text-3xl font-bold text-accent sm:text-4xl">{t.heroTitle}</h1>
          <p className="text-base text-muted-foreground sm:text-lg">{t.heroSubtitle}</p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-10 px-4 py-10">
        <section>
          <h2 className="mb-2 text-xl font-bold text-foreground">{t.missionTitle}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.missionBody}</p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">{t.whatTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.what.map((it, i) => {
              const Icon = WHAT_ICONS[i % WHAT_ICONS.length];
              return (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent"><Icon className="h-5 w-5" aria-hidden /></div>
                  <h3 className="mb-1 font-semibold text-foreground">{it.title}</h3>
                  <p className="text-sm text-muted-foreground">{it.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">{t.valuesTitle}</h2>
          <ul className="space-y-3">
            {t.values.map((it, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <div><h3 className="font-semibold text-foreground">{it.title}</h3><p className="text-sm text-muted-foreground">{it.desc}</p></div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-accent"><Network className="h-5 w-5" aria-hidden /><h2 className="text-lg font-bold">{t.ecoTitle}</h2></div>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.ecoBody}</p>
        </section>

        {contacts.length > 0 && (
          <section>
            <h2 className="mb-1 text-xl font-bold text-foreground">{t.contactTitle}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{t.contactBody}</p>
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target={c.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-accent">
                    <c.icon className="h-5 w-5 text-accent" aria-hidden />
                    <span className="text-sm text-muted-foreground">{c.label}</span>
                    <bdi dir="ltr" className="ms-auto truncate text-sm font-medium text-foreground">{c.text}</bdi>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="text-center">
          <h2 className="mb-3 text-xl font-bold text-foreground">{t.ctaTitle}</h2>
          <button type="button" onClick={onBack} className="rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground">{t.ctaButton}</button>
        </section>
      </div>
    </main>
  );
}
