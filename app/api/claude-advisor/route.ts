import { Anthropic } from '@anthropic-ai/sdk';
import { 
  aladdinConfig, 
  generateREComparison, 
  generateCTA, 
  convertToPI,
  generatePiComparisonText
} from '@/lib/aladdin-system-config';

interface RequestBody {
  message: string;
  language?: string;
}

// Comprehensive real estate knowledge base
const KNOWLEDGE_BASE = {
  markets: {
    UAE: {
      markets: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
      avgPrices: '400k-3M AED',
      roiRange: '8-15%',
      visaProgram: 'Golden Visa: 1M AED property investment',
      highlights: ['Freehold in designated zones', 'Fast registration', 'Strong rental yields'],
    },
    Egypt: {
      markets: ['Cairo', 'Alexandria', 'New Administrative Capital', 'Giza'],
      avgPrices: '150k-1M EGP',
      roiRange: '8-12%',
      visaProgram: 'Real Estate Investment Visa available',
      highlights: ['Affordable entry point', 'High appreciation potential', 'Golden triangle markets'],
    },
    Saudi: {
      markets: ['Riyadh', 'Jeddah', 'Dammam', 'Qassim'],
      avgPrices: '300k-2M SAR',
      roiRange: '6-10%',
      visaProgram: 'Investor Visa: 500k SAR minimum',
      highlights: ['Islamic financing available', 'Vision 2030 growth', 'Stable market'],
    },
    USA: {
      markets: ['New York', 'Los Angeles', 'Miami', 'Austin', 'Seattle'],
      avgPrices: '300k-1M USD',
      roiRange: '6-10%',
      visaProgram: 'EB-5 Visa: 1M USD minimum investment',
      highlights: ['Stable market', 'Strong rental yields', 'Federal protections'],
    },
    UK: {
      markets: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
      avgPrices: '250k-1.5M GBP',
      roiRange: '6-9%',
      visaProgram: 'Tier 1 Investor Visa: 2M GBP',
      highlights: ['Heritage properties', 'Strong rental market', 'Leasehold protection'],
    },
    Europe: {
      markets: ['Paris', 'Berlin', 'Barcelona', 'Amsterdam', 'Dublin'],
      avgPrices: '200k-1.2M EUR',
      roiRange: '5-8%',
      visaProgram: 'Golden Visa programs (varies by country)',
      highlights: ['EU market access', 'Stable economies', 'Cultural value'],
    },
    Asia: {
      markets: ['Singapore', 'Hong Kong', 'Tokyo', 'Bangkok', 'Dubai'],
      avgPrices: '400k-2M USD',
      roiRange: '8-15%',
      visaProgram: 'Long-term residency options',
      highlights: ['High growth potential', 'Luxury markets', 'Tech hubs'],
    },
  },
  piNetworkTips: [
    'Diversify across 3-5 properties for optimal risk management',
    'Tokenized properties offer fractional ownership starting from 1π',
    'Monthly rental income paid directly to Pi wallet with zero fees',
    'Lock profits by selling tokenized units anytime on secondary market',
    'Compound returns: Reinvest monthly Pi earnings into new properties',
    'Portfolio target: Mix 50% stable rentals + 50% growth off-plans',
    'Use Pi smart contracts for automated rent distribution',
    'Track ROI using blockchain-verified property data',
  ],
};

// Language detection helper
function detectLanguage(message: string): string {
  const arabicRegex = /[\u0600-\u06FF]/g;
  const arabicChars = message.match(arabicRegex)?.length || 0;
  return arabicChars > message.length * 0.3 ? 'ar' : 'en';
}

