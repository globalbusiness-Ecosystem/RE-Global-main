export interface Portfolio {
  properties: Array<{
    id: string;
    market: string;
    purchasePrice: number;
    currentValue: number;
    roi: number;
    currency: string;
  }>;
}

export interface PortfolioAnalysis {
  totalValue: number;
  totalROI: number;
  avgROI: number;
  riskScore: number;
  recommendation: string;
  rebalancingSuggestions: string[];
  diversificationMetrics: {
    geographic: number;
    propertyType: number;
    currencyExposure: number;
  };
}

export class PortfolioAnalyzer {
  async analyze(portfolio: Portfolio): Promise<PortfolioAnalysis> {
    const totalValue = this.calculateTotalValue(portfolio);
    const totalROI = this.calculateTotalROI(portfolio);
    const avgROI = this.calculateAverageROI(portfolio);
    const riskScore = this.calculateRiskScore(portfolio);
    const recommendation = this.generateRecommendation(portfolio, riskScore);
    const rebalancingSuggestions = this.generateRebalancingSuggestions(portfolio);
    const diversificationMetrics = this.calculateDiversification(portfolio);

    return {
      totalValue,
      totalROI,
      avgROI,
      riskScore,
      recommendation,
      rebalancingSuggestions,
      diversificationMetrics,
    };
  }

  private calculateTotalValue(portfolio: Portfolio): number {
    return portfolio.properties.reduce((sum, p) => sum + p.currentValue, 0);
  }

  private calculateTotalROI(portfolio: Portfolio): number {
    const totalPurchase = portfolio.properties.reduce((sum, p) => sum + p.purchasePrice, 0);
    const totalCurrent = this.calculateTotalValue(portfolio);
    return totalCurrent - totalPurchase;
  }

  private calculateAverageROI(portfolio: Portfolio): number {
    if (portfolio.properties.length === 0) return 0;
    const avgRoi = portfolio.properties.reduce((sum, p) => sum + p.roi, 0) / portfolio.properties.length;
    return Math.round(avgRoi * 100) / 100;
  }

  private calculateRiskScore(portfolio: Portfolio): number {
    const marketRisks: { [key: string]: number } = {
      'Cairo': 55, 'Alexandria': 58, 'Istanbul': 45, 'Dubai': 35,
      'Abu Dhabi': 32, 'Singapore': 15, 'Sydney': 18, 'London': 20,
    };

    let totalRisk = 0;
    portfolio.properties.forEach(p => {
      const marketRisk = marketRisks[p.market] || 40;
      totalRisk += marketRisk;
    });

    return Math.round(totalRisk / portfolio.properties.length);
  }

  private generateRecommendation(portfolio: Portfolio, riskScore: number): string {
    const avgROI = this.calculateAverageROI(portfolio);
    
    if (riskScore > 50 && avgROI < 0.08) {
      return 'High risk, low returns. Consider rebalancing to stable markets.';
    } else if (riskScore < 25 && avgROI < 0.10) {
      return 'Conservative portfolio. Consider adding emerging markets for growth.';
    } else if (avgROI > 0.15) {
      return 'Excellent performance. Maintain current strategy with occasional rebalancing.';
    }
    
    return 'Balanced portfolio performing well. Monitor market trends.';
  }

  private generateRebalancingSuggestions(portfolio: Portfolio): string[] {
    const suggestions = [];
    const markets = new Map<string, number>();
    
    portfolio.properties.forEach(p => {
      markets.set(p.market, (markets.get(p.market) || 0) + 1);
    });

    markets.forEach((count, market) => {
      const percentage = (count / portfolio.properties.length) * 100;
      if (percentage > 40) {
        suggestions.push(`Reduce concentration in ${market} (currently ${percentage.toFixed(0)}%)`);
      }
    });

    return suggestions;
  }

  private calculateDiversification(portfolio: Portfolio): {
    geographic: number;
    propertyType: number;
    currencyExposure: number;
  } {
    const markets = new Set(portfolio.properties.map(p => p.market));
    const currencies = new Set(portfolio.properties.map(p => p.currency));
    
    const geographic = Math.min(markets.size * 20, 100);
    const propertyType = Math.min(portfolio.properties.length * 10, 100);
    const currencyExposure = Math.min(currencies.size * 25, 100);

    return { geographic, propertyType, currencyExposure };
  }
}

export const portfolioAnalyzer = new PortfolioAnalyzer();
