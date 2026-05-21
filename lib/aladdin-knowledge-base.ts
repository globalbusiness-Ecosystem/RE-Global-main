import { aladdinConfig } from './aladdin-system-config';

/**
 * Aladdin Comprehensive Knowledge Base
 * Provides extensive real estate investment knowledge and strategies
 */

export interface MarketIntelligence {
  market: string;
  marketPhase: 'growth' | 'mature' | 'decline' | 'recovery';
  futureProjections: {
    year: number;
    projectedGrowth: number;
    confidence: number;
  }[];
  investmentStrategies: string[];
  risks: string[];
  opportunities: string[];
}

export interface InvestmentStrategy {
  name: string;
  description: string;
  minimumBudget: number;
  expectedROI: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  suitable_for: string[];
}

export interface RealEstateKnowledge {
  propertyTypes: Record<string, PropertyTypeInfo>;
  investmentStrategies: InvestmentStrategy[];
  marketConditions: Record<string, MarketIntelligence>;
  tips: TipCategory[];
}

export interface PropertyTypeInfo {
  name: string;
  averageROI: number;
  averageVacancyRate: number;
  maintenanceCosts: number;
  targetInvestors: string[];
  advantages: string[];
  disadvantages: string[];
}

export interface TipCategory {
  category: string;
  tips: string[];
  language: 'en' | 'ar';
}

class AladdinKnowledgeBase {
  /**
   * Property Types Database
   */
  propertyTypes: Record<string, PropertyTypeInfo> = {
    'residential': {
      name: 'Residential Properties',
      averageROI: 0.08,
      averageVacancyRate: 0.05,
      maintenanceCosts: 0.02,
      targetInvestors: ['Beginners', 'Conservative', 'Long-term'],
      advantages: [
        'Stable rental income',
        'Strong global demand',
        'Easy to manage',
        'Good for diversification',
        'Low barrier to entry',
      ],
      disadvantages: [
        'Lower ROI than commercial',
        'Single tenant risk',
        'Tenant management challenges',
        'Maintenance responsibilities',
      ],
    },
    'commercial': {
      name: 'Commercial Properties',
      averageROI: 0.12,
      averageVacancyRate: 0.10,
      maintenanceCosts: 0.035,
      targetInvestors: ['Experienced', 'Aggressive', 'Institutional'],
      advantages: [
        'Higher rental yields',
        'Longer lease terms',
        'Business credit',
        'Triple Net Leases (NNN)',
        'Professional tenants',
      ],
      disadvantages: [
        'Higher capital requirement',
        'Longer vacancy periods',
        'More complex management',
        'Economic sensitivity',
        'Requires expertise',
      ],
    },
    'hotel': {
      name: 'Hotel & Hospitality',
      averageROI: 0.15,
      averageVacancyRate: 0.08,
      maintenanceCosts: 0.05,
      targetInvestors: ['Advanced', 'Aggressive', 'Portfolio builders'],
      advantages: [
        'Highest ROI potential',
        'Daily revenue model',
        'Asset appreciation',
        'Tokenization friendly',
        'Global tourism growth',
      ],
      disadvantages: [
        'High operational costs',
        'Market dependent',
        'Seasonal variations',
        'Significant capital needed',
        'Complex management',
      ],
    },
    'industrial': {
      name: 'Industrial & Warehousing',
      averageROI: 0.10,
      averageVacancyRate: 0.06,
      maintenanceCosts: 0.03,
      targetInvestors: ['Intermediate', 'Institutional'],
      advantages: [
        'Essential commodity',
        'Long lease terms',
        'E-commerce boom',
        'Stable tenants',
        'Capital appreciation',
      ],
      disadvantages: [
        'Lower foot traffic',
        'Specialized market knowledge',
        'Tenant dependent',
        'Limited exit strategies',
      ],
    },
  };

