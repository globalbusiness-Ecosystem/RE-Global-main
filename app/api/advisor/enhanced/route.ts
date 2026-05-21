import { NextRequest, NextResponse } from 'next/server';
import { enhancedAladdin } from '@/lib/aladdin-enhanced';
import { aladdinKnowledgeBase } from '@/lib/aladdin-knowledge-base';

/**
 * Enhanced Aladdin AI API
 * Comprehensive real estate intelligence and investment guidance
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, market, budget, riskTolerance, timeline, language = 'en' } = body;

    // Market Analysis
    if (action === 'analyze-market') {
      const analysis = await enhancedAladdin.analyzeMarketComprehensively(market, language);
      return NextResponse.json(analysis);
    }

    // Personalized Investment Plan
    if (action === 'personalized-plan') {
      const plan = await enhancedAladdin.generatePersonalizedPlan(
        budget,
        riskTolerance,
        timeline,
        body.preferredMarkets || [],
        language
      );
      return NextResponse.json(plan);
    }

    // Expert Tips
    if (action === 'get-tips') {
      const tips = enhancedAladdin.getTipsForInvestor(body.investorType, language);
      return NextResponse.json({ tips, language });
    }

    // Best Entry Points
    if (action === 'best-entry-points') {
      const entryPoints = await enhancedAladdin.getBestEntryPoints(language);
      return NextResponse.json({ entryPoints, language });
    }

    // Knowledge Base Query
    if (action === 'knowledge-base') {
      const category = body.category;
      let result = null;

      if (category === 'property-types') {
        result = aladdinKnowledgeBase.propertyTypes;
      } else if (category === 'strategies') {
        result = aladdinKnowledgeBase.strategies;
      } else if (category === 'market-intelligence') {
        result = aladdinKnowledgeBase.marketIntelligence;
      }

      return NextResponse.json({ category, data: result, language });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Aladdin Enhanced API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const language = (searchParams.get('language') as 'en' | 'ar') || 'en';

    if (action === 'health') {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        features: {
          comprehensiveAnalysis: true,
          personalizedPlans: true,
          expertTips: true,
          marketForecasting: true,
          portfolioOptimization: true,
          knowledgeBase: true,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Aladdin Enhanced API GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
