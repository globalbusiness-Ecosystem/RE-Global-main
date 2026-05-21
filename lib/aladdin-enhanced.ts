import { aladdinConfig } from './aladdin-system-config';
import { aladdinKnowledgeBase } from './aladdin-knowledge-base';
import { predictiveAnalytics } from './aladdin-predictive';
import { portfolioAnalyzer } from './aladdin-portfolio-analysis';
import { aladdinAdvanced } from './aladdin-advanced';

/**
 * Enhanced Aladdin AI System
 * Integrated with comprehensive knowledge, predictive analytics, and portfolio management
 */

export interface EnhancedAladdinResponse {
  message: string;
  language: 'en' | 'ar';
  analysis: AnalysisData;
  recommendations: string[];
  opportunities: string[];
  risks: string[];
  actionItems: string[];
  cta: string;
}

export interface AnalysisData {
  marketInsights: string;
  financialMetrics: Record<string, any>;
  strategicAdvice: string;
  performanceProjection: string;
}

class EnhancedAladdin {
  /**
   * Comprehensive market analysis with all available intelligence
   */
  async analyzeMarketComprehensively(market: string, language: 'en' | 'ar' = 'en'): Promise<EnhancedAladdinResponse> {
    const marketConfig = aladdinConfig.markets[market.toLowerCase()];
    if (!marketConfig) {
      return this.getErrorResponse(language);
    }

    // Get knowledge base insights
    const marketIntelligence = aladdinKnowledgeBase.getMarketInsight(market);
    
    // Get market forecast
    const forecast = await predictiveAnalytics.forecast(market, marketConfig.avgPrice);

    // Generate comprehensive analysis
    const analysis = this.generateAnalysis(marketConfig, marketIntelligence, forecast, language);
    const recommendations = this.generateRecommendations(marketConfig, marketIntelligence, language);
    const opportunities = this.extractOpportunities(marketIntelligence, language);
    const risks = this.extractRisks(marketIntelligence, language);
    const actionItems = this.generateActionItems(marketConfig, language);

    return {
      message: language === 'ar' 
        ? `تحليل شامل لسوق ${marketConfig.city}`
        : `Comprehensive Analysis of ${marketConfig.city}`,
      language,
      analysis,
      recommendations,
      opportunities,
      risks,
      actionItems,
      cta: this.generateCTA(language),
    };
  }

  /**
   * Personalized investment plan based on investor profile
   */
  async generatePersonalizedPlan(
    budget: number,
    riskTolerance: 'low' | 'medium' | 'high',
    timeline: number,
    preferredMarkets: string[],
    language: 'en' | 'ar' = 'en'
  ): Promise<EnhancedAladdinResponse> {
    // Get suitable strategies
    const timelineLabel = timeline < 3 ? 'Short-term' : timeline < 7 ? 'Medium-term' : 'Long-term';
    const strategies = aladdinKnowledgeBase.getStrategyForInvestor(budget, riskTolerance, timelineLabel);

    // Get portfolio recommendation
    const portfolio = await aladdinAdvanced.getPortfolioRecommendation({
      budget,
      riskTolerance,
      timeline,
      preferences: preferredMarkets,
      currency: 'PI',
    });

    // Generate personalized message
    const message = language === 'ar'
      ? `خطة استثمار شخصية لميزانية π${budget.toLocaleString('ar-EG')}`
      : `Personalized Investment Plan for π${budget.toLocaleString('en-US')}`;

    return {
      message,
      language,
      analysis: this.generatePersonalizedAnalysis(portfolio, strategies, language),
      recommendations: this.generatePortfolioRecommendations(portfolio, language),
      opportunities: this.generateOpportunitiesList(portfolio, preferredMarkets, language),
      risks: this.generateRiskAssessment(portfolio, riskTolerance, language),
      actionItems: this.generateImplementationPlan(portfolio, language),
      cta: this.generateInvestmentCTA(budget, language),
    };
  }

