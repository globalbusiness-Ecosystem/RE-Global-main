'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { ChevronDown, Mail } from 'lucide-react';
import { useState } from 'react';
import { WHITEPAPER_I18N } from '@/lib/whitepaper-i18n';

interface WhitePaperPageProps {
  language: NavLanguage;
  onBack: () => void;
  showBackButton?: boolean;
}

export default function WhitePaperPage({
  language,
  onBack,
  showBackButton = true,
}: WhitePaperPageProps) {
  const t = WHITEPAPER_I18N[language];
  const [expandedSections, setExpandedSections] = useState<string[]>(['vision']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Back Button */}
      {showBackButton && (
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-accent/10 rounded transition"
            >
              <span className="text-accent text-lg">←</span>
            </button>
            <h2 className="text-lg font-bold text-accent">
              {t.headerTitle}
            </h2>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="px-4 py-12 text-center bg-gradient-to-b from-accent/5 to-background border-b border-border">
        <div className="max-w-2xl mx-auto">
          {/* RE Logo */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <span className="text-4xl font-bold text-background">RE</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-accent mb-3 text-balance">
            {t.headerTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-4">
            {t.subtitle}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-400">
            {t.heroDesc}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="px-4 py-8 max-w-2xl mx-auto space-y-4">
        {/* 1. Vision */}
        <ExpandableSection
          id="vision"
          title={t.sectionVision}
          expanded={expandedSections.includes('vision')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              {t.visionP1}
            </p>
            <p className="text-sm text-gray-400">
              {t.visionP2}
            </p>
          </div>
        </ExpandableSection>

        {/* 2. Problem & Solution */}
        <ExpandableSection
          id="problem"
          title={t.sectionProblem}
          expanded={expandedSections.includes('problem')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-accent mb-2">
                {t.barriersTitle}
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                {t.barriers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-accent mb-2">
                {t.solutionTitle}
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                {t.solutions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </ExpandableSection>

        {/* 3. Features */}
        <ExpandableSection
          id="features"
          title={t.sectionFeatures}
          expanded={expandedSections.includes('features')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureCard icon="360" title={t.features[0].title} description={t.features[0].desc} />
            <FeatureCard icon="🗺️" title={t.features[1].title} description={t.features[1].desc} />
            <FeatureCard icon="π" title={t.features[2].title} description={t.features[2].desc} />
            <FeatureCard icon="🏆" title={t.features[3].title} description={t.features[3].desc} />
            <FeatureCard icon="✓" title={t.features[4].title} description={t.features[4].desc} />
            <FeatureCard icon="🌐" title={t.features[5].title} description={t.features[5].desc} />
          </div>
        </ExpandableSection>

        {/* 4. RE Token */}
        <ExpandableSection
          id="token"
          title={t.sectionToken}
          expanded={expandedSections.includes('token')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {t.totalSupply}
                </p>
                <p className="text-lg font-bold text-accent">100M RE</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {t.launchPrice}
                </p>
                <p className="text-lg font-bold text-accent">0.01π</p>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="space-y-2">
              <h4 className="font-semibold text-accent mb-3">
                {t.tokenDistribution}
              </h4>

              {/* 40% Platform */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    {t.distribution[0]}
                  </span>
                  <span className="font-semibold text-accent">40M (40%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-accent to-accent/60 h-full"
                    style={{ width: '40%' }}
                  />
                </div>
              </div>

              {/* 30% Investors */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    {t.distribution[1]}
                  </span>
                  <span className="font-semibold text-accent">30M (30%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-600/60 h-full"
                    style={{ width: '30%' }}
                  />
                </div>
              </div>

              {/* 20% Team */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    {t.distribution[2]}
                  </span>
                  <span className="font-semibold text-accent">20M (20%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-orange-600/60 h-full"
                    style={{ width: '20%' }}
                  />
                </div>
              </div>

              {/* 10% Reserve */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    {t.distribution[3]}
                  </span>
                  <span className="font-semibold text-accent">10M (10%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-gray-600 to-gray-600/60 h-full"
                    style={{ width: '10%' }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              {t.tokenUtilityDesc}
            </p>
          </div>
        </ExpandableSection>

        {/* 5. Roadmap */}
        <ExpandableSection
          id="roadmap"
          title={t.sectionRoadmap}
          expanded={expandedSections.includes('roadmap')}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <RoadmapPhase
              quarter={t.roadmap[0].quarter}
              title={t.roadmap[0].title}
              items={t.roadmap[0].items}
              isFirst
            />
            <RoadmapPhase
              quarter={t.roadmap[1].quarter}
              title={t.roadmap[1].title}
              items={t.roadmap[1].items}
            />
            <RoadmapPhase
              quarter={t.roadmap[2].quarter}
              title={t.roadmap[2].title}
              items={t.roadmap[2].items}
            />
            <RoadmapPhase
              quarter={t.roadmap[3].quarter}
              title={t.roadmap[3].title}
              items={t.roadmap[3].items}
              isLast
            />
          </div>
        </ExpandableSection>

        {/* 6. Team */}
        <ExpandableSection
          id="team"
          title={t.sectionTeam}
          expanded={expandedSections.includes('team')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-accent mb-2">
                {t.teamName}
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                {t.teamDesc}
              </p>

              {/* Contact */}
              <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a
                  href="mailto:globalbusiness435@gmail.com"
                  className="text-sm text-accent hover:underline break-all"
                >
                  globalbusiness435@gmail.com
                </a>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              {t.contactUsToJoin}
            </p>
          </div>
        </ExpandableSection>
      </div>

      {/* CTA Footer */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-accent/10 to-purple-600/10 border border-accent/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-accent mb-2">
            {t.ctaTitle}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {t.ctaDesc}
          </p>
          <button className="w-full bg-accent text-background py-3 rounded-lg font-semibold hover:opacity-90 transition">
            {t.getStartedFree}
          </button>
        </div>
      </section>
    </main>
  );
}

/* Expandable Section Component */
function ExpandableSection({
  id,
  title,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition"
      >
        <h3 className="font-semibold text-accent text-left">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-accent transition-transform flex-shrink-0 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50">
          <div className="text-gray-300">{children}</div>
        </div>
      )}
    </div>
  );
}

/* Feature Card Component */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-center hover:border-accent/50 transition">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-semibold text-accent text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

/* Roadmap Phase Component */
function RoadmapPhase({
  quarter,
  title,
  items,
  isFirst = false,
  isLast = false,
}: {
  quarter: string;
  title: string;
  items: string[];
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="relative">
      {!isFirst && (
        <div className="absolute left-6 top-0 h-3 w-0.5 bg-gradient-to-b from-accent to-transparent" />
      )}

      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-accent" />
          {!isLast && (
            <div className="w-0.5 h-16 bg-gradient-to-b from-accent to-accent/30" />
          )}
        </div>

        <div className="pb-6 flex-1">
          <p className="text-xs font-semibold text-accent mb-1">{quarter}</p>
          <h4 className="font-semibold text-foreground mb-2">{title}</h4>
          <ul className="space-y-1">
            {items.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-400">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
