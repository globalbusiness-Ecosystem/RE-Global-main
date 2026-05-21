export interface MarketForecast {
  market: string;
  currentPrice: number;
  forecastedPrice6M: number;
  forecastedPrice12M: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  alerts: string[];
}

export class PredictiveAnalytics {
  private historicalData = {
    'Dubai': { trend: 0.08, volatility: 0.12 },
    'Cairo': { trend: 0.12, volatility: 0.20 },
    'Abu Dhabi': { trend: 0.06, volatility: 0.10 },
    'Istanbul': { trend: 0.15, volatility: 0.25 },
    'Singapore': { trend: 0.04, volatility: 0.08 },
    'Sydney': { trend: 0.05, volatility: 0.09 },
    'London': { trend: 0.03, volatility: 0.07 },
    'Alexandria': { trend: 0.10, volatility: 0.22 },
  };

  async forecast(market: string, currentPrice: number = 1): Promise<MarketForecast> {
    const data = this.historicalData[market as keyof typeof this.historicalData] || { trend: 0.06, volatility: 0.12 };
    
    const forecast6M = currentPrice * (1 + (data.trend / 2) + (Math.random() - 0.5) * data.volatility);
    const forecast12M = currentPrice * (1 + data.trend + (Math.random() - 0.5) * data.volatility * 1.5);
    
    const trend = this.determineTrend(data.trend);
    const confidence = this.calculateConfidence(data.volatility);
    const alerts = this.generateAlerts(market, data, trend);

    return {
      market,
      currentPrice,
      forecastedPrice6M: Math.round(forecast6M * 100) / 100,
      forecastedPrice12M: Math.round(forecast12M * 100) / 100,
      trend,
      confidence,
      alerts,
    };
  }

  private determineTrend(trendValue: number): 'bullish' | 'bearish' | 'neutral' {
    if (trendValue > 0.08) return 'bullish';
    if (trendValue < 0.02) return 'bearish';
    return 'neutral';
  }

  private calculateConfidence(volatility: number): number {
    return Math.max(50, Math.min(95, 100 - volatility * 200));
  }

  private generateAlerts(market: string, data: any, trend: string): string[] {
    const alerts = [];

    if (trend === 'bullish' && data.trend > 0.10) {
      alerts.push(`Strong upward trend in ${market}. Good entry point.`);
    }

    if (data.volatility > 0.20) {
      alerts.push(`High volatility detected. Consider diversification.`);
    }

    if (market === 'Cairo' || market === 'Alexandria') {
      alerts.push(`Monitor political/economic news for ${market} market.`);
    }

    if (market === 'Istanbul') {
      alerts.push(`Track currency movements - impacts π conversion rates.`);
    }

    return alerts;
  }

  async getBestEntryPoints(budget: number): Promise<Array<{ market: string; price: number; opportunity: string }>> {
    const entries = [];
    
    for (const market of Object.keys(this.historicalData)) {
      const forecast = await this.forecast(market, 1);
      
      if (forecast.trend === 'bullish' && forecast.confidence > 70) {
        entries.push({
          market,
          price: forecast.currentPrice,
          opportunity: `${forecast.confidence}% confidence - Expected ${((forecast.forecastedPrice12M / forecast.currentPrice - 1) * 100).toFixed(1)}% growth`,
        });
      }
    }

    return entries.sort((a, b) => b.opportunity.localeCompare(a.opportunity)).slice(0, 5);
  }
}

export const predictiveAnalytics = new PredictiveAnalytics();
