import { streamText, convertToModelMessages } from 'ai';

interface UserContext {
  username?: string;
  balance?: number;
}

interface RequestBody {
  messages: any[];
  userContext?: UserContext;
}

export async function POST(req: Request) {
  try {
    const { messages, userContext } = await req.json() as RequestBody;

    // Property database indexed by user balance for recommendations
    const propertyRecommendations = {
      budget: [
        { name: 'Cairo Studio', country: 'Egypt', price: 5, type: 'Buy', roi: '8%' },
        { name: 'Alexandria Apartment', country: 'Egypt', price: 8, type: 'Rent', roi: '6%' },
        { name: 'Dubai Off-Plan', country: 'UAE', price: 10, type: 'Off-Plan', roi: '12%' },
      ],
      moderate: [
        { name: 'Manhattan Penthouse', country: 'USA', price: 50, type: 'Buy', roi: '9%' },
        { name: 'London Townhouse', country: 'UK', price: 45, type: 'Buy', roi: '7%' },
        { name: 'Tokyo Hotel Suite', country: 'Japan', price: 35, type: 'Hotel', roi: '15%' },
        { name: 'Paris Apartment Block', country: 'France', price: 40, type: 'Tokenized', roi: '11%' },
      ],
      premium: [
        { name: 'Singapore Office Tower', country: 'Singapore', price: 200, type: 'Buy', roi: '10%' },
        { name: 'Sydney Waterfront Estate', country: 'Australia', price: 180, type: 'Buy', roi: '8%' },
        { name: 'Hong Kong Luxury Residential', country: 'Hong Kong', price: 250, type: 'Tokenized', roi: '14%' },
        { name: 'Vancouver Mixed Development', country: 'Canada', price: 150, type: 'Off-Plan', roi: '13%' },
      ],
    };

    // Market trends data
    const marketTrends = {
      en: `
📊 CURRENT MARKET TRENDS (Q1 2026):

🌍 GLOBAL MARKETS:
• Dubai: +15% YoY appreciation, strong demand for off-plan
• Egypt: +12% growth, emerging markets opportunity
• USA: Stable 6-8% appreciation, rental yields 4-6%
• London: +8% YoY, post-Brexit recovery accelerating
• Tokyo: +10% appreciation, commercial sector booming
• Singapore: Premium growth +7%, steady returns

💹 PROPERTY TYPE PERFORMANCE:
• Tokenized Real Estate: +25% (highest growth), lowest entry point
• Off-Plan: +18%, great for long-term appreciation
• Hotel/Hospitality: +22%, strong recovery post-2023
• Residential Rentals: +11%, stable cash flow
• Commercial: +8%, strategic locations only

🎯 INVESTMENT OPPORTUNITIES:
• Budget Properties (under 15π): Best for diversification
• Moderate (15-75π): Balanced growth and income
• Premium (75+π): Portfolio diversification and wealth preservation
      `,
      ar: `
📊 اتجاهات السوق الحالية (Q1 2026):

🌍 الأسواق العالمية:
• دبي: +15% سنويًا، طلب قوي على المشاريع قيد الإنشاء
• مصر: نمو +12%، فرصة الأسواق الناشئة
• الولايات المتحدة: ارتفاع مستقر 6-8%، عوائد إيجار 4-6%
• لندن: +8% سنويًا، التعافي بعد بريكست يتسارع
• طوكيو: +10% ارتفاع، قطاع تجاري مزدهر
• سنغافورة: نمو فاخر +7%، عوائد مستقرة

💹 أداء أنواع العقارات:
• العقارات المرمزة: +25% (أعلى نمو)، أقل نقطة دخول
• قيد الإنشاء: +18%، رائع للارتفاع طويل الأمد
• الفنادق/الضيافة: +22%، تعافي قوي
• الإيجار السكني: +11%، تدفق نقدي مستقر
• تجاري: +8%، مواقع استراتيجية فقط
      `
    };

    // Determine user budget tier
    const balance = userContext?.balance || 0;
    let budgetTier = 'budget';
    if (balance >= 50) budgetTier = 'premium';
    else if (balance >= 20) budgetTier = 'moderate';

    const recommendations = propertyRecommendations[budgetTier as keyof typeof propertyRecommendations] || propertyRecommendations.budget;
    const trends = marketTrends[userContext?.language || 'en' as keyof typeof marketTrends] || marketTrends.en;

    const systemPrompt = `You are Aladdin, an AI real estate advisor powered by Pi Network. You are a professional expert specializing in global property markets and Pi Network payments. 

CRITICAL INSTRUCTION: Always respond to EVERY user message with helpful real estate investment advice. Never say "I don't know" or refuse to help. Provide specific, actionable guidance based on their question.

USER PROFILE:
- Username: ${userContext?.username || 'Investor'}
- Pi Balance: ${balance} π
- Budget Tier: ${budgetTier.toUpperCase()}

YOUR RESPONSE STRATEGY:

1. PROPERTY QUESTIONS (if user asks about properties, investments, listings):
   - Recommend exactly 3 top properties matching their budget tier
   - Include: Property name, location, price in π, property type, expected ROI
   - Explain why each property is good for them
   - Add diversification tips

2. MARKET/TRENDS QUESTIONS (if user asks about market, trends, prices):
   - Reference these current trends:
${trends}
   - Provide specific numbers: growth rates, ROI percentages, regional comparisons
   - Explain which markets are performing best for their budget
   - Suggest timing for investment

3. PI PAYMENT QUESTIONS (if user asks about buying with Pi, payments, transactions):
   - Explain: Zero-fee transactions, instant settlement, global 24/7 access
   - Show exactly how they can spend their ${balance}π on properties
   - Describe smart contracts and blockchain verification
   - Mention fractional ownership starting from 1π

4. GENERAL INVESTMENT ADVICE:
   - Always mention their specific balance and buying power
   - Reference their budget tier and recommended property types
   - Suggest portfolio diversification across 3+ countries
   - Include expected ROI ranges for their tier: Budget 6-8%, Moderate 8-12%, Premium 10-15%

TOP PROPERTIES FOR ${userContext?.username || 'THIS USER'} (${budgetTier.toUpperCase()} TIER):
${recommendations.map((p: any, i: number) => `   ${i + 1}. ${p.name} (${p.country}) - ${p.price}π - ${p.type} - ROI: ${p.roi}`).join('\n')}

TONE: Friendly, professional, enthusiastic about real estate and Pi Network. Always encourage action and exploration.

REMEMBER: Answer in the same language the user is using. Always respond with specific property or market advice.`;

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[v0] Advisor API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
