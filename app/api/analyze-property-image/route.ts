import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analyze-property-image
 * Uses Claude AI to analyze property images
 * Extracts: location, property type, condition, estimated value, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Call Anthropic Claude API for vision analysis
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl,
                },
              },
              {
                type: 'text',
                text: `You are Aladdin AI, a world-class real estate advisor. Analyze this property image and provide:

1. Property Type (apartment, villa, office, commercial, etc.)
2. Estimated Condition (new, renovated, needs-work)
3. Key Features visible (balcony, garden, parking, pool, etc.)
4. Location Indicators (urban, suburban, beachfront, mountain, etc.)
5. Investment Potential (high, medium, low) with brief reason
6. Estimated Price Range in USD based on visible features
7. Best Market Fit (Dubai, Cairo, Istanbul, NYC, London, etc.)
8. Pi Network Investment Option (starting price in π at current rates)
9. Immediate Recommendations for the investor

Format as JSON with keys: propertyType, condition, features, location, investmentPotential, priceRange, marketFit, piInvestment, recommendations`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[v0] Claude API error:', error);
      return NextResponse.json(
        { error: 'Analysis failed' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const textContent = result.content[0]?.text;

    if (!textContent) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let analysis = {};
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { rawAnalysis: textContent };
      }
    } catch {
      analysis = { rawAnalysis: textContent };
    }

    return NextResponse.json({
      success: true,
      analysis,
      imageUrl,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[v0] Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
