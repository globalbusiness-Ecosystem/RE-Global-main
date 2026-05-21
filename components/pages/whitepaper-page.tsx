'use client';

import { ChevronDown, Mail } from 'lucide-react';
import { useState } from 'react';

interface WhitePaperPageProps {
  language: 'en' | 'ar';
  onBack: () => void;
  showBackButton?: boolean;
}

export default function WhitePaperPage({
  language,
  onBack,
  showBackButton = true,
}: WhitePaperPageProps) {
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
              {language === 'en' ? 'White Paper v1.0' : 'الورقة البيضاء v1.0'}
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
            {language === 'en' ? 'White Paper v1.0' : 'الورقة البيضاء v1.0'}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-4">
            {language === 'en'
              ? 'Global Real Estate on Pi Network'
              : 'العقارات العالمية على شبكة Pi'}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-400">
            {language === 'en'
              ? 'A revolutionary real estate marketplace powered by Pi cryptocurrency, connecting 195 countries with seamless transactions and tokenized properties.'
              : 'سوق عقارات ثوري مدعوم بعملة Pi، يربط 195 دولة مع معاملات سلسة والعقارات المرمزة.'}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="px-4 py-8 max-w-2xl mx-auto space-y-4">
        {/* 1. Vision */}
        <ExpandableSection
          id="vision"
          title={language === 'en' ? '1. Vision' : '1. الرؤية'}
          expanded={expandedSections.includes('vision')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              {language === 'en'
                ? 'First global real estate marketplace powered by Pi cryptocurrency'
                : 'أول سوق عقارات عالمي يعمل بقوة عملة Pi'}
            </p>
            <p className="text-sm text-gray-400">
              {language === 'en'
                ? 'We envision a future where real estate transactions are borderless, instant, and accessible to everyone. By leveraging Pi Network\'s infrastructure and blockchain technology, we eliminate intermediaries and reduce transaction costs by up to 80%, making property investment truly democratic.'
                : 'نتصور مستقبلاً حيث تكون معاملات العقارات بلا حدود وفورية والتي يمكن للجميع الوصول إليها. من خلال الاستفادة من البنية التحتية لشبكة Pi وتكنولوجيا البلوكتشين، نلغي الوسطاء ونقلل تكاليف المعاملات بنسبة تصل إلى 80٪، مما يجعل الاستثمار في العقارات ديمقراطياً حقاً.'}
            </p>
          </div>
        </ExpandableSection>

        {/* 2. Problem & Solution */}
        <ExpandableSection
          id="problem"
          title={language === 'en' ? '2. Problem & Solution' : '2. المشكلة والحل'}
          expanded={expandedSections.includes('problem')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-accent mb-2">
                {language === 'en' ? 'Traditional Real Estate Barriers:' : 'حواجز العقارات التقليدية:'}
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>{language === 'en' ? '• High transaction fees (2-6% per transaction)' : '• رسوم معاملات عالية (2-6٪ لكل معاملة)'}</li>
                <li>{language === 'en' ? '• Complex verification and paperwork (weeks to months)' : '• التحقق المعقد والأوراق (أسابيع إلى أشهر)'}</li>
                <li>{language === 'en' ? '• Limited to local markets and currencies' : '• محدود بالأسواق المحلية والعملات'}</li>
                <li>{language === 'en' ? '• Fractional ownership not accessible' : '• الملكية الكسرية غير متاحة'}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-accent mb-2">
                {language === 'en' ? 'RE Platform Solution:' : 'حل منصة RE:'}
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>{language === 'en' ? '✓ Instant Pi payments with <0.1% fees' : '✓ دفع Pi فوري برسوم <0.1٪'}</li>
                <li>{language === 'en' ? '✓ Smart contracts eliminate paperwork' : '✓ العقود الذكية تلغي الأوراق'}</li>
                <li>{language === 'en' ? '✓ Global access to 195+ countries' : '✓ وصول عالمي إلى 195+ دولة'}</li>
                <li>{language === 'en' ? '✓ Tokenized properties enable fractional investing' : '✓ العقارات المرمزة تتيح الاستثمار الكسري'}</li>
              </ul>
            </div>
          </div>
        </ExpandableSection>

        {/* 3. Features */}
        <ExpandableSection
          id="features"
          title={language === 'en' ? '3. Key Features' : '3. الميزات الرئيسية'}
          expanded={expandedSections.includes('features')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureCard
              icon="360"
              title={language === 'en' ? '360° Virtual Tours' : 'جولات افتراضية 360°'}
              description={language === 'en' ? 'Immersive property exploration' : 'استكشاف عقاري غامر'}
            />
            <FeatureCard
              icon="🗺️"
              title={language === 'en' ? 'Global Map' : 'الخريطة العالمية'}
              description={language === 'en' ? 'Browse 195+ countries' : 'تصفح 195+ دولة'}
            />
            <FeatureCard
              icon="π"
              title={language === 'en' ? 'Instant Pi Payments' : 'دفع Pi الفوري'}
              description={language === 'en' ? 'Fast & secure transactions' : 'معاملات سريعة وآمنة'}
            />
            <FeatureCard
              icon="🏆"
              title={language === 'en' ? 'Tokenized Properties' : 'العقارات المرمزة'}
              description={language === 'en' ? 'Fractional ownership' : 'الملكية الكسرية'}
            />
            <FeatureCard
              icon="✓"
              title={language === 'en' ? 'Smart Contracts' : 'العقود الذكية'}
              description={language === 'en' ? 'Transparent automation' : 'أتمتة شفافة'}
            />
            <FeatureCard
              icon="🌐"
              title={language === 'en' ? 'Multi-Language' : 'متعدد اللغات'}
              description={language === 'en' ? 'EN & AR support' : 'دعم EN و AR'}
            />
          </div>
        </ExpandableSection>

        {/* 4. RE Token */}
        <ExpandableSection
          id="token"
          title={language === 'en' ? '4. RE Token Tokenomics' : '4. اقتصاديات رمز RE'}
          expanded={expandedSections.includes('token')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en' ? 'Total Supply' : 'الإمداد الكلي'}
                </p>
                <p className="text-lg font-bold text-accent">100M RE</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en' ? 'Launch Price' : 'سعر الإطلاق'}
                </p>
                <p className="text-lg font-bold text-accent">0.01π</p>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="space-y-2">
              <h4 className="font-semibold text-accent mb-3">
                {language === 'en' ? 'Token Distribution' : 'توزيع الرموز'}
              </h4>

              {/* 40% Platform */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    {language === 'en' ? 'Platform Development' : 'تطوير المنصة'}
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
                    {language === 'en' ? 'Investors & Partners' : 'المستثمرون والشركاء'}
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
                    {language === 'en' ? 'Team & Operations' : 'الفريق والعمليات'}
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
                    {language === 'en' ? 'Emergency Reserve' : 'الاحتياطي الطارئ'}
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
              {language === 'en'
                ? 'RE tokens power platform transactions, governance voting, and staking rewards. Early investors receive additional benefits through locked staking and rewards multipliers.'
                : 'رموز RE تشغل معاملات المنصة والتصويت على الحوكمة ومكافآت الرهن. يحصل المستثمرون الأوائل على فوائد إضافية من خلال الرهن المقفول ومضاعفات المكافآت.'}
            </p>
          </div>
        </ExpandableSection>

        {/* 5. Roadmap */}
        <ExpandableSection
          id="roadmap"
          title={language === 'en' ? '5. Roadmap' : '5. خريطة الطريق'}
          expanded={expandedSections.includes('roadmap')}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <RoadmapPhase
              quarter={language === 'en' ? 'Q1 2025' : 'الربع الأول 2025'}
              title={language === 'en' ? 'Launch' : 'الإطلاق'}
              items={language === 'en'
                ? ['Platform launch', 'Core features live', '1000+ properties listed']
                : ['إطلاق المنصة', 'الميزات الأساسية مباشرة', '1000+ عقار معروض']}
              isFirst
            />
            <RoadmapPhase
              quarter={language === 'en' ? 'Q2 2025' : 'الربع الثاني 2025'}
              title={language === 'en' ? 'Properties' : 'العقارات'}
              items={language === 'en'
                ? ['50+ countries', 'Mobile app launch', 'Advanced filtering']
                : ['50+ دولة', 'إطلاق تطبيق الهاتف الذكي', 'تصفية متقدمة']}
            />
            <RoadmapPhase
              quarter={language === 'en' ? 'Q3 2025' : 'الربع الثالث 2025'}
              title={language === 'en' ? 'Tokenization' : 'الرمزنة'}
              items={language === 'en'
                ? ['Property tokenization', 'Fractional ownership', 'Secondary market']
                : ['رمزنة العقارات', 'الملكية الكسرية', 'السوق الثانوية']}
            />
            <RoadmapPhase
              quarter={language === 'en' ? 'Q4 2025' : 'الربع الرابع 2025'}
              title={language === 'en' ? 'Global Expansion' : 'التوسع العالمي'}
              items={language === 'en'
                ? ['195+ countries', 'Enterprise features', 'DAO governance']
                : ['195+ دولة', 'ميزات المؤسسة', 'حوكمة DAO']}
              isLast
            />
          </div>
        </ExpandableSection>

        {/* 6. Team */}
        <ExpandableSection
          id="team"
          title={language === 'en' ? '6. Team' : '6. الفريق'}
          expanded={expandedSections.includes('team')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-accent mb-2">
                {language === 'en' ? 'GlobalBusiness Team' : 'فريق GlobalBusiness'}
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                {language === 'en'
                  ? 'A dedicated team of blockchain developers, real estate experts, and Pi Network specialists working to revolutionize global real estate.'
                  : 'فريق متفاني من مطوري البلوكتشين وخبراء العقارات ومتخصصي شبكة Pi يعملون على إحداث ثورة في العقارات العالمية.'}
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
              {language === 'en'
                ? 'Contact us to join the RE Platform team or become a partner.'
                : 'تواصل معنا للانضمام إلى فريق منصة RE أو لتصبح شريكاً.'}
            </p>
          </div>
        </ExpandableSection>
      </div>

      {/* CTA Footer */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-accent/10 to-purple-600/10 border border-accent/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-accent mb-2">
            {language === 'en'
              ? 'Join the Real Estate Revolution'
              : 'انضم إلى ثورة العقارات'}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {language === 'en'
              ? 'Start exploring, investing, and earning with RE Platform today.'
              : 'ابدأ الاستكشاف والاستثمار والكسب مع منصة RE اليوم.'}
          </p>
          <button className="w-full bg-accent text-background py-3 rounded-lg font-semibold hover:opacity-90 transition">
            {language === 'en' ? 'Get Started Free' : 'ابدأ مجاناً'}
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
