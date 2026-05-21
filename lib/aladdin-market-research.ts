/**
 * Aladdin Market Research Service
 * Real-time market data integration with Pi Network conversion
 */

interface MarketData {
  location: string;
  currency: string;
  pricePerSqft: number;
  rentalYield: number;
  source: string;
  lastUpdated: Date;
}

interface PiConversion {
  marketPrice: number;
  piEquivalent: number;
  conversionRate: number;
  tokenizationOptions: {
    fractionalShares: number;
    minimumInvestment: number;
    piRequired: number;
  };
}

// Pi Network conversion rates (from ecosystem whitepaper)
const PI_CONVERSION_RATES = {
  'USD_to_PI': 0.0625, // Approximate conversion based on Pi Network valuation
  'AED_to_PI': 0.017,
  'EGP_to_PI': 0.002,
};

/**
 * Fetch real-time market data using web search
 */
export async function fetchMarketData(location: string): Promise<MarketData> {
  try {
    const response = await fetch(`/api/market-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, language: 'en' }),
    });

    if (!response.ok) throw new Error('Failed to fetch market data');
    return response.json();
  } catch (error) {
    console.error(`[v0] Market research error for ${location}:`, error);
    throw error;
  }
}

/**
 * Convert market price to Pi equivalent
 */
export function convertToPi(amount: number, currency: string): PiConversion {
  const rate = PI_CONVERSION_RATES[`${currency}_to_PI`] || 0.0625;
  const piEquivalent = amount * rate;

  return {
    marketPrice: amount,
    piEquivalent: Math.round(piEquivalent * 100) / 100,
    conversionRate: rate,
    tokenizationOptions: {
      fractionalShares: Math.floor(piEquivalent / 10), // 10 Pi per share
      minimumInvestment: 100, // Pi
      piRequired: Math.ceil((amount * 0.1) * rate), // 10% down in Pi
    },
  };
}

/**
 * Generate strategic market comparison
 */
export function generateMarketComparison(
  marketData: MarketData,
  reOpportunity: { piPrice: number; location: string; roi: number }
) {
  const piMarketEquivalent = convertToPi(marketData.pricePerSqft * 10000, 'USD');

  return {
    marketAverage: {
      location: marketData.location,
      pricePerSqft: marketData.pricePerSqft,
      rentalYield: `${(marketData.rentalYield * 100).toFixed(2)}%`,
      piEquivalent: piMarketEquivalent.piEquivalent,
    },
    reOpportunity: {
      location: reOpportunity.location,
      piPrice: reOpportunity.piPrice,
      expectedRoi: `${(reOpportunity.roi * 100).toFixed(2)}%`,
      advantage: `${(((reOpportunity.roi - marketData.rentalYield) / marketData.rentalYield) * 100).toFixed(1)}% higher returns`,
    },
    recommendation: {
      text: reOpportunity.roi > marketData.rentalYield 
        ? 'RE Opportunity shows superior returns' 
        : 'Market-competitive opportunity',
      source: marketData.source,
      lastUpdated: marketData.lastUpdated,
    },
  };
}

/**
 * Format market insight for voice response (Arabic/English bilingual)
 */
export function formatMarketInsight(
  data: MarketData,
  language: 'ar' | 'en'
): string {
  if (language === 'ar') {
    return `
سوق ${data.location}:
السعر: ${data.pricePerSqft.toLocaleString('ar-EG')} ${data.currency}/متر مربع
العائد الإيجاري: ${(data.rentalYield * 100).toFixed(2)}%
المصدر: ${data.source}
آخر تحديث: ${data.lastUpdated.toLocaleDateString('ar-EG')}
    `.trim();
  }

  return `
Market in ${data.location}:
Price: ${data.pricePerSqft.toLocaleString('en-US')} ${data.currency}/sqft
Rental Yield: ${(data.rentalYield * 100).toFixed(2)}%
Source: ${data.source}
Last Updated: ${data.lastUpdated.toLocaleDateString('en-US')}
  `.trim();
}

export default {
  fetchMarketData,
  convertToPi,
  generateMarketComparison,
  formatMarketInsight,
  PI_CONVERSION_RATES,
};
