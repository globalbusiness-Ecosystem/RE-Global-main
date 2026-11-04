import type { NavLanguage } from './nav-i18n';

// Suggested questions in Aladdin's chat (shown at the start, and after a contract has been analysed), in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const SUGGEST_HEADING = {
  en: 'Suggested questions:', ar: 'الأسئلة المقترحة:', fr: 'Questions suggérées :', es: 'Preguntas sugeridas:',
  pt: 'Perguntas sugeridas:', ur: 'تجویز کردہ سوالات:', zh: '推荐问题：',
} satisfies Row;

export const CONTRACT_FOLLOWUP_HEADING = {
  en: 'Ask about this contract:', ar: 'اسأل عن هذا العقد:', fr: 'Posez une question sur ce contrat :', es: 'Pregunta sobre este contrato:',
  pt: 'Pergunte sobre este contrato:', ur: 'اس معاہدے کے بارے میں پوچھیں:', zh: '就此合同提问：',
} satisfies Row;

export const START_QUESTIONS = {
  en: ['Best markets for 10π investment?', 'Off-plan vs tokenized ROI?', 'Golden Visa programs overview?', 'Mortgage tips for USA properties?', 'Egypt rental market analysis?', 'Pi payment advantages?'],
  ar: ['أفضل الأسواق لاستثمار 10π؟', 'مقارنة ROI للمشاريع والرمزية؟', 'نظرة على برامج التأشيرة الذهبية؟', 'نصائح الرهن العقاري الأمريكي؟', 'تحليل سوق الإيجار المصري؟', 'مميزات دفع Pi؟'],
  fr: ['Meilleurs marchés pour investir 10π ?', 'Sur plan ou tokenisé : quel ROI ?', 'Aperçu des programmes de Golden Visa ?', 'Conseils de prêt immobilier pour les États-Unis ?', 'Analyse du marché locatif en Égypte ?', 'Avantages du paiement en Pi ?'],
  es: ['¿Mejores mercados para invertir 10π?', '¿ROI sobre plano vs tokenizado?', '¿Resumen de los programas de Golden Visa?', '¿Consejos de hipoteca para propiedades en EE. UU.?', '¿Análisis del mercado de alquiler en Egipto?', '¿Ventajas de pagar con Pi?'],
  pt: ['Melhores mercados para investir 10π?', 'ROI na planta vs tokenizado?', 'Visão geral dos programas de Golden Visa?', 'Dicas de financiamento para imóveis nos EUA?', 'Análise do mercado de aluguel no Egito?', 'Vantagens de pagar com Pi?'],
  ur: ['10π کی سرمایہ کاری کے لیے بہترین مارکیٹیں کون سی ہیں؟', 'زیر تعمیر بمقابلہ ٹوکنائزڈ ROI؟', 'گولڈن ویزا پروگرامز کا جائزہ؟', 'امریکی جائیداد کے لیے مورگیج کے مشورے؟', 'مصر کی کرایہ مارکیٹ کا تجزیہ؟', 'Pi ادائیگی کے فوائد؟'],
  zh: ['投资 10π 的最佳市场有哪些？', '期房与代币化房产的投资回报对比？', '黄金签证项目概览？', '美国房产的按揭贷款建议？', '埃及租赁市场分析？', '使用 Pi 支付有哪些优势？'],
} satisfies Record<NavLanguage, string[]>;

export const CONTRACT_QUESTIONS = {
  en: ['Which clauses are the riskiest for me?', 'What happens if I want to cancel early?', 'Is it safe to sign this as it is?', 'What should I ask the other side to change?'],
  ar: ['ما أخطر البنود عليّ؟', 'ماذا يحدث لو أردت الإلغاء مبكرًا؟', 'هل من الآمن أن أوقّع كما هو؟', 'ماذا أطلب من الطرف الآخر تعديله؟'],
  fr: ['Quelles clauses sont les plus risquées pour moi ?', 'Que se passe-t-il si je veux résilier plus tôt ?', 'Est-il prudent de signer tel quel ?', 'Que dois-je demander à l’autre partie de modifier ?'],
  es: ['¿Qué cláusulas son las más arriesgadas para mí?', '¿Qué pasa si quiero cancelar antes de tiempo?', '¿Es seguro firmarlo tal como está?', '¿Qué debería pedir a la otra parte que cambie?'],
  pt: ['Quais cláusulas são as mais arriscadas para mim?', 'O que acontece se eu quiser cancelar antes do prazo?', 'É seguro assinar como está?', 'O que devo pedir à outra parte para alterar?'],
  ur: ['میرے لیے سب سے خطرناک شقیں کون سی ہیں؟', 'اگر میں جلد منسوخ کرنا چاہوں تو کیا ہوگا؟', 'کیا اسے جیسا ہے ویسا دستخط کرنا محفوظ ہے؟', 'مجھے دوسری فریق سے کیا تبدیل کرنے کو کہنا چاہیے؟'],
  zh: ['哪些条款对我风险最大？', '如果我想提前解约会怎样？', '按现状签署安全吗？', '我应该要求对方修改什么？'],
} satisfies Record<NavLanguage, string[]>;

function known(language: string | undefined): NavLanguage {
  return LANGS.find((l) => l === language) ?? 'en';
}
export const suggestHeading = (language: string | undefined) => SUGGEST_HEADING[known(language)];
export const contractHeading = (language: string | undefined) => CONTRACT_FOLLOWUP_HEADING[known(language)];
export const startQuestions = (language: string | undefined) => START_QUESTIONS[known(language)];
export const contractQuestions = (language: string | undefined) => CONTRACT_QUESTIONS[known(language)];
