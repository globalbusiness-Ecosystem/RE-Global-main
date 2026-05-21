import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalysisResponse {
  success: boolean;
  analysis?: {
    roomType: string;
    condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
    amenities: string[];
    features: string[];
    priceRange: {
      min: number;
      max: number;
      currency: string;
    };
    piEstimate: {
      min: number;
      max: number;
    };
    investmentGrade: string;
    recommendations: string[];
    marketInsight: string;
  };
  error?: string;
}

export async function POST(req: Request) {
  try {
    const { imageData, city, country, language = 'en' } = await req.json();

    if (!imageData) {
      return Response.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('[v0] Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return Response.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Extract base64 from data URL if needed
    let base64Image = imageData;
    if (imageData.includes(',')) {
      base64Image = imageData.split(',')[1];
    }

    // Create analysis prompt
    const isArabic = language === 'ar';
    const analysisPrompt = isArabic
      ? `أنت خبير عقاري متخصص. حلل هذه الصورة للعقار وقدم التقييم التالي:

1. نوع الغرفة/المساحة (غرفة نوم، غرفة معيشة، مطبخ، حمام، صالة، غرفة جلوس، إلخ)
2. حالة العقار (ممتاز/جيد جداً/جيد/يحتاج إصلاح)
3. المرافق المرئية (مثل: تكييف، سخان ماء، جزء من مطبخ، إلخ)
4. الميزات الإيجابية (الإضاءة، المساحة، التصميم، إلخ)
5. نطاق السعر المقترح بالدولار الأمريكي للمتر المربع
6. تقييم الاستثمار (ممتاز/جيد/مقبول)
7. التوصيات الرئيسية

أرجع الرد بصيغة JSON فقط:
{
  "roomType": "نوع الغرفة",
  "condition": "Excellent/Good/Fair/Needs Repair",
  "amenities": ["مرفق1", "مرفق2"],
  "features": ["ميزة1", "ميزة2"],
  "pricePerSqm": { "min": 800, "max": 1200 },
  "investmentGrade": "A+/A/B/C",
  "recommendations": ["توصية1", "توصية2"],
  "marketInsight": "ملاحظة السوق"
}`
      : `You are a real estate expert. Analyze this property photo and provide:

1. Room Type/Space (bedroom, living room, kitchen, bathroom, hall, office, etc.)
2. Property Condition (Excellent/Good/Fair/Needs Repair)
3. Visible Amenities (AC, water heater, kitchen appliance, etc.)
4. Key Features (lighting, space, design, finishes, etc.)
5. Estimated Price Range in USD per square meter
6. Investment Grade (A+/A/B/C)
7. Key Recommendations

Return ONLY valid JSON:
{
  "roomType": "Room type",
  "condition": "Excellent/Good/Fair/Needs Repair",
  "amenities": ["amenity1", "amenity2"],
  "features": ["feature1", "feature2"],
  "pricePerSqm": { "min": 800, "max": 1200 },
  "investmentGrade": "A+/A/B/C",
  "recommendations": ["recommendation1", "recommendation2"],
  "marketInsight": "Market observation"
}`;

    // Call Gemini Vision API
    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
      analysisPrompt,
    ]);

    const responseText = response.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const aiAnalysis = JSON.parse(jsonMatch[0]);

    // Convert to market prices based on city
    const cityMultipliers: Record<string, number> = {
      'Dubai': 1.5,
      'Abu Dhabi': 1.4,
      'Cairo': 0.6,
      'New York': 1.8,
      'London': 1.7,
      'Singapore': 1.6,
      'Default': 1.0,
    };

    const multiplier = cityMultipliers[city] || cityMultipliers['Default'];
    const basePrice = (aiAnalysis.pricePerSqm.min + aiAnalysis.pricePerSqm.max) / 2;
    const adjustedMin = Math.round(basePrice * multiplier * 0.9);
    const adjustedMax = Math.round(basePrice * multiplier * 1.1);

    // Convert USD to Pi (assuming 1π ≈ $0.13)
    const piRate = 0.13;
    const piMin = Math.round(adjustedMin / piRate);
    const piMax = Math.round(adjustedMax / piRate);

    const result: AnalysisResponse = {
      success: true,
      analysis: {
        roomType: aiAnalysis.roomType,
        condition: aiAnalysis.condition,
        amenities: aiAnalysis.amenities,
        features: aiAnalysis.features,
        priceRange: {
          min: adjustedMin,
          max: adjustedMax,
          currency: 'USD',
        },
        piEstimate: {
          min: piMin,
          max: piMax,
        },
        investmentGrade: aiAnalysis.investmentGrade,
        recommendations: aiAnalysis.recommendations,
        marketInsight: aiAnalysis.marketInsight,
      },
    };

    return Response.json(result);
  } catch (error) {
    console.error('[v0] Photo analysis error:', error);
    return Response.json(
      { success: false, error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}
