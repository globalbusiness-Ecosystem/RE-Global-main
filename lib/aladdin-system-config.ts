// Aladdin AI System Configuration
// Implements the System Instruction Protocol for Real Estate Advisor

export interface AladdinConfig {
  brand: string;
  role: string;
  markets: Record<string, MarketData>;
  piRates: Record<string, number>;
  features: AladdinFeatures;
}

export interface MarketData {
  city: string;
  country: string;
  avgPrice: number; // USD equivalent
  currency: string;
  pricePerSqft: number;
  rentalYield: number; // percentage
  authority: string; // DLD, CBRE, etc.
  visaProgram?: string;
  tokenizationOptions?: boolean;
}

export interface AladdinFeatures {
  realTimeResearch: boolean;
  piConversion: boolean;
  strategicComparison: boolean;
  conversionDrive: boolean;
  bilingualSupport: boolean;
  authorityScitation: boolean;
}

// Aladdin Configuration
export const aladdinConfig: AladdinConfig = {
  brand: 'RE/GLOBALBUSINESS',
  role: 'World-Class Real Estate Advisor on Pi Network',
  
  markets: {
    'dubai': {
      city: 'Dubai',
      country: 'UAE',
      avgPrice: 450000,
      currency: 'AED',
      pricePerSqft: 850,
      rentalYield: 0.09,
      authority: 'DLD (Dubai Land Department)',
      visaProgram: 'Golden Visa: 1M AED property investment',
      tokenizationOptions: true,
    },
    'cairo': {
      city: 'Cairo',
      country: 'Egypt',
      avgPrice: 200000,
      currency: 'EGP',
      pricePerSqft: 1200,
      rentalYield: 0.10,
      authority: 'MHUUC (Ministry of Housing)',
      visaProgram: 'Real Estate Investment Visa',
      tokenizationOptions: true,
    },
    'abudhabi': {
      city: 'Abu Dhabi',
      country: 'UAE',
      avgPrice: 550000,
      currency: 'AED',
      pricePerSqft: 950,
      rentalYield: 0.08,
      authority: 'ADDC (Abu Dhabi Department of Communities)',
      visaProgram: 'Golden Visa: 1M AED property investment',
      tokenizationOptions: true,
    },
    'istanbul': {
      city: 'Istanbul',
      country: 'Turkey',
      avgPrice: 350000,
      currency: 'TRY',
      pricePerSqft: 420,
      rentalYield: 0.12,
      authority: 'Turkish Real Estate Registry',
      visaProgram: 'Residence Permit: 250k USD property',
      tokenizationOptions: true,
    },
    'beirut': {
      city: 'Beirut',
      country: 'Lebanon',
      avgPrice: 450000,
      currency: 'LBP',
      pricePerSqft: 2500,
      rentalYield: 0.11,
      authority: 'Lebanese Real Estate Authority',
      visaProgram: 'Golden Visa available',
      tokenizationOptions: true,
    },
    'newyork': {
      city: 'New York',
      country: 'USA',
      avgPrice: 850000,
      currency: 'USD',
      pricePerSqft: 1200,
      rentalYield: 0.07,
      authority: 'NYC Department of Finance',
      visaProgram: 'EB-5 Visa: 1M USD minimum',
      tokenizationOptions: true,
    },
    'london': {
      city: 'London',
      country: 'UK',
      avgPrice: 750000,
      currency: 'GBP',
      pricePerSqft: 950,
      rentalYield: 0.065,
      authority: 'UK Land Registry',
      visaProgram: 'Tier 1 Investor Visa: 2M GBP',
      tokenizationOptions: true,
    },
  },

  // Pi Network Exchange Rates (USD equivalent)
  piRates: {
    'usd': 1,
    'aed': 0.272, // 1 AED = 0.272 USD
    'egp': 0.021, // 1 EGP = 0.021 USD
    'try': 0.031, // 1 TRY = 0.031 USD
    'lbp': 0.000013, // 1 LBP = 0.000013 USD
    'gbp': 1.27,
    'eur': 1.09,
    'sar': 0.267,
  },

  features: {
    realTimeResearch: true,
    piConversion: true,
    strategicComparison: true,
    conversionDrive: true,
    bilingualSupport: true,
    authorityScitation: true,
  },
};

// Conversion Functions
export function convertToPI(amount: number, fromCurrency: string): number {
  // Placeholder: In production, use live Pi exchange rate from Pi Network
  const baseUSD = amount * (aladdinConfig.piRates[fromCurrency.toLowerCase()] || 1);
  const piRate = 0.13; // Example: 1 Pi = $0.13 USD (adjust based on current rate)
  return baseUSD / piRate;
}

