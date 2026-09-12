import type { NavLanguage } from './nav-i18n';

export interface RETokenStrings {
  couldNotFetchPrice: string;
  platformCredits: string;
  balanceForServices: string;
  yourBalance: string;
  credits: string;
  topUpYourCredits: string;
  useCreditsFor: string;
  orEnterAmount: (min: number) => string;
  minimumTopUp: (min: number) => string;
  priceBreakdown: string;
  calculatingPrice: string;
  creditValue: string;
  currentRate: string;
  networkFee: string;
  total: string;
}

export const RE_TOKEN_I18N: Record<NavLanguage, RETokenStrings> = {
  en: {
    couldNotFetchPrice: 'Could not fetch current price',
    platformCredits: 'Platform Credits',
    balanceForServices: 'Balance for using platform services',
    yourBalance: 'Your Balance',
    credits: 'Credits',
    topUpYourCredits: 'Top Up Your Credits',
    useCreditsFor: 'Use your credits for: VR/AI Tours, Inspect, Aladdin, and Analytics',
    orEnterAmount: (min) => `Or enter amount (min ${min})`,
    minimumTopUp: (min) => `Minimum top-up is ${min}`,
    priceBreakdown: 'Price Breakdown',
    calculatingPrice: 'Calculating price...',
    creditValue: 'Credit value',
    currentRate: 'Current π/USD rate',
    networkFee: 'Network fee',
    total: 'Total',
  },
  ar: {
    couldNotFetchPrice: 'تعذّر جلب السعر الحالي',
    platformCredits: 'رصيد المنصة',
    balanceForServices: 'رصيد استخدام خدمات المنصة',
    yourBalance: 'رصيدك الحالي',
    credits: 'رصيد',
    topUpYourCredits: 'اشحن رصيدك',
    useCreditsFor: 'استخدم رصيدك في: الجولات الافتراضية، الفحص، Aladdin، والتحليلات',
    orEnterAmount: (min) => `أو اكتب كمية (الحد الأدنى ${min})`,
    minimumTopUp: (min) => `أقل كمية للشحن هي ${min}`,
    priceBreakdown: 'تفاصيل السعر',
    calculatingPrice: 'جاري حساب السعر...',
    creditValue: 'قيمة الرصيد',
    currentRate: 'سعر π/دولار الحالي',
    networkFee: 'رسوم الشبكة',
    total: 'الإجمالي',
  },
  fr: {
    couldNotFetchPrice: "Impossible d'obtenir le prix actuel",
    platformCredits: 'Crédits de la plateforme',
    balanceForServices: 'Solde pour utiliser les services de la plateforme',
    yourBalance: 'Votre solde',
    credits: 'Crédits',
    topUpYourCredits: 'Recharger vos crédits',
    useCreditsFor: 'Utilisez vos crédits pour : Visites VR/IA, Inspection, Aladdin et Analyses',
    orEnterAmount: (min) => `Ou entrez un montant (min ${min})`,
    minimumTopUp: (min) => `La recharge minimale est de ${min}`,
    priceBreakdown: 'Détail du prix',
    calculatingPrice: 'Calcul du prix...',
    creditValue: 'Valeur du crédit',
    currentRate: 'Taux π/USD actuel',
    networkFee: 'Frais de réseau',
    total: 'Total',
  },
  es: {
    couldNotFetchPrice: 'No se pudo obtener el precio actual',
    platformCredits: 'Créditos de la plataforma',
    balanceForServices: 'Saldo para usar los servicios de la plataforma',
    yourBalance: 'Tu saldo',
    credits: 'Créditos',
    topUpYourCredits: 'Recarga tus créditos',
    useCreditsFor: 'Usa tus créditos para: Tours VR/IA, Inspección, Aladdin y Analíticas',
    orEnterAmount: (min) => `O ingresa una cantidad (mín. ${min})`,
    minimumTopUp: (min) => `La recarga mínima es ${min}`,
    priceBreakdown: 'Desglose de precio',
    calculatingPrice: 'Calculando precio...',
    creditValue: 'Valor del crédito',
    currentRate: 'Tasa π/USD actual',
    networkFee: 'Comisión de red',
    total: 'Total',
  },
  pt: {
    couldNotFetchPrice: 'Não foi possível obter o preço atual',
    platformCredits: 'Créditos da plataforma',
    balanceForServices: 'Saldo para usar os serviços da plataforma',
    yourBalance: 'Seu saldo',
    credits: 'Créditos',
    topUpYourCredits: 'Recarregue seus créditos',
    useCreditsFor: 'Use seus créditos para: Tours VR/IA, Inspeção, Aladdin e Análises',
    orEnterAmount: (min) => `Ou digite um valor (mín. ${min})`,
    minimumTopUp: (min) => `A recarga mínima é ${min}`,
    priceBreakdown: 'Detalhamento do preço',
    calculatingPrice: 'Calculando preço...',
    creditValue: 'Valor do crédito',
    currentRate: 'Taxa π/USD atual',
    networkFee: 'Taxa de rede',
    total: 'Total',
  },
  ur: {
    couldNotFetchPrice: 'موجودہ قیمت حاصل نہیں ہو سکی',
    platformCredits: 'پلیٹ فارم کریڈٹس',
    balanceForServices: 'پلیٹ فارم کی خدمات استعمال کرنے کے لیے بیلنس',
    yourBalance: 'آپ کا بیلنس',
    credits: 'کریڈٹس',
    topUpYourCredits: 'اپنے کریڈٹس ری چارج کریں',
    useCreditsFor: 'اپنے کریڈٹس استعمال کریں: VR/AI ٹورز، انسپیکٹ، علاء الدین، اور تجزیات کے لیے',
    orEnterAmount: (min) => `یا رقم درج کریں (کم از کم ${min})`,
    minimumTopUp: (min) => `کم از کم ری چارج ${min} ہے`,
    priceBreakdown: 'قیمت کی تفصیل',
    calculatingPrice: 'قیمت کا حساب لگایا جا رہا ہے...',
    creditValue: 'کریڈٹ ویلیو',
    currentRate: 'موجودہ π/USD ریٹ',
    networkFee: 'نیٹ ورک فیس',
    total: 'کل',
  },
  zh: {
    couldNotFetchPrice: '无法获取当前价格',
    platformCredits: '平台点数',
    balanceForServices: '用于使用平台服务的余额',
    yourBalance: '您的余额',
    credits: '点数',
    topUpYourCredits: '充值您的点数',
    useCreditsFor: '使用您的点数用于：VR/AI 导览、检查、阿拉丁和数据分析',
    orEnterAmount: (min) => `或输入金额（最低 ${min}）`,
    minimumTopUp: (min) => `最低充值为 ${min}`,
    priceBreakdown: '价格明细',
    calculatingPrice: '正在计算价格...',
    creditValue: '点数价值',
    currentRate: '当前 π/USD 汇率',
    networkFee: '网络手续费',
    total: '总计',
  },
};
