import type { NavLanguage } from './nav-i18n';

type Lang7 = Record<NavLanguage, string>;

export const HOME_CATEGORIES: Record<string, Lang7> = {
  buy: { en: 'Buy', ar: 'شراء', fr: 'Acheter', es: 'Comprar', pt: 'Comprar', ur: 'خریدیں', zh: '购买' },
  rent: { en: 'Rent', ar: 'إيجار', fr: 'Louer', es: 'Alquilar', pt: 'Alugar', ur: 'کرایہ', zh: '租赁' },
  hotel: { en: 'Hotel', ar: 'فندق', fr: 'Hôtel', es: 'Hotel', pt: 'Hotel', ur: 'ہوٹل', zh: '酒店' },
  invest: { en: 'Invest', ar: 'استثمر', fr: 'Investir', es: 'Invertir', pt: 'Investir', ur: 'سرمایہ کاری', zh: '投资' },
  tokenized: { en: 'Tokenized', ar: 'رمزية', fr: 'Tokenisé', es: 'Tokenizado', pt: 'Tokenizado', ur: 'ٹوکنائزڈ', zh: '代币化' },
  abroad: { en: 'Abroad', ar: 'بالخارج', fr: "À l'étranger", es: 'En el extranjero', pt: 'No exterior', ur: 'بیرون ملک', zh: '海外' },
  offplan: { en: 'Off-Plan', ar: 'قيد الإنشاء', fr: 'Sur plan', es: 'Sobre plano', pt: 'Na planta', ur: 'زیر تعمیر', zh: '期房' },
  map: { en: 'Map', ar: 'الخريطة', fr: 'Carte', es: 'Mapa', pt: 'Mapa', ur: 'نقشہ', zh: '地图' },
  partners: { en: 'Partners', ar: 'الشركاء', fr: 'Partenaires', es: 'Socios', pt: 'Parceiros', ur: 'شراکت دار', zh: '合作伙伴' },
  analytics: { en: 'Analytics', ar: 'إحصائيات', fr: 'Analytique', es: 'Analítica', pt: 'Análises', ur: 'تجزیات', zh: '分析' },
  'vr-tour': { en: 'VR Tour', ar: 'جولة واقع معزز', fr: 'Visite VR', es: 'Tour VR', pt: 'Tour VR', ur: 'وی آر ٹور', zh: 'VR体验' },
  'ai-tour': { en: 'AI Tour', ar: 'جولة ذكية', fr: 'Visite IA', es: 'Tour IA', pt: 'Tour IA', ur: 'اے آئی ٹور', zh: 'AI导览' },
  'ai-advisor': { en: 'Aladdin', ar: 'علاء الدين', fr: 'Aladdin', es: 'Aladdin', pt: 'Aladdin', ur: 'علاء الدین', zh: '阿拉丁' },
  contracts: { en: 'Contracts', ar: 'العقود', fr: 'Contrats', es: 'Contratos', pt: 'Contratos', ur: 'معاہدے', zh: '合同' },
  inspections: { en: 'Inspect', ar: 'الفحص', fr: 'Inspecter', es: 'Inspeccionar', pt: 'Inspecionar', ur: 'معائنہ', zh: '查验' },
  're-token': { en: 'Platform Credits', ar: 'رصيد المنصة', fr: 'Crédits Plateforme', es: 'Créditos de Plataforma', pt: 'Créditos da Plataforma', ur: 'پلیٹ فارم کریڈٹس', zh: '平台积分' },
};