  /**
   * Get expert tips based on investor stage
   */
  getTipsForInvestor(
    investorType: 'beginner' | 'intermediate' | 'advanced',
    language: 'en' | 'ar' = 'en'
  ): string[] {
    const categoryMap = {
      beginner: 'Due Diligence',
      intermediate: 'Risk Management',
      advanced: 'Exit Strategies',
    };

    const tips = aladdinKnowledgeBase.getTips(categoryMap[investorType], language);
    return tips.length > 0 ? tips : aladdinKnowledgeBase.getTips('Financing Strategies', language);
  }

  /**
   * Get best entry points across all markets
   */
  async getBestEntryPoints(language: 'en' | 'ar' = 'en'): Promise<string[]> {
    const entryPoints = await predictiveAnalytics.getBestEntryPoints(1);
    
    if (language === 'ar') {
      return entryPoints.map(point => 
        `السوق: ${point.market} - ${point.opportunity}`
      );
    }
    
    return entryPoints.map(point => 
      `Market: ${point.market} - ${point.opportunity}`
    );
  }

  /**
   * Generate comprehensive analysis
   */
  private generateAnalysis(
    marketConfig: any,
    intelligence: any,
    forecast: any,
    language: 'en' | 'ar'
  ): AnalysisData {
    const en = {
      marketInsights: `${marketConfig.city} is in a ${intelligence?.marketPhase || 'stable'} phase with ${(marketConfig.rentalYield * 100).toFixed(1)}% average rental yield. Authority: ${marketConfig.authority}`,
      financialMetrics: {
        averagePrice: marketConfig.avgPrice,
        pricePerSqft: marketConfig.pricePerSqft,
        rentalYield: (marketConfig.rentalYield * 100).toFixed(1) + '%',
        piEquivalent: (marketConfig.avgPrice * 0.13).toFixed(2) + ' π',
      },
      strategicAdvice: `With ${(forecast?.confidence || 75)}% confidence, ${marketConfig.city} is expected to grow at ${((forecast?.trend === 'bullish' ? 0.10 : forecast?.trend === 'bearish' ? 0.02 : 0.06) * 100).toFixed(1)}% annually.`,
      performanceProjection: `12-month forecast: $${forecast?.forecastedPrice12M?.toFixed(0) || 'N/A'}`,
    };

    const ar = {
      marketInsights: `${marketConfig.city} في مرحلة ${intelligence?.marketPhase === 'growth' ? 'نمو' : 'مستقرة'} مع عائد إيجار متوسط ${(marketConfig.rentalYield * 100).toFixed(1)}%. الهيئة: ${marketConfig.authority}`,
      financialMetrics: {
        averagePrice: marketConfig.avgPrice,
        pricePerSqft: marketConfig.pricePerSqft,
        rentalYield: (marketConfig.rentalYield * 100).toFixed(1) + '%',
        piEquivalent: (marketConfig.avgPrice * 0.13).toFixed(2) + ' π',
      },
      strategicAdvice: `بثقة ${(forecast?.confidence || 75)}%، يتوقع نمو ${marketConfig.city} بمعدل ${((forecast?.trend === 'bullish' ? 0.10 : 0.06) * 100).toFixed(1)}% سنوياً.`,
      performanceProjection: `توقعات 12 شهر: $${forecast?.forecastedPrice12M?.toFixed(0) || 'بيانات'}`,
    };

    return language === 'ar' ? ar : en;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(marketConfig: any, intelligence: any, language: 'en' | 'ar'): string[] {
    if (language === 'ar') {
      return [
        `استثمر في ${marketConfig.city} للحصول على عائد ${(marketConfig.rentalYield * 100).toFixed(1)}%`,
        `الحد الأدنى: π${(marketConfig.avgPrice * 0.13).toFixed(0)} للملكية الكاملة`,
        `أو ابدأ من π1 فقط مع الملكية الكسرية`,
        `${marketConfig.visaProgram ? `برنامج الإقامة: ${marketConfig.visaProgram}` : ''}`,
        `تمويل جزئي متاح - استثمر ما تريده`,
      ];
    }

    return [
      `Invest in ${marketConfig.city} for ${(marketConfig.rentalYield * 100).toFixed(1)}% annual yield`,
      `Minimum: π${(marketConfig.avgPrice * 0.13).toFixed(0)} for full ownership`,
      `Or start from just 1π with fractional ownership`,
      `${marketConfig.visaProgram ? `Visa Program: ${marketConfig.visaProgram}` : ''}`,
      `Partial financing available - invest what you can`,
    ];
  }

  /**
   * Extract opportunities
   */
  private extractOpportunities(intelligence: any, language: 'en' | 'ar'): string[] {
    if (!intelligence?.opportunities) return [];
    
    if (language === 'ar') {
      return intelligence.opportunities.map((opp: string) => `✓ ${opp}`);
    }
    
    return intelligence.opportunities.map((opp: string) => `✓ ${opp}`);
  }

  /**
   * Extract risks
   */
  private extractRisks(intelligence: any, language: 'en' | 'ar'): string[] {
    if (!intelligence?.risks) return [];
    
    if (language === 'ar') {
      return intelligence.risks.map((risk: string) => `⚠ ${risk}`);
    }
    
    return intelligence.risks.map((risk: string) => `⚠ ${risk}`);
  }

  /**
   * Generate action items
   */
  private generateActionItems(marketConfig: any, language: 'en' | 'ar'): string[] {
    if (language === 'ar') {
      return [
        '1. أكمل التحقق من الهوية على المنصة',
        '2. حول أموالك إلى عملة Pi',
        '3. ادرس قائمة العقارات في ' + marketConfig.city,
        '4. اختر العقار المناسب لميزانيتك',
        '5. استشر مستشارنا المجاني',
      ];
    }

    return [
      '1. Complete identity verification on platform',
      '2. Convert your funds to Pi currency',
      '3. Study available properties in ' + marketConfig.city,
      '4. Select property matching your budget',
      '5. Book free consultation with advisor',
    ];
  }

  /**
   * Generate personalized analysis
   */
  private generatePersonalizedAnalysis(portfolio: any, strategies: any[], language: 'en' | 'ar'): AnalysisData {
    const en = {
      marketInsights: `Your personalized portfolio diversifies across ${portfolio.portfolio.length} markets with ${(portfolio.diversificationScore).toFixed(0)}% diversification score`,
      financialMetrics: {
        portfolioAllocation: portfolio.portfolio,
        averageROI: portfolio.analysis,
        diversificationScore: portfolio.diversificationScore,
      },
      strategicAdvice: portfolio.analysis,
      performanceProjection: `Expected ROI based on market data: 8-15% annually`,
    };

    const ar = {
      marketInsights: `محفظتك الشخصية متنوعة عبر ${portfolio.portfolio.length} أسواق مع درجة تنويع ${(portfolio.diversificationScore).toFixed(0)}%`,
      financialMetrics: {
        portfolioAllocation: portfolio.portfolio,
        averageROI: portfolio.analysis,
        diversificationScore: portfolio.diversificationScore,
      },
      strategicAdvice: portfolio.analysis,
      performanceProjection: `العائد المتوقع بناءً على بيانات السوق: 8-15% سنوياً`,
    };

    return language === 'ar' ? ar : en;
  }

  /**
   * Generate portfolio recommendations
   */
  private generatePortfolioRecommendations(portfolio: any, language: 'en' | 'ar'): string[] {
    return portfolio.actions;
  }

  /**
   * Generate opportunities list
   */
  private generateOpportunitiesList(portfolio: any, preferredMarkets: string[], language: 'en' | 'ar'): string[] {
    if (language === 'ar') {
      return [
        'استثمر في الأسواق الناشئة للحصول على عوائد أعلى',
        'استخدم استراتيجية إعادة التمويل لتحرير رأس المال',
        'عرّض للعوائد الشهرية المباشرة على محفظة Pi',
        'وسّع محفظتك مع نمو رأس مالك',
      ];
    }

    return [
      'Invest in emerging markets for higher returns',
      'Use refinancing strategy to unlock capital',
      'Receive monthly rental income directly to Pi wallet',
      'Scale portfolio as your capital grows',
    ];
  }

  /**
   * Generate risk assessment
   */
  private generateRiskAssessment(portfolio: any, riskTolerance: string, language: 'en' | 'ar'): string[] {
    if (language === 'ar') {
      return [
        `ملف المخاطر: ${riskTolerance === 'low' ? 'محافظ' : riskTolerance === 'medium' ? 'متوازن' : 'عدواني'}`,
        `متوسط درجة المخاطر: ${portfolio.portfolio.reduce((sum: number, p: any) => sum + p.riskScore, 0) / portfolio.portfolio.length}`,
        'استراتيجية التنويع: تقلل المخاطر بمعدل 60-75%',
        'تجنب التركيز الزائد في سوق واحد',
      ];
    }

    return [
      `Risk Profile: ${riskTolerance === 'low' ? 'Conservative' : riskTolerance === 'medium' ? 'Balanced' : 'Aggressive'}`,
      `Average Risk Score: ${(portfolio.portfolio.reduce((sum: number, p: any) => sum + p.riskScore, 0) / portfolio.portfolio.length).toFixed(0)}`,
      'Diversification Strategy: Reduces risk by 60-75%',
      'Avoid over-concentration in single market',
    ];
  }

  /**
   * Generate implementation plan
   */
  private generateImplementationPlan(portfolio: any, language: 'en' | 'ar'): string[] {
    if (language === 'ar') {
      return [
        'المرحلة 1 (الشهر 1): استثمر 30% من الميزانية في أول سوق',
        'المرحلة 2 (الشهور 2-3): أضف 40% في الأسواق الثانوية',
        'المرحلة 3 (الأشهر 4-6): أكمل 30% المتبقية',
        'المرحلة 4 (مستمر): أعد التوازن كل 6 أشهر',
      ];
    }

    return [
      'Phase 1 (Month 1): Invest 30% of budget in primary market',
      'Phase 2 (Months 2-3): Add 40% in secondary markets',
      'Phase 3 (Months 4-6): Complete remaining 30%',
      'Phase 4 (Ongoing): Rebalance every 6 months',
    ];
  }

  /**
   * Generate CTA
   */
  private generateCTA(language: 'en' | 'ar'): string {
    if (language === 'ar') {
      return '📞 اتصل بنا الآن على WhatsApp: +201010810558 أو 📧 globalbusiness435@gmail.com';
    }
    return '📞 Contact us now on WhatsApp: +201010810558 or 📧 globalbusiness435@gmail.com';
  }

  /**
   * Generate investment CTA
   */
  private generateInvestmentCTA(budget: number, language: 'en' | 'ar'): string {
    if (language === 'ar') {
      return `جاهز للاستثمار π${budget.toLocaleString('ar-EG')}؟ اضغط على 'استثمر الآن' أو اتصل بنا على +201010810558`;
    }
    return `Ready to invest π${budget.toLocaleString('en-US')}? Click 'Invest Now' or call us +201010810558`;
  }

  /**
   * Error response
   */
  private getErrorResponse(language: 'en' | 'ar'): EnhancedAladdinResponse {
    return {
      message: language === 'ar' ? 'عذراً، لم أتمكن من العثور على البيانات' : 'Sorry, I couldn\'t find the requested data',
      language,
      analysis: {
        marketInsights: '',
        financialMetrics: {},
        strategicAdvice: '',
        performanceProjection: '',
      },
      recommendations: [],
      opportunities: [],
      risks: [],
      actionItems: [],
      cta: this.generateCTA(language),
    };
  }
}

export const enhancedAladdin = new EnhancedAladdin();
export default EnhancedAladdin;
