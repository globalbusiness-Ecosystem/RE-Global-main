export const dynamic = 'force-dynamic';
import { generateText } from 'ai';

// Cache market data to avoid recalculation
const MARKET_DATA_CACHE = {
  cities: [
    { city: 'Dubai', change: 1.9, avgPrice: 92500 },
    { city: 'New York', change: 3.1, avgPrice: 73400 },
    { city: 'London', change: 2.3, avgPrice: 83100 },
    { city: 'Paris', change: 2.7, avgPrice: 101200 },
    { city: 'Tokyo', change: 3.0, avgPrice: 55800 },
  ],
  globalTrend: 2.5,
  trackingCities: 8,
};

// Response cache with TTL (1 hour)
let cachedResponse: { en: string; ar: string } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 3600000; // 1 hour in ms

export const revalidate = 3600; // ISR revalidation every 1 hour

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const language = (url.searchParams.get('language') || 'en') as 'en' | 'ar';

    // Return cached response if valid
    const now = Date.now();
    if (cachedResponse && now - cacheTimestamp < CACHE_TTL) {
      return Response.json(
        {
          timestamp: new Date().toISOString(),
          language,
          report: cachedResponse[language],
          marketData: MARKET_DATA_CACHE,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    // Generate new reports
    const reportPrompts = {
      en: `Generate a concise professional weekly real estate market report for Pi Network properties. Format as structured sections:

MARKET OVERVIEW: ${MARKET_DATA_CACHE.globalTrend}% average growth across ${MARKET_DATA_CACHE.trackingCities} cities

TOP PERFORMERS: ${MARKET_DATA_CACHE.cities.map(c => `${c.city} (+${c.change}%)`).join(', ')}

KEY INSIGHTS: 
- Which markets show strongest momentum
- Best opportunities for different investor types
- Risk areas to monitor

Keep it concise and data-driven.`,

      ar: `أنشئ تقرير سوق عقاري أسبوعي احترافي موجز لخصائص شبكة Pi. نسق كأقسام منظمة:

نظرة عامة على السوق: نمو بمتوسط ${MARKET_DATA_CACHE.globalTrend}٪ عبر ${MARKET_DATA_CACHE.trackingCities} مدن

أفضل الأداء: ${MARKET_DATA_CACHE.cities.map(c => `${c.city} (+${c.change}%)`).join(', ')}

الرؤى الرئيسية:
- الأسواق التي تظهر أقوى زخم
- أفضل الفرص لأنواع مختلفة من المستثمرين
- مناطق المخاطر المراقبة

اجعله موجزاً ومدفوعاً بالبيانات.`,
    };

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: reportPrompts[language],
      temperature: 0.6,
      maxTokens: 600,
    });

    // Update cache
    if (!cachedResponse) {
      cachedResponse = { en: result.text, ar: result.text };
    } else {
      cachedResponse[language] = result.text;
    }
    cacheTimestamp = now;

    return Response.json(
      {
        timestamp: new Date().toISOString(),
        language,
        report: result.text,
        marketData: MARKET_DATA_CACHE,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('[v0] Market report generation error:', error);
    return Response.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