export function getMarketInsight(market: string): MarketData | null {
  return aladdinConfig.markets[market.toLowerCase()] || null;
}

export function generatePiComparisonText(
  marketPrice: number,
  currency: string,
  language: 'en' | 'ar'
): string {
  const piPrice = convertToPI(marketPrice, currency);

  if (language === 'ar') {
    return `
السعر في السوق: ${marketPrice.toLocaleString()} ${currency}
السعر بعملة Pi: ${piPrice.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} π

✨ مميزات الاستثمار بـ Pi:
• تحويلات فورية بدون وسيط
• رسوم منخفضة جداً
• ملكية مشفرة آمنة
• عوائد شهرية مباشرة على محفظتك
• فرصة تمويل جزئي للعقار (Tokenization)
    `;
  }

  return `
Market Price: ${marketPrice.toLocaleString()} ${currency}
Pi Network Price: ${piPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} π

✨ Pi Investment Benefits:
• Instant peer-to-peer transfers
• Minimal fees & no intermediaries
• Secure blockchain ownership
• Direct monthly rental income to wallet
• Fractional ownership opportunities
• Global liquidity & accessibility
  `;
}

// Strategic Comparison with RE Project
export function generateREComparison(market: string, language: 'en' | 'ar'): string {
  const marketData = getMarketInsight(market);
  if (!marketData) return '';

  const reAdvantage = marketData.rentalYield + 0.03; // RE platform adds 3% advantage

  if (language === 'ar') {
    return `
📊 المقارنة الاستراتيجية:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
السوق المحلي (${marketData.city}):
• العائد السنوي: ${(marketData.rentalYield * 100).toFixed(1)}%
• الحد الأدنى للاستثمار: ${marketData.avgPrice.toLocaleString('ar-EG')} ${marketData.currency}
• وقت الاسترجاع: ~${(100 / (marketData.rentalYield * 100)).toFixed(1)} سنة

منصة RE على شبكة Pi:
• العائد السنوي: ${(reAdvantage * 100).toFixed(1)}% ✅
• الحد الأدنى: من 1 π فقط (تمويل جزئي)
• وقت الاسترجاع: ~${(100 / (reAdvantage * 100)).toFixed(1)} سنة
• أتمتة كاملة + معاملات فورية

🎯 الأفضلية: منصة RE أسرع بـ ${((1 - marketData.rentalYield / reAdvantage) * 100).toFixed(0)}% في الأداء
    `;
  }

  return `
📊 Strategic Comparison:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Local Market (${marketData.city}):
• Annual ROI: ${(marketData.rentalYield * 100).toFixed(1)}%
• Minimum Investment: ${marketData.avgPrice.toLocaleString('en-US')} ${marketData.currency}
• Payback Period: ~${(100 / (marketData.rentalYield * 100)).toFixed(1)} years

RE Platform on Pi Network:
• Annual ROI: ${(reAdvantage * 100).toFixed(1)}% ✅
• Minimum: From 1π only (fractional ownership)
• Payback Period: ~${(100 / (reAdvantage * 100)).toFixed(1)} years
• Full automation + instant transactions

🎯 Advantage: RE Platform is ${((1 - marketData.rentalYield / reAdvantage) * 100).toFixed(0)}% faster ROI
  `;
}

// Call-to-Action Generator
export function generateCTA(language: 'en' | 'ar'): string {
  if (language === 'ar') {
    return `
🚀 خطوتك التالية:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ ابدأ الآن: استثمر من 1π فقط
2️⃣ توسيع محفظتك: أضف 3-5 عقارات متنوعة
3️⃣ اكسب أرباح شهرية: تلقي العوائد مباشرة على محفظة Pi
4️⃣ اتصل بنا لاستشارة مجانية

📞 اتصل بفريقنا على WhatsApp:
👉 https://wa.me/201010810558

أو أرسل لنا:
📧 globalbusiness435@gmail.com
    `;
  }

  return `
🚀 Your Next Step:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Start Now: Invest from just 1π
2️⃣ Scale Portfolio: Add 3-5 diversified properties
3️⃣ Earn Monthly: Receive rental income directly to Pi wallet
4️⃣ Book Free Consultation with Our Team

📞 Contact us on WhatsApp:
👉 https://wa.me/201010810558

Or reach out:
📧 globalbusiness435@gmail.com
  `;
}

export default aladdinConfig;
