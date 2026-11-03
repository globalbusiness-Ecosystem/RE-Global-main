import type { NavLanguage } from './nav-i18n';

// Texts of the AI price estimate (on every property card) and of the photo analysis card in the advisor, in all 7 languages.
type Row = Record<NavLanguage, string>;

export const ESTIMATE_LABELS = {
  title: { en: 'AI Price Estimate', ar: 'تقدير سعر الذكاء الاصطناعي', fr: 'Estimation de prix par IA', es: 'Estimación de precio por IA', pt: 'Estimativa de preço por IA', ur: 'AI قیمت کا تخمینہ', zh: 'AI 价格估算' },
  fair: { en: 'Fair Market Value', ar: 'القيمة العادلة للسوق', fr: 'Valeur de marché équitable', es: 'Valor justo de mercado', pt: 'Valor justo de mercado', ur: 'مارکیٹ کی منصفانہ قدر', zh: '公允市场价值' },
  listed: { en: 'Listed Price', ar: 'السعر المدرج', fr: 'Prix affiché', es: 'Precio publicado', pt: 'Preço anunciado', ur: 'مندرجہ قیمت', zh: '标价' },
  estimate: { en: 'AI Estimate', ar: 'تقدير الذكاء الاصطناعي', fr: 'Estimation IA', es: 'Estimación IA', pt: 'Estimativa IA', ur: 'AI تخمینہ', zh: 'AI 估值' },
  difference: { en: 'Price Difference', ar: 'فرق السعر', fr: 'Écart de prix', es: 'Diferencia de precio', pt: 'Diferença de preço', ur: 'قیمت کا فرق', zh: '价差' },
  recommendation: { en: 'AI Recommendation', ar: 'توصية الذكاء الاصطناعي', fr: 'Recommandation IA', es: 'Recomendación IA', pt: 'Recomendação IA', ur: 'AI کی سفارش', zh: 'AI 建议' },
  underpriced: { en: 'Property is underpriced - Good buying opportunity!', ar: 'العقار مقيم بأقل من قيمته - فرصة شراء جيدة!', fr: 'Le bien est sous-évalué - bonne opportunité d\'achat !', es: 'La propiedad está subvalorada: ¡buena oportunidad de compra!', pt: 'O imóvel está subvalorizado - boa oportunidade de compra!', ur: 'جائیداد کی قیمت کم رکھی گئی ہے - خریداری کا اچھا موقع!', zh: '房产定价偏低 - 不错的购买机会！' },
  overpriced: { en: 'Property is overpriced - Consider negotiating', ar: 'العقار مقيم بأكثر من قيمته - فكر في التفاوض', fr: 'Le bien est surévalué - envisagez de négocier', es: 'La propiedad está sobrevalorada: considera negociar', pt: 'O imóvel está supervalorizado - considere negociar', ur: 'جائیداد کی قیمت زیادہ ہے - بات چیت پر غور کریں', zh: '房产定价偏高 - 可考虑议价' },
  market: { en: 'Based on market data:', ar: 'بناءً على بيانات السوق:', fr: 'D\'après les données du marché :', es: 'Según datos del mercado:', pt: 'Com base nos dados de mercado:', ur: 'مارکیٹ ڈیٹا کی بنیاد پر:', zh: '基于市场数据：' },
  factors: { en: 'Factors considered:', ar: 'العوامل المأخوذة في الاعتبار:', fr: 'Facteurs pris en compte :', es: 'Factores considerados:', pt: 'Fatores considerados:', ur: 'زیر غور عوامل:', zh: '考虑因素：' },
  location: { en: 'Location premium', ar: 'علاوة الموقع', fr: 'Prime d\'emplacement', es: 'Prima de ubicación', pt: 'Prêmio de localização', ur: 'مقام کا پریمیم', zh: '地段溢价' },
  type: { en: 'Property type', ar: 'نوع العقار', fr: 'Type de bien', es: 'Tipo de propiedad', pt: 'Tipo de imóvel', ur: 'جائیداد کی قسم', zh: '房产类型' },
  trend: { en: 'Market trend', ar: 'اتجاه السوق', fr: 'Tendance du marché', es: 'Tendencia del mercado', pt: 'Tendência do mercado', ur: 'مارکیٹ کا رجحان', zh: '市场趋势' },
  disclaimer: { en: 'Estimates are AI-generated based on historical data. Always consult with professionals before investing.', ar: 'التقديرات يتم إنشاؤها بواسطة الذكاء الاصطناعي بناءً على البيانات التاريخية. استشر المحترفين دائماً قبل الاستثمار.', fr: 'Les estimations sont générées par IA à partir de données historiques. Consultez toujours des professionnels avant d\'investir.', es: 'Las estimaciones las genera la IA a partir de datos históricos. Consulta siempre a profesionales antes de invertir.', pt: 'As estimativas são geradas por IA com base em dados históricos. Consulte sempre profissionais antes de investir.', ur: 'تخمینے تاریخی ڈیٹا کی بنیاد پر AI سے تیار کیے جاتے ہیں۔ سرمایہ کاری سے پہلے ہمیشہ ماہرین سے مشورہ کریں۔', zh: '估值由 AI 根据历史数据生成。投资前请务必咨询专业人士。' },
  property: { en: 'Property', ar: 'العقار', fr: 'Bien', es: 'Propiedad', pt: 'Imóvel', ur: 'جائیداد', zh: '房产' },
  calculating: { en: 'Calculating...', ar: 'جاري الحساب...', fr: 'Calcul en cours...', es: 'Calculando...', pt: 'Calculando...', ur: 'حساب ہو رہا ہے...', zh: '计算中...' },
  refresh: { en: 'Refresh Estimate', ar: 'تحديث التقدير', fr: 'Actualiser l\'estimation', es: 'Actualizar estimación', pt: 'Atualizar estimativa', ur: 'تخمینہ تازہ کریں', zh: '刷新估值' },
  detected: { en: 'Property Detected', ar: 'تم اكتشاف العقار', fr: 'Bien détecté', es: 'Propiedad detectada', pt: 'Imóvel detectado', ur: 'جائیداد کی شناخت ہوئی', zh: '已识别房产' },
  roomType: { en: 'Room Type', ar: 'نوع الغرفة', fr: 'Type de pièce', es: 'Tipo de habitación', pt: 'Tipo de cômodo', ur: 'کمرے کی قسم', zh: '房间类型' },
  condition: { en: 'Condition', ar: 'الحالة', fr: 'État', es: 'Estado', pt: 'Condição', ur: 'حالت', zh: '状况' },
  amenities: { en: 'Amenities Found', ar: 'المرافق المكتشفة', fr: 'Équipements détectés', es: 'Servicios detectados', pt: 'Comodidades encontradas', ur: 'دستیاب سہولیات', zh: '检测到的设施' },
  features: { en: 'Key Features', ar: 'الميزات الرئيسية', fr: 'Caractéristiques clés', es: 'Características clave', pt: 'Principais características', ur: 'اہم خصوصیات', zh: '主要特点' },
  priceUSD: { en: 'Estimated Price (USD)', ar: 'السعر المقدر (دولار)', fr: 'Prix estimé (USD)', es: 'Precio estimado (USD)', pt: 'Preço estimado (USD)', ur: 'تخمینی قیمت (USD)', zh: '估算价格（美元）' },
  pricePI: { en: 'In Pi Network', ar: 'في شبكة Pi', fr: 'En Pi Network', es: 'En Pi Network', pt: 'Em Pi Network', ur: 'Pi Network میں', zh: '以 Pi 计' },
  investmentGrade: { en: 'Investment Grade', ar: 'درجة الاستثمار', fr: 'Note d\'investissement', es: 'Grado de inversión', pt: 'Classificação de investimento', ur: 'سرمایہ کاری کا درجہ', zh: '投资评级' },
  recommendations: { en: 'Smart Recommendations', ar: 'التوصيات الذكية', fr: 'Recommandations intelligentes', es: 'Recomendaciones inteligentes', pt: 'Recomendações inteligentes', ur: 'سمارٹ سفارشات', zh: '智能建议' },
  marketInsight: { en: 'Market Insight', ar: 'ملاحظة السوق', fr: 'Aperçu du marché', es: 'Visión del mercado', pt: 'Visão de mercado', ur: 'مارکیٹ بصیرت', zh: '市场洞察' },
  perSqm: { en: 'per m²', ar: 'لكل م²', fr: 'par m²', es: 'por m²', pt: 'por m²', ur: 'فی مربع میٹر', zh: '每平方米' },
  investNow: { en: 'Invest Now', ar: 'استثمر الآن', fr: 'Investir maintenant', es: 'Invertir ahora', pt: 'Invista agora', ur: 'ابھی سرمایہ کاری کریں', zh: '立即投资' },
  condExcellent: { en: 'Excellent', ar: 'ممتازة', fr: 'Excellent', es: 'Excelente', pt: 'Excelente', ur: 'بہترین', zh: '优秀' },
  condGood: { en: 'Good', ar: 'جيدة', fr: 'Bon', es: 'Bueno', pt: 'Bom', ur: 'اچھی', zh: '良好' },
  condFair: { en: 'Fair', ar: 'متوسطة', fr: 'Moyen', es: 'Aceptable', pt: 'Razoável', ur: 'مناسب', zh: '一般' },
  condRepair: { en: 'Needs Repair', ar: 'تحتاج إصلاح', fr: 'À réparer', es: 'Necesita reparación', pt: 'Precisa de reparo', ur: 'مرمت درکار', zh: '需要维修' },
} satisfies Record<string, Row>;

export type EstimateLabelKey = keyof typeof ESTIMATE_LABELS;

/** All texts in one language, falling back to English. */
export function estimateLabels(language: string): Record<EstimateLabelKey, string> {
  const known = (['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const).find((l) => l === language) ?? 'en';
  const out = {} as Record<EstimateLabelKey, string>;
  for (const key of Object.keys(ESTIMATE_LABELS) as EstimateLabelKey[]) out[key] = (ESTIMATE_LABELS[key] as Row)[known];
  return out;
}

const CONDITION_KEYS: Record<string, EstimateLabelKey> = {
  Excellent: 'condExcellent', Good: 'condGood', Fair: 'condFair', 'Needs Repair': 'condRepair',
};

/** The condition the analysis returned ("Excellent", "Good", "Fair", "Needs Repair") in the user's language. */
export function conditionLabel(condition: string, language: string): string {
  const key = Object.prototype.hasOwnProperty.call(CONDITION_KEYS, condition) ? CONDITION_KEYS[condition] : null;
  return key ? estimateLabels(language)[key] : condition;
}