  /**
   * Investment Strategies
   */
  strategies: InvestmentStrategy[] = [
    {
      name: 'Buy & Hold',
      description: 'Purchase and hold property for long-term appreciation and rental income',
      minimumBudget: 50000,
      expectedROI: 0.08,
      timeframe: '10+ years',
      riskLevel: 'low',
      suitable_for: ['Conservative', 'Beginners', 'Passive income seekers'],
    },
    {
      name: 'House Flipping',
      description: 'Purchase undervalued properties, renovate, and sell for profit',
      minimumBudget: 100000,
      expectedROI: 0.25,
      timeframe: '6-12 months',
      riskLevel: 'high',
      suitable_for: ['Experienced', 'Active traders', 'Hands-on investors'],
    },
    {
      name: 'Rental Income',
      description: 'Focus on properties with strong monthly cash flow',
      minimumBudget: 60000,
      expectedROI: 0.10,
      timeframe: '5-15 years',
      riskLevel: 'medium',
      suitable_for: ['Income seekers', 'Retirees', 'Medium-term'],
    },
    {
      name: 'Commercial Syndication',
      description: 'Partner with others to invest in large commercial properties',
      minimumBudget: 25000,
      expectedROI: 0.12,
      timeframe: '7-10 years',
      riskLevel: 'medium',
      suitable_for: ['Institutional', 'Portfolio builders', 'Risk balancers'],
    },
    {
      name: 'Tokenized Real Estate',
      description: 'Fractional ownership through blockchain tokenization',
      minimumBudget: 1,
      expectedROI: 0.095,
      timeframe: '7-10 years',
      riskLevel: 'medium',
      suitable_for: ['All', 'Tech-savvy', 'Global investors'],
    },
    {
      name: 'REIT Investment',
      description: 'Invest in Real Estate Investment Trusts for diversification',
      minimumBudget: 1000,
      expectedROI: 0.09,
      timeframe: '5-20 years',
      riskLevel: 'low',
      suitable_for: ['Passive investors', 'Diversifiers', 'Beginners'],
    },
  ];

  /**
   * Market Intelligence
   */
  marketIntelligence: Record<string, MarketIntelligence> = {
    'dubai': {
      market: 'Dubai',
      marketPhase: 'growth',
      futureProjections: [
        { year: 2025, projectedGrowth: 0.08, confidence: 85 },
        { year: 2026, projectedGrowth: 0.10, confidence: 78 },
        { year: 2027, projectedGrowth: 0.09, confidence: 72 },
      ],
      investmentStrategies: [
        'Golden Visa investments (1M AED)',
        'Commercial hubs near DIFC',
        'Hospitality in Downtown Dubai',
        'Luxury residential in Marina',
      ],
      risks: [
        'Market saturation in some areas',
        'Expat dependency',
        'Oil price volatility',
      ],
      opportunities: [
        'Expo 2025 aftermath investments',
        'Tech hub expansion',
        'Healthcare sector growth',
        'Sustainable developments',
      ],
    },
    'cairo': {
      market: 'Cairo',
      marketPhase: 'recovery',
      futureProjections: [
        { year: 2025, projectedGrowth: 0.12, confidence: 80 },
        { year: 2026, projectedGrowth: 0.14, confidence: 75 },
        { year: 2027, projectedGrowth: 0.11, confidence: 70 },
      ],
      investmentStrategies: [
        'New Administrative Capital projects',
        'Residential in established compounds',
        'Commercial in Maadi & Heliopolis',
        'Student housing near universities',
      ],
      risks: [
        'Political uncertainty',
        'Currency fluctuations',
        'Regulatory changes',
      ],
      opportunities: [
        'New cities development',
        'Population growth',
        'Affordable housing demand',
        'Tech sector expansion',
      ],
    },
    'istanbul': {
      market: 'Istanbul',
      marketPhase: 'growth',
      futureProjections: [
        { year: 2025, projectedGrowth: 0.15, confidence: 82 },
        { year: 2026, projectedGrowth: 0.13, confidence: 76 },
        { year: 2027, projectedGrowth: 0.12, confidence: 71 },
      ],
      investmentStrategies: [
        'Residence Permit properties (250k USD)',
        'Tourist-focused properties',
        'Commercial in Levent & Maslak',
        'New infrastructure corridors',
      ],
      risks: [
        'Currency volatility (TRY)',
        'Political sensitivity',
        'Tourism seasonality',
      ],
      opportunities: [
        'Rapid urbanization',
        'Strategic location',
        'Tourism recovery',
        'Tech hub development',
      ],
    },
  };

