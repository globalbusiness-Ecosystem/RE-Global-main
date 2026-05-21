import { aladdinConfig } from './aladdin-system-config';

export interface InvestmentProfile {
  budget: number;
  riskTolerance: 'low' | 'medium' | 'high';
  timeline: number;
  preferences: string[];
  currency: 'PI' | 'USD' | 'AED' | 'EGP' | 'TRY';
}

export interface AdvancedRecommendation {
  portfolio: Array<{
    market: string;
    percentage: number;
    properties: number;
    expectedROI: number;
    riskScore: number;
  }>;
  diversificationScore: number;
  analysis: string;
  actions: string[];
}

export class AladdinAdvanced {
  async getPortfolioRecommendation(profile: InvestmentProfile): Promise<AdvancedRecommendation> {
    const allocation = this.calculateAllocation(profile);
    const analysis = this.generateAnalysis(profile, allocation);
    const actions = this.generateActions(profile, allocation);

    return {
      portfolio: allocation,
      diversificationScore: this.calculateDiversification(allocation),
      analysis,
      actions,
    };
  }

  private calculateAllocation(profile: InvestmentProfile) {
    const markets = Object.values(aladdinConfig.markets);
    const allocation = [];

    // Risk-based allocation
    if (profile.riskTolerance === 'low') {
      allocation.push({ market: 'Cairo', percentage: 40, expectedROI: 0.08 });
      allocation.push({ market: 'Dubai', percentage: 30, expectedROI: 0.12 });
      allocation.push({ market: 'Abu Dhabi', percentage: 30, expectedROI: 0.10 });
    } else if (profile.riskTolerance === 'medium') {
      allocation.push({ market: 'Dubai', percentage: 35, expectedROI: 0.12 });
      allocation.push({ market: 'Istanbul', percentage: 25, expectedROI: 0.15 });
      allocation.push({ market: 'Singapore', percentage: 25, expectedROI: 0.14 });
      allocation.push({ market: 'Cairo', percentage: 15, expectedROI: 0.08 });
    } else {
      allocation.push({ market: 'Singapore', percentage: 30, expectedROI: 0.16 });
      allocation.push({ market: 'London', percentage: 25, expectedROI: 0.13 });
      allocation.push({ market: 'Sydney', percentage: 20, expectedROI: 0.15 });
      allocation.push({ market: 'Istanbul', percentage: 15, expectedROI: 0.15 });
      allocation.push({ market: 'Dubai', percentage: 10, expectedROI: 0.12 });
    }

    return allocation.map(item => ({
      ...item,
      properties: Math.floor((profile.budget * item.percentage) / 100),
      riskScore: this.calculateRisk(item.market),
    }));
  }

  private calculateRisk(market: string): number {
    const riskMap: { [key: string]: number } = {
      'Singapore': 15,
      'Sydney': 18,
      'London': 20,
      'Dubai': 35,
      'Abu Dhabi': 32,
      'Istanbul': 45,
      'Cairo': 55,
      'Alexandria': 58,
    };
    return riskMap[market] || 50;
  }

  private calculateDiversification(allocation: any[]): number {
    const herfindahlIndex = allocation.reduce((sum, item) => {
      return sum + Math.pow(item.percentage / 100, 2);
    }, 0);
    return Math.round((1 - herfindahlIndex) * 100);
  }

  private generateAnalysis(profile: InvestmentProfile, allocation: any[]): string {
    let analysis = `Based on your profile with π${profile.budget} budget and ${profile.riskTolerance} risk tolerance:\n\n`;
    analysis += `- Recommended diversification: ${allocation.length} markets\n`;
    analysis += `- Average expected ROI: ${(allocation.reduce((sum, a) => sum + a.expectedROI, 0) / allocation.length * 100).toFixed(1)}%\n`;
    analysis += `- Portfolio rebalancing required: ${this.needsRebalancing(allocation) ? 'Yes' : 'No'}\n`;
    return analysis;
  }

  private generateActions(profile: InvestmentProfile, allocation: any[]): string[] {
    const actions = [];
    
    if (profile.budget < 50) {
      actions.push('Start with single-market investment (Cairo or Alexandria)');
      actions.push('Build to multi-market portfolio over 12 months');
    }
    
    allocation.forEach(item => {
      if (item.properties > 0) {
        actions.push(`Allocate π${(profile.budget * item.percentage / 100).toFixed(2)} to ${item.market}`);
      }
    });

    if (profile.timeline < 12) {
      actions.push('Prioritize high-liquidity properties for quick exit');
    }

    return actions;
  }

  private needsRebalancing(allocation: any[]): boolean {
    const avgPercentage = 100 / allocation.length;
    return allocation.some(item => Math.abs(item.percentage - avgPercentage) > 10);
  }
}

export const aladdinAdvanced = new AladdinAdvanced();
