import { aladdinConfig } from './aladdin-system-config';

export interface AladdinResponse {
  message: string;
  language: 'en' | 'ar';
  marketData?: any;
  recommendations?: any[];
  conversionData?: any;
  cta?: string[];
}

/**
 * Aladdin AI Advisor Utility
 * Core logic for real estate advice on Pi Network
 */

export class AladdinAdvisor {
  // Pi Network conversion rates
  private piRates = {
    'USD': 0.0625,
    'AED': 0.017,
    'EGP': 0.002,
    'TRY': 0.0025,
    'GBP': 0.08,
  };

  // Bilingual strings
  private strings = {
    en: {
      marketAnalysis: 'Market Analysis:',
      piConversion: 'Pi Network Conversion:',
      recommendation: 'Recommendation:',
      advantage: 'Advantage over market average:',
      investNow: 'Ready to invest? Tap \'Buy Now\' or visit our platform',
      whatsappSupport: 'Need expert guidance? Chat with our team via WhatsApp: +201010810558',
      viewListings: 'View detailed property listings on our platform',
    },
    ar: {
      marketAnalysis: 'تحليل السوق:',
      piConversion: 'تحويل شبكة Pi:',
      recommendation: 'التوصية:',
      advantage: 'الميزة على متوسط السوق:',
      investNow: 'مستعد للاستثمار؟ اضغط على \'اشتري الآن\' أو قم بزيارة منصتنا',
      whatsappSupport: 'تحتاج إلى التوجيه من الخبراء؟ اتصل بفريقنا عبر WhatsApp: +201010810558',
      viewListings: 'عرض قائمة العقارات التفصيلية على منصتنا',
    }
  };

  /**
   * Convert currency amount to Pi equivalent
   */
  convertToPi(amount: number, currency: string): number {
    const rate = this.piRates[currency as keyof typeof this.piRates] || this.piRates['USD'];
    return amount * rate;
  }

  /**
   * Generate market analysis for a location
   */
  async analyzeMarket(location: string, language: 'en' | 'ar' = 'en'): Promise<AladdinResponse> {
    const market = aladdinConfig.markets[location.toLowerCase()];
    
    if (!market) {
      return {
        message: language === 'ar' 
          ? 'عذراً، لم أتمكن من العثور على بيانات السوق لهذا الموقع.'
          : 'Sorry, I couldn\'t find market data for this location.',
        language,
      };
    }

    const piEquivalent = this.convertToPi(market.avgPrice, market.currency);
    const tokenizedShares = Math.floor(piEquivalent / 10);

    const response: AladdinResponse = {
      message: `${this.strings[language].marketAnalysis} ${market.city}, ${market.country}`,
      language,
      marketData: {
        city: market.city,
        avgPrice: market.avgPrice,
        currency: market.currency,
        pricePerSqft: market.pricePerSqft,
        rentalYield: (market.rentalYield * 100).toFixed(1) + '%',
        authority: market.authority,
        visa: market.visaProgram,
      },
      conversionData: {
        piEquivalent: piEquivalent.toFixed(2),
        tokenizedShares,
        sharePriceInPi: 10,
        minimumInvestment: Math.floor(piEquivalent * 0.1),
      },
      cta: [
        this.strings[language].investNow,
        this.strings[language].whatsappSupport,
        this.strings[language].viewListings,
      ]
    };

    return response;
  }

  /**
   * Generate investment recommendation based on budget
   */
  async recommendByBudget(budgetInPi: number, language: 'en' | 'ar' = 'en'): Promise<AladdinResponse> {
    let tier = 'budget';
    if (budgetInPi >= 100) tier = 'premium';
    else if (budgetInPi >= 50) tier = 'moderate';

    const recommendations = [
      { city: 'Cairo', tier: 'budget', minPi: 5, roi: '8-10%' },
      { city: 'Dubai', tier: 'moderate', minPi: 50, roi: '6-8%' },
      { city: 'Abu Dhabi', tier: 'moderate', minPi: 60, roi: '5-7%' },
      { city: 'Istanbul', tier: 'premium', minPi: 100, roi: '10-12%' },
      { city: 'London', tier: 'premium', minPi: 150, roi: '7-9%' },
    ];

    const suitable = recommendations.filter(r => r.tier === tier);

    return {
      message: language === 'ar'
        ? `بناءً على رصيدك البالغ ${budgetInPi}π، إليك أفضل الفرص:`
        : `Based on your ${budgetInPi}π budget, here are your best opportunities:`,
      language,
      recommendations: suitable,
      cta: [
        this.strings[language].investNow,
        this.strings[language].whatsappSupport,
      ]
    };
  }

  /**
   * Compare market yield vs RE opportunity yield
   */
  compareYields(marketYield: number, reYield: number, language: 'en' | 'ar' = 'en'): string {
    const difference = ((reYield - marketYield) * 100).toFixed(1);
    const isPositive = reYield > marketYield;
    
    if (language === 'ar') {
      return isPositive
        ? `عائد RE أعلى بنسبة ${difference}% من السوق`
        : `عائد السوق أعلى بنسبة ${Math.abs(parseFloat(difference))}% من RE`;
    }
    
    return isPositive
      ? `RE offers ${difference}% higher yield than market average`
      : `Market average is ${Math.abs(parseFloat(difference))}% higher than RE`;
  }

  /**
   * Generate strategic comparison analysis
   */
  async strategicComparison(location: string, language: 'en' | 'ar' = 'en'): Promise<AladdinResponse> {
    const market = aladdinConfig.markets[location.toLowerCase()];
    
    if (!market) {
      return { message: 'Market not found', language };
    }

    const comparison = this.compareYields(market.rentalYield, 0.062, language);

    return {
      message: comparison,
      language,
      marketData: {
        marketYield: (market.rentalYield * 100).toFixed(1) + '%',
        reYield: '6.2%',
        comparison,
      },
      cta: [
        this.strings[language].investNow,
        this.strings[language].whatsappSupport,
      ]
    };
  }

  /**
   * Generate conversion-focused call to action
   */
  generateCTA(language: 'en' | 'ar' = 'en'): string[] {
    return [
      this.strings[language].investNow,
      this.strings[language].whatsappSupport,
      this.strings[language].viewListings,
    ];
  }
}

// Export singleton instance
export const aladdin = new AladdinAdvisor();