  /**
   * Expert Tips by Category
   */
  expertTips: TipCategory[] = [
    {
      category: 'Financing Strategies',
      language: 'en',
      tips: [
        'Leverage: Use 70-80% financing to maximize ROI (20-30% down payment)',
        'Interest Rate Locks: Lock rates early in bull markets',
        'Balloon Payments: Structure deals with lower monthly payments',
        'BRRRR Method: Buy, Renovate, Rent, Refinance, Repeat',
        'Bridge Loans: Use for property flips to avoid gaps',
      ],
    },
    {
      category: 'Market Timing',
      language: 'en',
      tips: [
        'Buy during recessions: Prices drop 20-40%, inventory high',
        'Sell in bull markets: High demand, peak pricing',
        'Monitor interest rates: Lower rates = higher property values',
        'Track economic indicators: GDP, employment, inflation',
        'Study market cycles: Average 7-10 year cycles',
      ],
    },
    {
      category: 'Risk Management',
      language: 'en',
      tips: [
        'Diversify: Don\'t put all capital in one property',
        'Geographic spread: Invest across 3-5 markets',
        'Property mix: Residential + Commercial + Industrial',
        'Insurance: Property, liability, loss of rent coverage',
        'Emergency fund: Keep 6-12 months of operating costs',
      ],
    },
    {
      category: 'Due Diligence',
      language: 'en',
      tips: [
        'Location analysis: Check neighborhood growth trends',
        'Comparable sales: Research 10-20 similar properties',
        'Inspection: Hire professional for structural issues',
        'Title search: Verify ownership and liens',
        'Tax assessment: Understand future tax obligations',
      ],
    },
    {
      category: 'Exit Strategies',
      language: 'en',
      tips: [
        '1031 Exchange: Defer taxes by exchanging for like properties',
        'Refinancing: Pull equity out without selling',
        'Private equity: Sell to investors/funds',
        'IPO potential: Tokenize and offer fractional shares',
        'Development potential: Rezone for higher value use',
      ],
    },
    {
      category: 'استراتيجيات التمويل',
      language: 'ar',
      tips: [
        'الرافعة المالية: استخدم 70-80% تمويل لزيادة العائد',
        'تثبيت أسعار الفائدة: أقفل الأسعار مبكراً',
        'أقساط منخفضة: هيكل الصفقات برسوم شهرية أقل',
        'طريقة البيع والإيجار والتحسين: التطبيق المتكرر',
        'قروض الجسر: استخدم للقلب السريع للعقارات',
      ],
    },
    {
      category: 'توقيت السوق',
      language: 'ar',
      tips: [
        'الشراء في الأزمات: انخفاض 20-40% في الأسعار',
        'البيع في الأسواق الصاعدة: أعلى الأسعار',
        'تتبع أسعار الفائدة: تؤثر على قيم العقارات',
        'مراقبة مؤشرات اقتصادية: GDP والتضخم',
        'دراسة دورات السوق: متوسط 7-10 سنوات',
      ],
    },
  ];

  /**
   * Get personalized strategy based on investor profile
   */
  getStrategyForInvestor(budget: number, riskTolerance: string, timeline: string): InvestmentStrategy[] {
    return this.strategies.filter(strategy => {
      const budgetMatch = strategy.minimumBudget <= budget;
      const riskMatch = strategy.riskLevel === riskTolerance;
      const timeframeMatch = strategy.suitable_for.includes(timeline);
      return budgetMatch && riskMatch && timeframeMatch;
    });
  }

  /**
   * Get market insights
   */
  getMarketInsight(market: string): MarketIntelligence | null {
    return this.marketIntelligence[market.toLowerCase()] || null;
  }

  /**
   * Get tips by category and language
   */
  getTips(category: string, language: 'en' | 'ar'): string[] {
    const tipSet = this.expertTips.find(
      t => t.category.toLowerCase() === category.toLowerCase() && t.language === language
    );
    return tipSet?.tips || [];
  }

  /**
   * Generate comprehensive investment guidance
   */
  generateGuidance(budget: number, riskTolerance: string, timeline: string, language: 'en' | 'ar') {
    const strategies = this.getStrategyForInvestor(budget, riskTolerance, timeline);
    const tips = this.getTips('Risk Management', language);

    return {
      recommendedStrategies: strategies,
      expertTips: tips,
      propertyTypes: this.propertyTypes,
      actionItems: this.generateActionPlan(strategies, language),
    };
  }

  /**
   * Generate action plan
   */
  private generateActionPlan(strategies: InvestmentStrategy[], language: 'en' | 'ar'): string[] {
    if (language === 'ar') {
      return [
        'الخطوة 1: افتح حساب محفظة على منصة RE',
        'الخطوة 2: أكمل عملية التحقق والتحقق من الهوية',
        'الخطوة 3: حول أموالك إلى π (Pi)',
        'الخطوة 4: ادرس قائمة العقارات المتاحة',
        'الخطوة 5: اختر العقار الأول بناءً على الاستراتيجية',
        'الخطوة 6: اتصل بمستشارنا للحصول على استشارة شخصية',
      ];
    }

    return [
      'Step 1: Create a wallet account on RE Platform',
      'Step 2: Complete identity verification process',
      'Step 3: Convert your funds to π (Pi Network)',
      'Step 4: Browse available property listings',
      'Step 5: Select your first property based on strategy',
      'Step 6: Contact our advisor for personalized guidance',
    ];
  }
}

export const aladdinKnowledgeBase = new AladdinKnowledgeBase();
export default AladdinKnowledgeBase;