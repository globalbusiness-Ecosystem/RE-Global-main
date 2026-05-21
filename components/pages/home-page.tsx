'use client';

import { Building2, Home, Hotel, TrendingUp, Globe, FileText, MapPin, Users, Zap, BarChart3, ShoppingCart, Video, Bot, Glasses } from 'lucide-react';
import { useState } from 'react';
import HeroSlider from '@/components/hero-slider';
import PanoramicBanner from '@/components/panoramic-banner';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import AIAdvisorChat from '@/components/ai-advisor-chat';
import AIAdvisorVoiceChat from '@/components/ai-advisor-voice-chat';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface HomePageProps {
  language: 'en' | 'ar';
  onCategoryClick?: (categoryId: string) => void;
}

const categories = [
  { id: 'buy', titleEn: 'Buy', titleAr: 'شراء', icon: Home },
  { id: 'rent', titleEn: 'Rent', titleAr: 'إيجار', icon: Building2 },
  { id: 'hotel', titleEn: 'Hotel', titleAr: 'فندق', icon: Hotel },
  { id: 'invest', titleEn: 'Invest', titleAr: 'استثمر', icon: TrendingUp },
  { id: 'tokenized', titleEn: 'Tokenized', titleAr: 'رمزية', icon: Zap },
  { id: 'abroad', titleEn: 'Abroad', titleAr: 'بالخارج', icon: Globe },
  { id: 'offplan', titleEn: 'Off-Plan', titleAr: 'قيد الإنشاء', icon: FileText },
  { id: 'map', titleEn: 'Map', titleAr: 'الخريطة', icon: MapPin },
  { id: 'partners', titleEn: 'Partners', titleAr: 'الشركاء', icon: Users },
  { id: 'analytics', titleEn: 'Analytics', titleAr: 'إحصائيات', icon: BarChart3 },
  { id: 'vr-tour', titleEn: 'VR Tour', titleAr: 'جولة واقع معزز', icon: Glasses },
  { id: 'ai-tour', titleEn: 'AI Tour', titleAr: 'جولة ذكية', icon: Video },
  { id: 'ai-advisor', titleEn: 'Aladdin', titleAr: 'علاء الدين', icon: Bot },
];

export default function HomePage({
  language,
  onCategoryClick,
}: HomePageProps) {
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [useVoiceAdvisor, setUseVoiceAdvisor] = useState(false);
  const [showVRTour, setShowVRTour] = useState(false);

  return (
    <main className="min-h-screen relative overflow-hidden pb-4">
      <HeroSlider
        language={language}
        onInvestClick={() => onCategoryClick?.('invest')}
        onTokenizedClick={() => onCategoryClick?.('tokenized')}
      />
      <PanoramicBanner />

      <div className="px-4 py-8 max-w-md mx-auto relative z-10 bg-black">

        {/* Stats */}
        <div className="mb-12 overflow-x-auto">
          <div className="flex gap-3 pb-2 min-w-min">
            {[
              { en: 'Properties', ar: 'العقارات', val: '12.5K' },
              { en: 'Countries', ar: 'الدول', val: '195' },
              { en: 'Investors', ar: 'المستثمرون', val: '45.2K' },
              { en: 'Volume', ar: 'الحجم', val: '$2.3B' },
            ].map((s) => (
              <div key={s.en} className="flex-shrink-0 rounded-lg p-3 flex flex-col items-center gap-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-gray-400 text-xs">{language === 'en' ? s.en : s.ar}</p>
                <p className="text-xl font-bold text-accent">{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <h3 className="text-lg font-semibold text-white mb-6 tracking-wide">
          {language === 'en' ? 'Explore Categories' : 'استكشف الفئات'}
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
                  } else {
                    onCategoryClick?.(cat.id);
                  }
                }}
                className="rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-xl transition duration-300 border border-gray-800 hover:border-accent"
                style={{ backgroundColor: '#1a2332' }}
              >
                <div className="rounded-lg p-4" style={{ backgroundColor: '#1a2332' }}>
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <span className="text-xs font-medium text-white text-center leading-tight">
                  {language === 'en' ? cat.titleEn : cat.titleAr}
                </span>
              </button>
            );
          })}
        </div>

        {/* Why Choose RE */}
        <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderLeft: '3px solid rgba(212,175,55,0.8)' }}>
          <h3 className="text-lg font-semibold text-white mb-4">
            {language === 'en' ? 'Why Choose RE?' : 'لماذا تختار RE؟'}
          </h3>
          <ul className="space-y-3">
            {[
              { en: '360° Virtual Tours', ar: 'جولات افتراضية 360 درجة' },
              { en: 'Pi Network Payments', ar: 'دفع عبر شبكة Pi' },
              { en: 'Tokenized Real Estate', ar: 'عقارات رمزية' },
              { en: 'Global Coverage', ar: 'تغطية عالمية' },
            ].map((item) => (
              <li key={item.en} className="flex gap-3">
                <span className="text-accent text-lg">✓</span>
                <span className="text-sm text-gray-300">{language === 'en' ? item.en : item.ar}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pi Payment */}
        <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: 'rgba(212,175,55,0.1)', borderLeft: '3px solid rgba(212,175,55,1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-accent">
              {language === 'en' ? 'Pay with Pi' : 'ادفع بـ Pi'}
            </h3>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            {language === 'en'
              ? 'Experience seamless property transactions powered by Pi Network'
              : 'اختبر معاملات العقارات السلسة المدعومة بشبكة Pi'}
          </p>
          <UnifiedPaymentButton
            propertyId="showcase-property-001"
            propertyTitle={language === 'en' ? 'Sample Luxury Property' : 'عقار فاخر للعينة'}
            price={50}
            transactionType="buy"
            language={language}
            currency="PI"
            className="w-full"
            onSuccess={() => {}}
            onError={(error) => { console.error('Payment error:', error); }}
          />
          <p className="text-xs text-gray-400 mt-3 text-center">
            {language === 'en' ? 'Secure • Fast • Decentralized' : 'آمن • سريع • لامركزي'}
          </p>
        </div>

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