// System prompt generator
function generateSystemPrompt(language: string): string {
  const isArabic = language === 'ar';

  return isArabic ? `أنت علاء الدين، أفضل مستشار عقاري عالمي على شبكة Pi Network. أنت خبير شامل في:

🌍 الأسواق العقارية العالمية:
• الإمارات: دبي، أبو ظبي، الشارقة - أسعار 400k-3M درهم، عوائد 8-15%
• مصر: القاهرة، الإسكندرية، العاصمة الإدارية - أسعار 150k-1M جنيه، عوائد 8-12%
• السعودية: الرياض، جدة، الدمام - أسعار 300k-2M ريال، عوائد 6-10%
• أمريكا: نيويورك، لوس أنجليس، ميامي - أسعار 300k-1M دولار، عوائد 6-10%
• المملكة المتحدة: لندن، مانشستر، برمنغهام - أسعار 250k-1.5M جنيه، عوائد 6-9%
• أوروبا: باريس، برلين، برشلونة - أسعار 200k-1.2M يورو، عوائد 5-8%
• آسيا: سنغافورة، هونغ كونغ، طوكيو - أسعار 400k-2M دولار، عوائد 8-15%

💼 الخبرات المتخصصة:
✓ الاستثمار العقاري والاستراتيجيات المتقدمة
✓ تحليل العائد على الاستثمار (ROI) لكل دولة
✓ تأشيرات الاستثمار الذهبية ببرامجها المختلفة
✓ المخاطر في المشاريع قيد الإنشاء والتخفيف منها
✓ دفع Pi Network وتكامله في العقارات
✓ نصائح الرهن العقاري والتمويل
✓ اتجاهات السوق ودراسات الجدوى
✓ القوانين والأنظمة حسب كل دولة
✓ العقود والحقوق القانونية
✓ الضرائب والاعتبارات المالية

📋 نهجك في الرد:
1. الرد بنفس لغة المستخدم (تلقائياً)
2. كن احترافياً وملماً بالتفاصيل والفوائد
3. أعطِ إجابات شاملة وعملية ومفيدة
4. أجب على ANY سؤال - ولا تحتج بعدم معرفتك
5. ركز على قيمة الاستثمار والعوائد المحتملة
6. اذكر تأثير Pi Network على التحويلات
7. في النهاية دائماً: اختم بنصيحة استثمار Pi

🎯 يجب أن تختم كل رد بـ:
"💡 نصيحة استثمار Pi: [نصيحة محددة وعملية من قائمة نصائح Pi]"

كن ودوداً، مهنياً، وشاملاً. لا تخف من تقديم تحليلات معمقة. لا تقل "آسف لا أستطيع" - قدم إجابة مفيدة بدلاً من ذلك.`
    : `You are Aladdin, the world-class real estate advisor on Pi Network. You are an expert in:

🌍 Global Real Estate Markets:
• UAE: Dubai, Abu Dhabi, Sharjah - Prices 400k-3M AED, ROI 8-15%
• Egypt: Cairo, Alexandria, New Admin Capital - Prices 150k-1M EGP, ROI 8-12%
• Saudi Arabia: Riyadh, Jeddah, Dammam - Prices 300k-2M SAR, ROI 6-10%
• USA: New York, Los Angeles, Miami - Prices 300k-1M USD, ROI 6-10%
• UK: London, Manchester, Birmingham - Prices 250k-1.5M GBP, ROI 6-9%
• Europe: Paris, Berlin, Barcelona - Prices 200k-1.2M EUR, ROI 5-8%
• Asia: Singapore, Hong Kong, Tokyo - Prices 400k-2M USD, ROI 8-15%

💼 Expert Knowledge:
✓ Real estate investment strategies & portfolio optimization
✓ ROI analysis for every market and property type
✓ Golden Visa programs by country & requirements
✓ Off-plan property risks & mitigation strategies
✓ Pi Network payment integration & benefits
✓ Mortgage tips, financing options & rates
✓ Market trends, forecasts & opportunities
✓ Country-specific laws & regulations
✓ Contracts, ownership rights & legal protections
✓ Tax considerations & financial planning

📋 Your Response Approach:
1. Answer in the user's language (auto-detect)
2. Be professional, detailed, and genuinely helpful
3. Provide actionable, specific insights
4. ANSWER ANY QUESTION - never refuse or say you don't know
5. Focus on investment value, ROI, and opportunities
6. Highlight Pi Network's advantages for transactions
7. Always end with a Pi investment tip

🎯 Your Response Format:
- Provide comprehensive answer to the question
- Be specific with numbers, percentages, and timeframes
- Offer alternative strategies when applicable
- Always end with:
"💡 Pi Investment Tip: [Specific, actionable tip from Pi strategy]"

Be friendly, authoritative, and thorough. Never apologize for knowledge gaps - provide a helpful answer instead.`;
}

export async function POST(req: Request) {
  try {
    const { message, language: providedLanguage } = await req.json() as RequestBody;

    // Auto-detect language from message if not provided
    const detectedLanguage = providedLanguage || detectLanguage(message);
    const isArabic = detectedLanguage === 'ar';

    const client = new Anthropic();

    const systemPrompt = generateSystemPrompt(isArabic ? 'ar' : 'en');

    const enhancedMessage = `Context: ${isArabic ? 'الأسواق المرجعية' : 'Reference Markets'}: ${JSON.stringify(KNOWLEDGE_BASE.markets, null, 2)}\n\nUser Question: ${message}`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: enhancedMessage,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    let text = textContent && textContent.type === 'text' ? textContent.text : 'Unable to generate response';

    // Ensure Pi tip is included
    if (!text.includes('💡 Pi')) {
      const randomTip = KNOWLEDGE_BASE.piNetworkTips[Math.floor(Math.random() * KNOWLEDGE_BASE.piNetworkTips.length)];
      text += isArabic 
        ? `\n\n💡 نصيحة استثمار Pi: ${randomTip}`
        : `\n\n💡 Pi Investment Tip: ${randomTip}`;
    }

    return Response.json({
      success: true,
      response: text,
      powered: true,
      language: isArabic ? 'ar' : 'en',
    });
  } catch (error) {
    console.error('[v0] Claude API error:', error);
    return Response.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
