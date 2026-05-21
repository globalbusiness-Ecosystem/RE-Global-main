import { NextRequest, NextResponse } from 'next/server';
import { aladdinAdvanced, InvestmentProfile } from '@/lib/aladdin-advanced';
import { portfolioAnalyzer, Portfolio } from '@/lib/aladdin-portfolio-analysis';
import { predictiveAnalytics } from '@/lib/aladdin-predictive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'portfolio-recommendation': {
        const profile: InvestmentProfile = data;
        const recommendation = await aladdinAdvanced.getPortfolioRecommendation(profile);
        return NextResponse.json({ success: true, data: recommendation });
      }

      case 'analyze-portfolio': {
        const portfolio: Portfolio = data;
        const analysis = await portfolioAnalyzer.analyze(portfolio);
        return NextResponse.json({ success: true, data: analysis });
      }

      case 'forecast-market': {
        const { market, price } = data;
        const forecast = await predictiveAnalytics.forecast(market, price);
        return NextResponse.json({ success: true, data: forecast });
      }

      case 'best-entry-points': {
        const { budget } = data;
        const entries = await predictiveAnalytics.getBestEntryPoints(budget);
        return NextResponse.json({ success: true, data: entries });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Aladdin Advanced] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
