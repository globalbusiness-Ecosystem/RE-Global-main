'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { Building2, Home, Hotel, TrendingUp, Globe, FileText, MapPin, Users, Zap, BarChart3, Video, Bot, Glasses, ScrollText, ShieldCheck, Languages, Coins, ScanLine, ArrowLeftRight, Link2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroSlider from '@/components/hero-slider';
import PanoramicBanner from '@/components/panoramic-banner';
import { FirestoreListings } from '@/components/firestore-listings';
import { FEATURE_ICONS, DEFAULT_ICON_ORDER } from '@/components/home-feature-icon';
import { useHomeFeatures } from '@/hooks/use-home-features';
import { pickText } from '@/lib/home-features';
import AIAdvisorChat from '@/components/ai-advisor-chat';
import AIAdvisorVoiceChat from '@/components/ai-advisor-voice-chat';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { HOME_CATEGORIES, HOME_FEATURES, HOME_STATS, HOME_UI, tt } from '@/lib/home-i18n';

interface HomePageProps {
  language: NavLanguage;
  onCategoryClick?: (categoryId: string) => void;
  properties?: any[];
  propertiesLoading?: boolean;
}

const categories = [
  { id: 'buy', titleEn: 'Buy', titleAr: 'شراء', icon: Home },
  { id: 'rent', titleEn: 'Rent', titleAr: 'إيجار', icon: Building2 },
  { id: 'hotel', titleEn: 'Hotel', titleAr: 'فندق', icon: Hotel },
  { id: 'invest', titleEn: 'Invest', titleAr: 'استثمر', icon: TrendingUp },
  { id: 'tokenized', titleEn: 'Tokenized', titleAr: 'رمزية', icon: Zap },
  { id: 'share-market', titleEn: 'Shares Market', titleAr: 'سوق الحصص', icon: ArrowLeftRight },
  { id: 'abroad', titleEn: 'Abroad', titleAr: 'بالخارج', icon: Globe },
  { id: 'offplan', titleEn: 'Off-Plan', titleAr: 'قيد الإنشاء', icon: FileText },
  { id: 'map', titleEn: 'Map', titleAr: 'الخريطة', icon: MapPin },
  { id: 'partners', titleEn: 'Partners', titleAr: 'الشركاء', icon: Users },
  { id: 'analytics', titleEn: 'Analytics', titleAr: 'إحصائيات', icon: BarChart3 },
  { id: 'vr-tour', titleEn: 'VR Tour', titleAr: 'جولة واقع معزز', icon: Glasses },
  { id: 'ai-tour', titleEn: 'AI Tour', titleAr: 'جولة ذكية', icon: Video },
  { id: 'ai-advisor', titleEn: 'Aladdin', titleAr: 'علاء الدين', icon: Bot },
  { id: 'contracts', titleEn: 'Contracts', titleAr: 'العقود', icon: ScrollText },
  { id: 'inspections', titleEn: 'Inspect', titleAr: 'الفحص', icon: ScanLine },
  { id: 'explorer', titleEn: 'Blockchain', titleAr: 'البلوك تشين', icon: Link2 },
  { id: 're-token', titleEn: 'Platform Credits', titleAr: 'رصيد المنصة', icon: Coins },
];

export default function HomePage({
  language,
  onCategoryClick,
}: HomePageProps) {
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [useVoiceAdvisor, setUseVoiceAdvisor] = useState(false);
  const [showVRTour, setShowVRTour] = useState(false);
  const homeFeatures = useHomeFeatures();
  const stripItems = (homeFeatures.items ?? HOME_FEATURES.map((t, i) => ({ icon: DEFAULT_ICON_ORDER[i % DEFAULT_ICON_ORDER.length], t }))).map((it) => ({ icon: it.icon, text: pickText(it.t, language) }));
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden pb-4">
      <HeroSlider
        language={language}
        onInvestClick={() => onCategoryClick?.('invest')}
        onTokenizedClick={() => onCategoryClick?.('tokenized')}
      />
      <PanoramicBanner />

      <div className="px-4 py-8 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto relative z-10">

        {/* Stats */}
        <div className="mb-12 overflow-x-auto">
          <div className="flex gap-3 pb-2 min-w-min">
            {[
              { key: 'properties', val: '12.5K' },
              { key: 'countries', val: '195' },
              { key: 'investors', val: '45.2K' },
              { key: 'volume', val: '$2.3B' },
            ].map((s) => (
              <div key={s.key} className="flex-shrink-0 rounded-lg p-3 flex flex-col items-center gap-1 bg-card border border-border">
                <p className="text-muted-foreground text-xs">{tt(HOME_STATS[s.key], language)}</p>
                <p className="text-xl font-bold text-accent">{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        <FirestoreListings featuredOnly language={language} />

        {/* Categories */}
        <h3 className="text-lg font-semibold text-foreground mb-6 tracking-wide">
          {tt(HOME_UI.exploreCategories, language)}
        </h3>
        <div className="grid grid-cols-3 gap-5 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'vr-tour' || cat.id === 'ai-tour') {
                    setShowVRTour(true);
                  } else if (cat.id === 'ai-advisor') {
                    setShowAdvisor(true);
                  } else if (cat.id === 'explorer') {
                    router.push('/explorer');
                  } else if (cat.id === 'share-market') {
                    router.push('/market');
                  } else {
                    onCategoryClick?.(cat.id);
                  }
                }}
                className="rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-xl transition duration-300 border border-border bg-card hover:border-accent"
              >
                <div className="rounded-lg p-4 bg-muted">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {tt(HOME_CATEGORIES[cat.id], language)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Why Choose RE — strip the admin controls (Admin → Properties → Home strip) */}
        {homeFeatures.enabled && (
          <div className="rounded-lg py-6 mb-8 relative overflow-hidden border border-accent/30 bg-gradient-to-br from-accent/10 to-card">
            <h3 className="text-lg font-semibold text-foreground mb-5 px-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              {homeFeatures.title ? pickText(homeFeatures.title, language) : tt(HOME_UI.whyChoose, language)}
            </h3>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-gradient-to-r from-card to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-gradient-to-l from-card to-transparent" />

              <div className="flex overflow-hidden">
                <div className="flex gap-4 animate-marquee shrink-0 pr-4">
                  {[...stripItems, ...stripItems].map((item, i) => {
                    const FeatureIcon = FEATURE_ICONS[item.icon];
                    return (
                      <div key={`feat-${i}`} className="flex items-center gap-2.5 shrink-0 px-4 py-2.5 rounded-full bg-accent/10 border border-accent/40 shadow-[0_0_12px_-4px_var(--accent)]">
                        <FeatureIcon className="w-4 h-4 shrink-0 text-accent" />
                        <span className="text-sm text-foreground whitespace-nowrap">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {showVRTour && (
        <VRPropertyTourViewer
          property={DEMO_PROPERTY}
          onClose={() => setShowVRTour(false)}
          onBuyClick={() => alert('Integrate with Pi payment SDK')}
        />
      )}

      {showAdvisor && (
        useVoiceAdvisor ? (
          <AIAdvisorVoiceChat
            language={language}
            onClose={() => { setShowAdvisor(false); setUseVoiceAdvisor(false); }}
            enableVoice={true}
          />
        ) : (
          <AIAdvisorChat
            language={language}
            onClose={() => setShowAdvisor(false)}
          />
        )
      )}
    </main>
  );
}