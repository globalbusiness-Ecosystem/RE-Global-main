import type { NavLanguage } from './nav-i18n';

type Lang7 = Record<NavLanguage, string>;

export interface HeroSlideI18n {
  id: number;
  type: 'hero' | 'action' | 'stats';
  title: Lang7;
  subtitle: Lang7;
  button?: Lang7;
  imageUrl?: string;
  stats?: { labelKey: string; value: number }[];
}

export const HERO_STAT_LABELS: Record<string, Lang7> = {
  properties: { en: 'Properties', ar: 'العقارات', fr: 'Propriétés', es: 'Propiedades', pt: 'Propriedades', ur: 'جائیدادیں', zh: '房产' },
  countries: { en: 'Countries', ar: 'الدول', fr: 'Pays', es: 'Países', pt: 'Países', ur: 'ممالک', zh: '国家' },
  investors: { en: 'Investors', ar: 'المستثمرون', fr: 'Investisseurs', es: 'Inversores', pt: 'Investidores', ur: 'سرمایہ کار', zh: '投资者' },
};

export const HERO_SLIDES: HeroSlideI18n[] = [
  {
    id: 1,
    type: 'hero',
    title: { en: 'Global Real Estate on Pi', ar: 'العقارات العالمية على Pi', fr: 'Immobilier mondial sur Pi', es: 'Bienes raíces globales en Pi', pt: 'Imóveis globais na Pi', ur: 'Pi پر عالمی ریئل اسٹیٹ', zh: 'Pi上的全球房地产' },
    subtitle: { en: 'Invest, buy, rent, and explore properties across 195 countries', ar: 'استثمر واشتر وأجّر واستكشف العقارات في 195 دولة', fr: 'Investissez, achetez, louez et explorez des propriétés dans 195 pays', es: 'Invierte, compra, alquila y explora propiedades en 195 países', pt: 'Invista, compre, alugue e explore imóveis em 195 países', ur: '195 ممالک میں سرمایہ کاری، خریداری، کرایہ اور جائیدادیں دیکھیں', zh: '在195个国家投资、购买、租赁和探索房产' },
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&fit=crop',
  },
  {
    id: 2,
    type: 'action',
    title: { en: 'Investment Opportunities', ar: 'فرص الاستثمار', fr: "Opportunités d'investissement", es: 'Oportunidades de inversión', pt: 'Oportunidades de investimento', ur: 'سرمایہ کاری کے مواقع', zh: '投资机会' },
    subtitle: { en: 'Build wealth through premium real estate on Pi Network', ar: 'بناء الثروة من خلال العقارات الفاخرة على شبكة Pi', fr: 'Bâtissez votre patrimoine avec l\'immobilier de prestige sur Pi Network', es: 'Genera riqueza a través de bienes raíces premium en Pi Network', pt: 'Construa riqueza através de imóveis premium na Pi Network', ur: 'Pi نیٹ ورک پر پریمیم ریئل اسٹیٹ کے ذریعے دولت بنائیں', zh: '通过Pi网络的优质房地产积累财富' },
    button: { en: 'Invest Now', ar: 'استثمر الآن', fr: 'Investir maintenant', es: 'Invertir ahora', pt: 'Investir agora', ur: 'ابھی سرمایہ کاری کریں', zh: '立即投资' },
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&fit=crop',
  },
  {
    id: 3,
    type: 'action',
    title: { en: 'Tokenized Real Estate', ar: 'العقارات المعمّنة', fr: 'Immobilier tokenisé', es: 'Bienes raíces tokenizados', pt: 'Imóveis tokenizados', ur: 'ٹوکنائزڈ ریئل اسٹیٹ', zh: '代币化房地产' },
    subtitle: { en: 'Own fractions of premium properties worldwide', ar: 'امتلك أجزاء من العقارات الفاخرة حول العالم', fr: 'Possédez des fractions de propriétés de prestige dans le monde entier', es: 'Posee fracciones de propiedades premium en todo el mundo', pt: 'Possua frações de imóveis premium em todo o mundo', ur: 'دنیا بھر کی پریمیم جائیدادوں کے حصے کے مالک بنیں', zh: '拥有全球优质房产的部分份额' },
    button: { en: 'Tokenized', ar: 'معمّن', fr: 'Tokenisé', es: 'Tokenizado', pt: 'Tokenizado', ur: 'ٹوکنائزڈ', zh: '代币化' },
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&fit=crop',
  },
  {
    id: 4,
    type: 'stats',
    title: { en: 'Why Join RE?', ar: 'لماذا تنضم إلى RE؟', fr: 'Pourquoi rejoindre RE ?', es: '¿Por qué unirse a RE?', pt: 'Por que se juntar à RE?', ur: 'RE کیوں جوائن کریں؟', zh: '为什么加入RE？' },
    subtitle: { en: 'Trusted by thousands of investors worldwide', ar: 'موثوق من قبل آلاف المستثمرين في جميع أنحاء العالم', fr: 'Approuvé par des milliers d\'investisseurs dans le monde', es: 'Confiado por miles de inversores en todo el mundo', pt: 'Confiado por milhares de investidores em todo o mundo', ur: 'دنیا بھر کے ہزاروں سرمایہ کاروں کا اعتماد', zh: '受到全球数千名投资者的信赖' },
    stats: [
      { labelKey: 'properties', value: 12500 },
      { labelKey: 'countries', value: 195 },
      { labelKey: 'investors', value: 45200 },
    ],
  },
];

export function tt(dict: Lang7, language: NavLanguage): string {
  return dict[language] || dict.en;
}