export const HOME_FEATURES: Lang7[] = [
  { en: '360° Virtual Tours', ar: 'جولات افتراضية 360 درجة', fr: 'Visites virtuelles à 360°', es: 'Recorridos virtuales de 360°', pt: 'Tours virtuais de 360°', ur: '360° ورچوئل ٹورز', zh: '360°虚拟游览' },
  { en: 'Pi Network Payments', ar: 'دفع عبر شبكة Pi', fr: 'Paiements Pi Network', es: 'Pagos con Pi Network', pt: 'Pagamentos via Pi Network', ur: 'پائی نیٹ ورک ادائیگیاں', zh: 'Pi网络支付' },
  { en: 'Tokenized Real Estate', ar: 'عقارات رمزية', fr: 'Immobilier tokenisé', es: 'Bienes raíces tokenizados', pt: 'Imóveis tokenizados', ur: 'ٹوکنائزڈ ریئل اسٹیٹ', zh: '代币化房地产' },
  { en: 'Global Coverage', ar: 'تغطية عالمية', fr: 'Couverture mondiale', es: 'Cobertura global', pt: 'Cobertura global', ur: 'عالمی کوریج', zh: '全球覆盖' },
  { en: 'AI Advisor — Aladdin', ar: 'مستشار ذكاء اصطناعي — علاء الدين', fr: 'Conseiller IA — Aladdin', es: 'Asesor IA — Aladdin', pt: 'Consultor IA — Aladdin', ur: 'اے آئی ایڈوائزر — علاء الدین', zh: 'AI顾问——阿拉丁' },
  { en: 'Smart Contracts on Stellar', ar: 'عقود ذكية على شبكة Stellar', fr: 'Contrats intelligents sur Stellar', es: 'Contratos inteligentes en Stellar', pt: 'Contratos inteligentes na Stellar', ur: 'اسٹیلر پر اسمارٹ کنٹریکٹس', zh: 'Stellar智能合约' },
  { en: 'Verified On-Chain Transactions', ar: 'معاملات موثّقة على البلوكشين', fr: 'Transactions vérifiées on-chain', es: 'Transacciones verificadas on-chain', pt: 'Transações verificadas on-chain', ur: 'تصدیق شدہ آن چین لین دین', zh: '链上验证交易' },
  { en: 'AI-Guided Property Tours', ar: 'جولات عقارية بالذكاء الاصطناعي', fr: 'Visites guidées par IA', es: 'Recorridos guiados por IA', pt: 'Tours guiados por IA', ur: 'اے آئی گائیڈڈ پراپرٹی ٹورز', zh: 'AI导览房产参观' },
  { en: 'Live Market Analytics', ar: 'تحليلات سوق لحظية', fr: 'Analyses de marché en direct', es: 'Análisis de mercado en vivo', pt: 'Análises de mercado ao vivo', ur: 'لائیو مارکیٹ تجزیات', zh: '实时市场分析' },
  { en: 'Off-Plan & Investment Options', ar: 'خيارات عقارات تحت الإنشاء واستثمار', fr: 'Options sur plan et investissement', es: 'Opciones sobre plano e inversión', pt: 'Opções na planta e investimento', ur: 'زیر تعمیر اور سرمایہ کاری کے اختیارات', zh: '期房与投资选项' },
  { en: 'Multi-language Experience', ar: 'تجربة متعددة اللغات', fr: 'Expérience multilingue', es: 'Experiencia multilingüe', pt: 'Experiência multilíngue', ur: 'کثیر لسانی تجربہ', zh: '多语言体验' },
];

export const HOME_STATS: Record<string, Lang7> = {
  properties: { en: 'Properties', ar: 'العقارات', fr: 'Propriétés', es: 'Propiedades', pt: 'Propriedades', ur: 'جائیدادیں', zh: '房产' },
  countries: { en: 'Countries', ar: 'الدول', fr: 'Pays', es: 'Países', pt: 'Países', ur: 'ممالک', zh: '国家' },
  investors: { en: 'Investors', ar: 'المستثمرون', fr: 'Investisseurs', es: 'Inversores', pt: 'Investidores', ur: 'سرمایہ کار', zh: '投资者' },
  volume: { en: 'Volume', ar: 'الحجم', fr: 'Volume', es: 'Volumen', pt: 'Volume', ur: 'حجم', zh: '交易量' },
};

export const HOME_UI: Record<string, Lang7> = {
  exploreCategories: { en: 'Explore Categories', ar: 'استكشف الفئات', fr: 'Explorer les catégories', es: 'Explorar categorías', pt: 'Explorar categorias', ur: 'زمرہ جات دیکھیں', zh: '探索分类' },
  whyChoose: { en: 'Why Choose RE?', ar: 'لماذا تختار RE؟', fr: 'Pourquoi choisir RE ?', es: '¿Por qué elegir RE?', pt: 'Por que escolher a RE?', ur: 'RE کیوں منتخب کریں؟', zh: '为什么选择RE？' },
  payWithPi: { en: 'Pay with Pi', ar: 'ادفع بـ Pi', fr: 'Payer avec Pi', es: 'Pagar con Pi', pt: 'Pagar com Pi', ur: 'Pi سے ادائیگی کریں', zh: '使用Pi支付' },
  payDesc: { en: 'Experience seamless property transactions powered by Pi Network', ar: 'اختبر معاملات العقارات السلسة المدعومة بشبكة Pi', fr: 'Découvrez des transactions immobilières fluides propulsées par Pi Network', es: 'Vive transacciones inmobiliarias fluidas impulsadas por Pi Network', pt: 'Viva transações imobiliárias fluidas com tecnologia da Pi Network', ur: 'پائی نیٹ ورک کی مدد سے ہموار پراپرٹی لین دین کا تجربہ کریں', zh: '体验由Pi网络支持的无缝房产交易' },
  sampleProperty: { en: 'Sample Luxury Property', ar: 'عقار فاخر للعينة', fr: 'Exemple de propriété de luxe', es: 'Propiedad de lujo de muestra', pt: 'Imóvel de luxo de exemplo', ur: 'نمونہ لگژری پراپرٹی', zh: '示例豪华房产' },
  secureFast: { en: 'Secure • Fast • Decentralized', ar: 'آمن • سريع • لامركزي', fr: 'Sécurisé • Rapide • Décentralisé', es: 'Seguro • Rápido • Descentralizado', pt: 'Seguro • Rápido • Descentralizado', ur: 'محفوظ • تیز • ڈی سینٹرلائزڈ', zh: '安全 • 快速 • 去中心化' },
};

export function tt(dict: Lang7, language: NavLanguage): string {
  return dict[language] || dict.en;
}
