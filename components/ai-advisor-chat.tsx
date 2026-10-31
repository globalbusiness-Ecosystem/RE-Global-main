'use client';
import type { NavLanguage } from '@/lib/nav-i18n';
import { a11yLabels } from '@/lib/a11y-labels';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader, Volume2, VolumeX, Camera, Upload } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import PropertyPhotoAnalysisCard from '@/components/property-photo-analysis-card';
import { authHeaders } from '@/lib/api-token';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  poweredByAI?: boolean;
  detectedLanguage?: 'en' | 'ar';
  isPlaying?: boolean;
  photoAnalysis?: any;
  photoUrl?: string;
}

interface AIAdvisorChatProps {
  language?: NavLanguage;
  onClose: () => void;
}

import { SUGGESTED_QUESTIONS, LEGAL_FRAMEWORK, PROPERTY_DATABASE, MARKET_TRENDS, PI_PAYMENTS_GUIDE, GENERAL_ADVICE } from '@/lib/aladdin-chat-data';
import { speakMessage, stopSpeech } from '@/lib/speech-utils';


export default function AIAdvisorChat({ language, onClose }: AIAdvisorChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userContext, setUserContext] = useState<{ username?: string; balance?: number } | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Dubai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sdk, isAuthenticated } = usePiAuth();

  // Initialize with greeting message
  useEffect(() => {
    const greeting = userContext?.username 
      ? (language !== 'ar' 
        ? `Hi ${userContext.username}! I'm Aladdin, your world-class real estate advisor on Pi Network. With your Pi balance of ${userContext.balance || 0} π, I can guide you through global property markets in UAE, Egypt, Saudi Arabia, USA, UK, Europe, and Asia. I specialize in investment strategies, ROI analysis, Golden Visa programs, off-plan risks, Pi payments, mortgages, market trends, and legal advice by country. What property insights do you need today?`
        : `مرحبا ${userContext.username}! أنا علاء الدين، مستشارك العقاري العالمي على شبكة Pi. برصيدك من ${userContext.balance || 0} π، يمكنني إرشادك عبر الأسواق العقارية العالمية في الإمارات ومصر والسعودية وأمريكا والمملكة المتحدة وأوروبا وآسيا. أتخصص في استراتيجيات الاستثمار وتحليل العوائد والتأشيرات الذهبية والمخاطر والدفع بـ Pi والرهن العقاري والاتجاهات والقوانين. ما البصائر العقارية التي تحتاجها؟`)
      : (language !== 'ar'
        ? 'Hi! I\'m Aladdin, your world-class real estate advisor. I answer ANY question about global property markets, investments, ROI, legal advice, Pi payments, mortgages, and market trends. What can I help with?'
        : 'مرحبا! أنا علاء الدين، مستشارك العقاري العالمي. أجيب على ANY سؤال عن الأسواق العقارية والاستثمارات والعوائد والقانون والدفع بـ Pi والرهن والاتجاهات. كيف يمكنني مساعدتك؟');

    setMessages([{
      role: 'assistant',
      content: greeting,
      id: 'greeting-' + Date.now(),
    }]);
  }, [userContext, language]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Extract user info from Pi SDK
  useEffect(() => {
    const extractUserInfo = async () => {
      try {
        if (isAuthenticated && sdk) {
          const authResult = await (window as any).Pi.authenticate(['payments', 'username'], () => {});
          const username = authResult?.user?.username || 'Investor';
          
          let balance = 0;
          try {
            const piBalance = await (window as any).Pi.requestReadAccess?.();
            balance = piBalance || 0;
          } catch (e) {
            console.log('[v0] Balance not available');
          }
          
          setUserContext({ username, balance });
        }
      } catch (error) {
        console.log('[v0] User info extraction skipped:', error);
        setUserContext({ username: 'Investor', balance: 0 });
      }
    };

    extractUserInfo();
  }, [isAuthenticated, sdk]);

  // Determine budget tier based on user balance
  const getBudgetTier = () => {
    const balance = userContext?.balance || 0;
    if (balance >= 50) return 'premium';
    if (balance >= 20) return 'moderate';
    return 'budget';
  };

  // Real estate keywords for detection
  const REAL_ESTATE_KEYWORDS = [
    'property', 'properties', 'invest', 'best', 'rent', 'price', 'pi',
    'market', 'roi', 'dubai', 'cairo', 'egypt', 'singapore', 'london', 'tokyo',
    'apartment', 'house', 'villa', 'office', 'hotel', 'tokenized', 'off-plan',
    'rental', 'appreciation', 'mortgage', 'financing', 'portfolio', 'diversify',
    'legal', 'law', 'contract', 'agreement', 'ownership', 'rights', 'visa', 'golden',
    'risk', 'due diligence', 'checklist', 'documentation', 'title', 'deed', 'permit',
    'freehold', 'leasehold', 'fee simple', 'encumbrance', 'lien', 'easement', 'عقار', 'عقارات', 'استثمر', 'استثمار', 'أفضل', 'شراء', 'إيجار', 'سعر', 'سوق', 'اتجاهات', 'أداء', 'عائد', 'دبي', 'القاهرة', 'مصر', 'لندن', 'سنغافورة', 'طوكيو', 'شقة', 'منزل', 'فيلا', 'مكتب', 'فندق', 'إيجاري', 'ارتقاء', 'قيمة', 'رهن', 'تمويل', 'محفظة', 'تنويع'
  ];

  // General knowledge keywords related to real estate
  const GENERAL_KEYWORDS = [
    'what', 'how', 'why', 'when', 'where', 'which', 'can', 'will', 'should',
    'tips', 'guide', 'help', 'learn', 'start', 'begin', 'different', 'better',
    'difference', 'advantage', 'disadvantage', 'benefit', 'risk', 'strategy', 'ما', 'كيف', 'ليه', 'لماذا', 'متى', 'أين', 'إيه', 'أي', 'يمكن', 'يجب', 'نصائح', 'دليل', 'مساعدة', 'تعلم', 'ابدأ', 'بدأ', 'مختلف', 'أفضل', 'فرق', 'اختلاف', 'فوق', 'عيب', 'فائدة', 'مخاطرة', 'استراتيجية'
  ];

  // Legal-specific keywords (focused on clearly legal topics only)
  const LEGAL_KEYWORDS = [
    'legal', 'law', 'laws', 'legal advice', 'legal requirements',
    'golden visa', 'investor visa', 'residency visa',
    'building permit', 'construction permit',
    'title deed', 'deed of ownership',
    'freehold', 'leasehold', 'freehold zone',
    'notary', 'notarized', 'power of attorney',
    'escrow', 'escrow account',
    'due diligence', 'checklist',
    'land registration', 'title registration',
    'compliance', 'regulation', 'regulatory',
    'closing process', 'closing costs',
    'legal dispute', 'property dispute',
    'inheritance', 'inherit property',
    'contract law', 'property law',
    'قانون', 'قوانين', 'قانوني', 'قانونية', 'إجراءات', 'إجراء', 'شروط', 'متطلبات', 'تأشيرة', 'تأشيرات', 'ذهبية', 'إقامة'
  ];

  // Check if message contains legal keywords
  const hasLegalKeywords = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return LEGAL_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  // Check if message contains real estate keywords
  const hasRealEstateKeywords = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return REAL_ESTATE_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  // Check if message contains general knowledge keywords
  const hasGeneralKeywords = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return GENERAL_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  // Generate response based on hybrid smart logic
  const generateResponse = (userMessage: string): string | null => {
    const lowerMessage = userMessage.toLowerCase();
    const tier = getBudgetTier();
;
    const balance = userContext?.balance || 0;

    // Helper: detect country from user message (uses outer userMessage via closure)
    // Checks both English and Arabic location terms
    const detectCountry = (): string => {
      const lm = userMessage.toLowerCase();
      // Arabic country detection ( checked first since Arabic messages won't match English terms)
      if (lm.includes('مصر') || lm.includes('القاهرة') || lm.includes('الإسكندرية') || lm.includes('الجيزة') || lm.includes('نيل')) return 'Egypt';
      if (lm.includes('السعودية') || lm.includes('الملك') || lm.includes('الرياض') || lm.includes('جدة') || lm.includes('الدمام')) return 'Saudi';
      if (lm.includes('أمريكا') || lm.includes('الولايات') || lm.includes('نيويورك') || lm.includes('لوس أنجلوس') || lm.includes('مiami') || lm.includes('تكساس') || lm.includes('فلوريدا')) return 'USA';
      if (lm.includes('بريطانيا') || lm.includes('لندن') || lm.includes('إنجلترا') || lm.includes('المملكة') || lm.includes('مانشستر') || lm.includes('برمنغهام')) return 'UK';
      if (lm.includes('الإمارات') || lm.includes('دبي') || lm.includes('أبو ظبي') || lm.includes('الشارقة') || lm.includes('عجمان')) return 'UAE';
      if (lm.includes('سنغافورة')) return 'Singapore';
      if (lm.includes('اليابان') || lm.includes('طوكيو')) return 'Japan';
      if (lm.includes('أستراليا') || lm.includes('سيدني')) return 'Australia';
      if (lm.includes('هونغ كونغ') || lm.includes('hong kong')) return 'Hong Kong';
      // English country detection
      if (lm.includes('egypt') || lm.includes('cairo') || lm.includes('alexandria') || lm.includes('giza') || lm.includes('nile')) return 'Egypt';
      if (lm.includes('saudi') || lm.includes('kingdom') || lm.includes('riyadh') || lm.includes('jeddah') || lm.includes('dammam')) return 'Saudi';
      if (lm.includes('usa') || lm.includes('american') || lm.includes('united states') || lm.includes('new york') || lm.includes('los angeles') || lm.includes('miami') || lm.includes('texas') || lm.includes('florida')) return 'USA';
      if (lm.includes('uk') || lm.includes('england') || lm.includes('london') || lm.includes('britain') || lm.includes('manchester') || lm.includes('birmingham')) return 'UK';
      if (lm.includes('uae') || lm.includes('dubai') || lm.includes('abu dhabi') || lm.includes('emirates') || lm.includes('sharjah') || lm.includes('ajman')) return 'UAE';
      if (lm.includes('singapore')) return 'Singapore';
      if (lm.includes('japan') || lm.includes('tokyo')) return 'Japan';
      if (lm.includes('australia') || lm.includes('sydney')) return 'Australia';
      if (lm.includes('hong kong')) return 'Hong Kong';
      return 'UAE';
    };

    // Supported countries for our knowledge base (legal + market + properties)
    const SUPPORTED_COUNTRIES = ['Egypt', 'Saudi', 'USA', 'UK', 'UAE', 'Singapore', 'Japan', 'Australia', 'Hong Kong'];
    const isSupportedCountry = (country: string): boolean => SUPPORTED_COUNTRIES.includes(country);

    // Check if the default 'UAE' is a real match or just a fallback
    // When detectCountry returns 'UAE' as default (no country detected), but the message
    // doesn't contain any UAE-related terms, it likely refers to an unsupported location
    const DEFAULT_UAE = 'UAE';
    const isRealUaeQuery = (): boolean => {
      const lm = userMessage.toLowerCase();
      return lm.includes('uae') || lm.includes('dubai') || lm.includes('abu dhabi') ||
        lm.includes('emirates') || lm.includes('الإمارات') || lm.includes('دبي') ||
        lm.includes('أبو ظبي') || lm.includes('الشارقة') || lm.includes('ajman');
    };
    const isDefaultFallbackUae = (): boolean => detectCountry() === DEFAULT_UAE && !isRealUaeQuery();

    // Helper: build contextual follow-up suggestions based on intent
    const buildFollowUp = (intent: string, country: string): string => {
      const followUps: Record<string, string> = {
        legal: language !== 'ar'
          ? "\n\n💬 You might also want to ask:\n• \"What are the tax implications in ${country}?\"\n• \"How do I verify a property title in ${country}?\"\n• \"What documents do I need for ${country} property purchase?\""
          : "\n\n💬 قد توسّع سؤالك:\n• \"ما الآثار الضريبية في ${country}؟\"\n• \"كيف أتحقّق من سند ملكية في ${country}؟\"\n• \"ما المستندات المطلوبة لشراء عقار في ${country}؟\"",
        property: language !== 'ar'
          ? "\n\n💬 Consider exploring:\n• \"Show me ${country} properties in my budget tier\"\n• \"What is the ROI trend for ${country} real estate?\"\n• \"How does Pi payment work for ${country} properties?\""
          : "\n\n💬 قد تفضّل استكشاف:\n• \"أرني عقارات ${country} ضمن مثالي المالي\"\n• \"ما اتجاه عائد الاستثمار لعقارات ${country}؟\"\n• \"كيف يعمل دفع Pi لعقارات ${country}؟\"",
        market: language !== 'ar'
          ? "\n\n💬 You might also ask:\n• \"Which property type performs best in ${country}?\"\n• \"What is the entry price for ${country} real estate?\"\n• \"How do I get started investing in ${country}?\""
          : "\n\n💬 قد توسّع سؤالك:\n• \"أي نوع عقار الأداء الأفضل في ${country}؟\"\n• \"ما سعر الدخول للعقارات في ${country}؟\"\n• \"كيف أبدأ الاستثمار في ${country}؟\"",
        default: language !== 'ar'
          ? "\n\n💬 You can also ask about:\n• Specific country laws and regulations\n• Pi Network payment advantages\n• Golden Visa programs\n• Mortgage and financing options\n• Market comparisons between cities"
          : "\n\n💬 يمكنك أيضًا السؤال عن:\n• القوانين واللوائح حسب الدول\n• مميزات دفع Pi Network\n• برامج التأشيرات الذهبية\n• خيارات الرهن العقاري والتمويل\n• مقارنات السوق بين المدن",
      };
      return followUps[intent] || followUps.default;
    };
    // LEGAL QUESTIONS (Priority 1) — use helper functions from closure
    if (hasLegalKeywords(userMessage)) {
      const country = detectCountry();
      // Route to Claude if country is not supported (default UAE or unsupported)
      if (!isSupportedCountry(country) || isDefaultFallbackUae()) return null;
      const legalLang = (language !== 'ar' ? 'en' : 'ar') as 'en' | 'ar';
      const legalInfo = LEGAL_FRAMEWORK[legalLang][country as keyof typeof LEGAL_FRAMEWORK[typeof legalLang]];
      const disclaimer = language !== 'ar'
        ? '\n\n⚠️ LEGAL DISCLAIMER: This is general legal guidance only. It is not a substitute for professional legal advice. Always consult a licensed lawyer in your jurisdiction before making any real estate decisions or signing contracts.'
        : '\n\n⚠️ تنويه قانوني: هذا إرشاد قانوني عام فقط. إنه ليس بديلاً عن المشورة القانونية المتخصصة. استشر دائماً محامياً مرخصاً في نطاقك القضائي قبل اتخاذ أي قرار عقاري أو توقيع عقود.';
      return legalInfo + disclaimer + buildFollowUp('legal', country);
    }

    // LOGIC 1: Real Estate Keywords - Use existing property data
    if (hasRealEstateKeywords(userMessage)) {
      // Pi payment keywords (broadened detection)
      if (lowerMessage.includes('pi') && (lowerMessage.includes('pay') || lowerMessage.includes('transaction') || lowerMessage.includes('wallet') || lowerMessage.includes('invest') || lowerMessage.includes('payment') || lowerMessage.includes('transfer') || lowerMessage.includes('how') || lowerMessage.includes('work') || lowerMessage.includes('use') || lowerMessage.includes('advantage') || lowerMessage.includes('benefit') || lowerMessage.includes('start') || lowerMessage.includes('minimum') || lowerMessage.includes('دفع') || lowerMessage.includes('شراء') || lowerMessage.includes('معاملة') || lowerMessage.includes('محفظة') || lowerMessage.includes('استثمر') || lowerMessage.includes('استثمار') || lowerMessage.includes('تحويل') || lowerMessage.includes('كيف') || lowerMessage.includes('يعمل') || lowerMessage.includes('مميزات') || lowerMessage.includes('فائدة') || lowerMessage.includes('ابدأ') || lowerMessage.includes('أدنى') || lowerMessage.includes('الحد'))) {

        return PI_PAYMENTS_GUIDE[language === 'ar' ? 'ar' : 'en'] + (language !== 'ar' ? "\n\n💬 Want to know more? Ask about specific Pi payment scenarios." : "\n\n💬 تريد معرفة المزيد؟ اسأل عن سيناريوهات دفع Pi المحددة.");
      }

      // City comparison (Dubai vs Cairo, etc) — enhanced with strategic advice
      // Comparison: only when user explicitly compares, or mentions 2+ cities
      const hasComparisonWord = lowerMessage.includes('vs') || lowerMessage.includes('compare') || lowerMessage.includes('versus') ||
        lowerMessage.includes('أفضل بين') || lowerMessage.includes('أيهما') || lowerMessage.includes('مقارنة') || lowerMessage.includes('قارن');
      const hasDubai = lowerMessage.includes('dubai') || lowerMessage.includes('دبي') || lowerMessage.includes('uae') || lowerMessage.includes('الإمارات');
      const hasCairo = lowerMessage.includes('cairo') || lowerMessage.includes('القاهرة') || lowerMessage.includes('egypt') || lowerMessage.includes('مصر');
      const hasLondon = lowerMessage.includes('london') || lowerMessage.includes('لندن') || lowerMessage.includes('uk') || lowerMessage.includes('britain');
      const hasSingapore = lowerMessage.includes('singapore') || lowerMessage.includes('سنغافورة');
      const hasTokyo = lowerMessage.includes('tokyo') || lowerMessage.includes('طوكيو') || lowerMessage.includes('japan') || lowerMessage.includes('اليابان');
      const cityCount = [hasDubai, hasCairo, hasLondon, hasSingapore, hasTokyo].filter(Boolean).length;
      const isComparison = hasComparisonWord || cityCount >= 2;
      if (isComparison) {
        const comparison = language !== 'ar'
          ? `🏙️ DUBAI VS CAIRO COMPARISON:\n\nDUBAI:\n• Price Range: 10-250π\n• Expected ROI: 10-15% annually\n• Property Types: Luxury, Off-Plan, Hotels\n• Market Growth: +15% YoY\n• Best For: Premium investors seeking high returns\n\nCAIRO:\n• Price Range: 3-20π\n• Expected ROI: 6-12% annually\n• Property Types: Residential, Apartments, Studios\n• Market Growth: +12% YoY\n• Best For: New investors starting their portfolio\n\n💡 RECOMMENDATION:\n• Start in Cairo if new (lower entry point)\n• Diversify between both cities for balanced growth\n• Dubai for premium properties, Cairo for value`
          : `🏙️ مقارنة دبي والقاهرة:\n\nدبي:\n• نطاق الأسعار: 10-250π\n• العائد المتوقع: 10-15% سنويًا\n• أنواع العقارات: فاخرة، مشاريع، فنادق\n• نمو السوق: +15% سنويًا\n• الأفضل للـ: المستثمرين المتقدمين\n\nالقاهرة:\n• نطاق الأسعار: 3-20π\n• العائد المتوقع: 6-12% سنويًا\n• أنواع العقارات: سكنية، شقق، استوديوهات\n• نمو السوق: +12% سنويًا\n• الأفضل للـ: المستثمرين الجدد\n\n💡 التوصية:\n• ابدأ بالقاهرة إذا كنت جديدًا\n• تنوع بين كلا المدينتين\n• دبي للعقارات الفاخرة`;
        return comparison;
      }
      // Market / trends / price / ROI (with country focus + follow-up)
      if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('price') || lowerMessage.includes('roi') || lowerMessage.includes('growth') || lowerMessage.includes('performance') || lowerMessage.includes('appreciation') || lowerMessage.includes('سوق') || lowerMessage.includes('اتجاهات') || lowerMessage.includes('أداء') || lowerMessage.includes('عائد') || lowerMessage.includes('سعر') || lowerMessage.includes('قيمة')) {
        const country = detectCountry();
        // Only serve market insights for supported countries; otherwise route to Claude
        if (!isSupportedCountry(country) || isDefaultFallbackUae()) return null;
        const marketIntro = language !== 'ar'
          ? `📊 MARKET INSIGHTS — Focus: ${country}\n\n`
          : `📊 رؤى السوق — التركيز: ${country}\n\n`;
        return marketIntro + MARKET_TRENDS[language === 'ar' ? 'ar' : 'en'] + buildFollowUp('market', country);
      }

      // Property recommendation: explicit intent to get property suggestions
      // Covers English + Arabic: best/أفضل, recommend/أنصح, top/أعلى, portfolio,
      // "which property/specific", and "أين/فين" + invest/property context
      const isPropertyAsk = (lowerMessage.includes('best') || lowerMessage.includes('أفضل') ||
        lowerMessage.includes('recommend') || lowerMessage.includes('أنصح') || lowerMessage.includes('أوصي') ||
        lowerMessage.includes('top') || lowerMessage.includes('أعلى') ||
        lowerMessage.includes('portfolio') ||
        (lowerMessage.includes('which') && (lowerMessage.includes('property') || lowerMessage.includes('properties') || lowerMessage.includes('invest') || lowerMessage.includes('specific')))) ||
        ((lowerMessage.includes('أين') || lowerMessage.includes('فين')) &&
         (lowerMessage.includes('invest') || lowerMessage.includes('استثمر') || lowerMessage.includes('استثمار') ||
          lowerMessage.includes('property') || lowerMessage.includes('عقار') || lowerMessage.includes('عقارات'))) ||
        ((lowerMessage.includes('property') || lowerMessage.includes('عقار') || lowerMessage.includes('عقارات')) &&
         (lowerMessage.includes('best') || lowerMessage.includes('أفضل') ||
          lowerMessage.includes('recommend') || lowerMessage.includes('أنصح') ||
          lowerMessage.includes('top') || lowerMessage.includes('أعلى') ||
          lowerMessage.includes('where') || lowerMessage.includes('أين') ||
          (lowerMessage.includes('which') && lowerMessage.includes('property'))));
      if (isPropertyAsk) {
        const properties = PROPERTY_DATABASE[tier as keyof typeof PROPERTY_DATABASE];
        const topThree = properties.slice(0, 3);
        const balance = userContext?.balance || 0;
        const country = detectCountry();
        // Only serve property recommendations for supported countries; otherwise route to Claude
        if (!isSupportedCountry(country) || isDefaultFallbackUae()) return null;

        const response = language !== 'ar'
          ? `🏆 TOP RECOMMENDED PROPERTIES FOR YOUR PORTFOLIO:\n\n${topThree.map((p, i) => `${i + 1}. ${p.name}\n   📍 ${p.country} | 💰 ${p.price}π | 🏠 ${p.type} | 📈 ROI: ${p.roi}`).join('\n\n')}\n\nThese properties are matched to your Pi balance of ${balance}π. ${balance < 10 ? 'I recommend starting with the most accessible option and building your portfolio gradually.' : balance >= 50 ? 'With your balance level, you can diversify across multiple properties for optimal returns.' : 'Start with one property and expand your portfolio over time.'}\n${buildFollowUp('property', country)}`
          : `🏆 أفضل العقارات الموصى بها لمحفظتك:\n\n${topThree.map((p, i) => `${i + 1}. ${p.name}\n   📍 ${p.country} | 💰 ${p.price}π | 🏠 ${p.type} | 📈 العائد: ${p.roi}`).join('\n\n')}\n\n${balance < 10 ? 'أنصحك بالبدء بالخيار الأبسط وبناء محفظتك تدريجيًا.' : balance >= 50 ? 'برصيدك، يمكنك التنويع عبر عقارات متعددة لتحقيق أفضل عائد.' : 'ابدأ بعقار واحد وطور محفظتك مع الوقت.'}\n${buildFollowUp('property', country)}`;
        return response;
      }
    }

    // After real estate keywords block: if no sub-condition matched, check if we should
    // still use GENERAL_ADVICE or route to Claude (for unsupported countries)
    const detectedCountry = detectCountry();
    const countryIsSupported = isSupportedCountry(detectedCountry);

    if (hasGeneralKeywords(userMessage)) {
      // Only serve general advice for supported countries; otherwise route to Claude
      if (!countryIsSupported || isDefaultFallbackUae()) return null;
      return GENERAL_ADVICE[language === 'ar' ? 'ar' : 'en'] + buildFollowUp('default', 'Global');
    }

    // LOGIC 3: Any other question - Send to Claude API
    return null; // Signal to use Claude API
  };

  // Handle voice playback
  const handlePlayVoice = (messageId: string, content: string) => {
    if (playingMessageId === messageId) {
      // Stop current playback
      stopSpeech();
      setPlayingMessageId(null);
    } else {
      // Stop any existing playback
      if (playingMessageId) {
        stopSpeech();
      }
      
      // Start new playback
      setPlayingMessageId(messageId);
      speakMessage(content, language === 'ar' ? 'ar' : 'en', () => {
        setPlayingMessageId(null);
      });
    }
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      id: 'user-' + Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate 1.5 second typing delay
    setTimeout(async () => {
      const response = generateResponse(text);
      
      // If response is null, use Claude API
      if (response === null) {
        try {
          const apiResponse = await fetch('/api/claude-advisor', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              message: text,
              language: language,
            }),
          });

          const data = await apiResponse.json();
          
          if (data.success) {
            const assistantMessage: Message = {
              role: 'assistant',
              content: data.response,
              id: 'assistant-' + Date.now(),
              poweredByAI: true,
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } else {
            // If Claude fails, still show an error message but not a refusal
            const errorMessage: Message = {
              role: 'assistant',
              content: language !== 'ar'
                ? 'I encountered an issue processing your question. Please try again.'
                : 'واجهت مشكلة في معالجة سؤالك. يرجى المحاولة مرة أخرى.',
              id: 'assistant-' + Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        } catch (error) {
          console.error('[v0] Claude API call failed:', error);
          // Still show a helpful message, not a refusal
          const errorMessage: Message = {
            role: 'assistant',
            content: language !== 'ar'
              ? 'I encountered an issue processing your question. Please try again.'
              : 'واجهت مشكلة في معالجة سؤالك. يرجى المحاولة مرة أخرى.',
            id: 'assistant-' + Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
        setIsLoading(false);
      } else {
        // Use local response
        const assistantMessage: Message = {
          role: 'assistant',
          content: response,
          id: 'assistant-' + Date.now(),
          poweredByAI: false,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;

        // Add user message with photo
        const userMessage: Message = {
          role: 'user',
          content: language !== 'ar' ? '📸 Analyzing property photo...' : '📸 جاري تحليل صورة العقار...',
          id: 'user-photo-' + Date.now(),
          photoUrl: imageData,
        };

        setMessages((prev) => [...prev, userMessage]);

        // Call API for analysis
        try {
          const response = await fetch('/api/analyze-property-photo', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              imageData,
              city: selectedCity,
              language,
            }),
          });

          const data = await response.json();

          if (data.success && data.analysis) {
            // Add analysis message
            const analysisMessage: Message = {
              role: 'assistant',
              content: language !== 'ar' 
                ? `✅ Property analysis complete! I've detected a ${data.analysis.roomType} in ${selectedCity}. The property appears to be in ${data.analysis.condition.toLowerCase()} condition with excellent investment potential.`
                : `✅ اكتمل تحليل العقار! اكتشفت ${data.analysis.roomType} في ${selectedCity}. يبدو أن العقار في حالة ${data.analysis.condition} مع إمكانات استثمار ممتازة.`,
              id: 'assistant-analysis-' + Date.now(),
              photoAnalysis: data.analysis,
            };

            setMessages((prev) => [...prev, analysisMessage]);
          } else {
            throw new Error('Analysis failed');
          }
        } catch (error) {
          console.error('[v0] Photo analysis error:', error);
          const errorMessage: Message = {
            role: 'assistant',
            content: language !== 'ar' 
              ? 'I encountered an issue analyzing the photo. Please ensure it shows a clear property view and try again.'
              : 'واجهت مشكلة في تحليل الصورة. يرجى التأكد من أن الصورة تعرض منظر عقار واضح والمحاولة مرة أخرى.',
            id: 'assistant-error-' + Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      };

      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
      {/* Chat Container */}
      <div className="w-full h-screen md:h-[90vh] md:max-w-2xl md:mx-auto md:rounded-t-2xl bg-gradient-to-b from-[#1a1410] to-[#0f0b08] border-t border-[#F59E0B]/30 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#2a1f15] border-b border-[#F59E0B]/30 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {language !== 'ar'
                  ? 'Aladdin AI'
                  : 'علاء الدين'}
              </h2>
              <p className="text-xs text-gray-400">
                {language !== 'ar' ? 'World-Class Real Estate Advisor' : 'مستشار عقاري عالمي'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 hover:bg-[#F59E0B]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#F59E0B]" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {/* Photo Preview for user photos */}
              {message.photoUrl && (
                <div className="flex justify-end">
                  <div className="max-w-xs md:max-w-md">
                    <img 
                      src={message.photoUrl} 
                      alt="Property photo" 
                      className="w-full rounded-lg border border-[#F59E0B]/50 shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Photo Analysis Card */}
              {message.photoAnalysis && (
                <div className="flex justify-start">
                  <div className="max-w-lg w-full">
                    <PropertyPhotoAnalysisCard 
                      analysis={message.photoAnalysis}
                      language={language as 'en' | 'ar'}
                      onInvest={() => {
                        const cityInvest = language !== 'ar'
                          ? `I want to invest in the ${message.photoAnalysis.roomType} in ${selectedCity}. Can you guide me through the process?`
                          : `أريد الاستثمار في ${message.photoAnalysis.roomType} في ${selectedCity}. هل يمكنك إرشادي من خلال العملية؟`;
                        handleSendMessage(cityInvest);
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#F59E0B] text-black'
                      : 'bg-[#2a1f15] border border-[#F59E0B]/30 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Voice button for assistant messages */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handlePlayVoice(message.id, message.content)}
                      className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] transition-colors"
                      title={language !== 'ar' ? 'Listen to response' : 'استمع للإجابة'}
                    >
                      {playingMessageId === message.id ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>{language !== 'ar' ? 'Stop' : 'إيقاف'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>{language !== 'ar' ? 'Listen' : 'استمع'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {message.poweredByAI && (
                <div className="flex justify-start mt-2">
                  <span className="text-xs text-[#F59E0B] bg-[#2a1f15]/50 px-2 py-1 rounded">
                    🤖 Powered by AI
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#2a1f15] border border-[#F59E0B]/30 text-gray-100 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions - Show only initially */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-8 space-y-2">
              <p className="text-xs text-gray-400 px-2">
                {language !== 'ar'
                  ? 'Suggested questions:'
                  : 'الأسئلة المقترحة:'}
              </p>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS[language === 'ar' ? 'ar' : 'en'].map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-[#2a1f15] border border-[#F59E0B]/30 rounded-lg hover:bg-[#3a2f25] hover:border-[#F59E0B]/50 transition-colors disabled:opacity-50 text-sm text-gray-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#F59E0B]/30 bg-[#1a1410] p-4 space-y-3">
          {/* City Selector for Photo Analysis */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-gray-400">
              {language !== 'ar' ? 'Analyze for:' : 'تحليل ل:'}
            </span>
            <select 
              aria-label={language !== 'ar' ? 'Analyze for:' : 'تحليل ل:'}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs bg-[#2a1f15] border border-[#F59E0B]/30 text-white rounded px-2 py-1 focus:outline-none focus:border-[#F59E0B]"
            >
              <option>Dubai</option>
              <option>Abu Dhabi</option>
              <option>Cairo</option>
              <option>New York</option>
              <option>London</option>
              <option>Singapore</option>
            </select>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language !== 'ar'
                  ? 'Ask about properties, trends, or Pi payments...'
                  : 'اسأل عن العقارات والاتجاهات أو دفعات Pi...'
              } aria-label={
                language !== 'ar'
                  ? 'Ask about properties, trends, or Pi payments...'
                  : 'اسأل عن العقارات والاتجاهات أو دفعات Pi...'
              }
              disabled={isLoading || uploadingPhoto}
              className="flex-1 bg-[#2a1f15] border border-[#F59E0B]/30 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] disabled:opacity-50"
            />

            {/* Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || uploadingPhoto}
              title={language !== 'ar' ? 'Upload property photo for AI analysis' : 'تحميل صورة عقار للتحليل'}
              className="px-3 py-3 bg-[#2a1f15] border border-[#F59E0B]/30 hover:border-[#F59E0B]/60 text-[#F59E0B] rounded-lg transition-all disabled:opacity-50 flex items-center justify-center hover:bg-[#3a2f25]"
            >
              {uploadingPhoto ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhoto}
            />

            <button
              type="submit"
              aria-label={a11yLabels(language ?? 'en').send}
              disabled={isLoading || uploadingPhoto || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-[#F59E0B] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-2 text-[10px] leading-snug text-gray-500 text-center">
            {language !== 'ar'
              ? 'General information only, not financial or legal advice. Figures are illustrative estimates, not live data.'
              : 'معلومات عامة فقط وليست نصيحة مالية أو قانونية. الأرقام تقديرية توضيحية وليست بيانات حية.'}
          </p>
        </div>
      </div>
    </div>
  );
}
