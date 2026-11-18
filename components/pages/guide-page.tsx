'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { ArrowLeft, UserCheck, ShieldCheck, TriangleAlert, BookOpen, Rocket, HelpCircle, LifeBuoy } from 'lucide-react';
import { GUIDE_I18N } from '@/lib/guide-i18n';
import { useTexts } from '@/lib/useTexts';
import { TOUR_I18N } from '@/lib/tour-i18n';
import { startTour } from '@/lib/tour';

interface GuidePageProps {
  language: NavLanguage;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  showBackButton?: boolean;
}

const Item = ({ title, desc }: { title: string; desc: string }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <h4 className="mb-1 text-sm font-semibold text-foreground">{title}</h4>
    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
  </div>
);

const Section = ({ icon: Icon, title, children }: { icon: typeof Rocket; title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground"><Icon className="h-5 w-5 text-accent" aria-hidden />{title}</h3>
    {children}
  </section>
);

// New-user guide: first steps, investing basics, how identity verification works, how money is protected, risks, words, questions.
export default function GuidePage({ language, onBack, onNavigate, showBackButton = true }: GuidePageProps) {
  const t = useTexts('guide', language, GUIDE_I18N[language] ?? GUIDE_I18N.en);
  const rtl = language === 'ar' || language === 'ur';
  const verify = [t.verifyPi, t.verifyWeb, t.verifyPhotos, t.verifyStatus, t.verifyPrivacy];

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

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-accent/15 to-transparent p-5">
          <h1 className="mb-2 text-2xl font-bold text-foreground">{t.heroTitle}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.heroSubtitle}</p>
        </div>

        <Section icon={Rocket} title={t.stepsTitle}><div className="flex flex-col gap-3">{t.steps.map((s, i) => <Item key={i} {...s} />)}</div></Section>
        <Section icon={BookOpen} title={t.investTitle}><div className="flex flex-col gap-3">{t.invest.map((s, i) => <Item key={i} {...s} />)}</div></Section>

        <Section icon={UserCheck} title={t.verifyTitle}>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{t.verifyIntro}</p>
          <div className="flex flex-col gap-3">{verify.map((s, i) => <Item key={i} {...s} />)}</div>
          <a href="/kyc" className="mt-3 inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black hover:opacity-90">{t.verifyCta}</a>
        </Section>

        <Section icon={ShieldCheck} title={t.protectTitle}><div className="flex flex-col gap-3">{t.protect.map((s, i) => <Item key={i} {...s} />)}</div></Section>
        <Section icon={TriangleAlert} title={t.risksTitle}><div className="flex flex-col gap-3">{t.risks.map((s, i) => <Item key={i} {...s} />)}</div></Section>

        <Section icon={HelpCircle} title={t.glossaryTitle}>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {t.glossary.map((g, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3"><dt className="text-sm font-semibold text-accent">{g.title}</dt><dd className="text-xs text-muted-foreground">{g.desc}</dd></div>
            ))}
          </dl>
        </Section>

        <Section icon={HelpCircle} title={t.faqTitle}>
          <div className="flex flex-col gap-2">
            {t.faq.map((f, i) => (
              <details key={i} className="rounded-xl border border-border bg-card p-3">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">{f.title}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </details>
            ))}
          </div>
        </Section>

        <div className="mb-8 flex flex-wrap gap-2">
          <button type="button" onClick={() => onNavigate?.('buy')} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black">{t.browseCta}</button>
          <button type="button" onClick={() => { onNavigate?.('home'); window.setTimeout(startTour, 400); }} className="rounded-full border border-border px-5 py-2 text-sm text-foreground hover:bg-accent/10">🧭 {(TOUR_I18N[language] ?? TOUR_I18N.en).replay}</button>
          <button type="button" onClick={() => onNavigate?.('tokenized')} className="rounded-full border border-accent px-5 py-2 text-sm font-semibold text-accent">{t.tokenizedCta}</button>
        </div>

        <Section icon={LifeBuoy} title={t.supportTitle}>
          <p className="mb-3 text-sm text-muted-foreground">{t.supportBody}</p>
          <button type="button" onClick={() => onNavigate?.('help')} className="rounded-full border border-border px-5 py-2 text-sm text-foreground hover:bg-accent/10">{t.supportTitle}</button>
        </Section>

        <p className="rounded-lg border border-border p-3 text-xs leading-relaxed text-muted-foreground">{t.disclaimer}</p>
      </div>
    </main>
  );
}
