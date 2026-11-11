import type { NavLanguage } from './nav-i18n';

// The Aladdin advisor in all 7 languages: the greeting, the closing tip heading and the language the AI must answer in.
type Row = Record<NavLanguage, string>;

export const ADVISOR_LABELS = {
  greetingNamed: {
    en: "Hi {name}! I'm Aladdin, your world-class real estate advisor on Pi Network. With your Pi balance of {balance} π, I can guide you through global property markets in UAE, Egypt, Saudi Arabia, USA, UK, Europe, and Asia. I specialize in investment strategies, ROI analysis, Golden Visa programs, off-plan risks, Pi payments, mortgages, market trends, and legal advice by country. What property insights do you need today?",
    ar: 'مرحبا {name}! أنا علاء الدين، مستشارك العقاري العالمي على شبكة Pi. برصيدك من {balance} π، يمكنني إرشادك عبر الأسواق العقارية العالمية في الإمارات ومصر والسعودية وأمريكا والمملكة المتحدة وأوروبا وآسيا. أتخصص في استراتيجيات الاستثمار وتحليل العوائد والتأشيرات الذهبية والمخاطر والدفع بـ Pi والرهن العقاري والاتجاهات والقوانين. ما البصائر العقارية التي تحتاجها؟',
    fr: "Bonjour {name} ! Je suis Aladdin, votre conseiller immobilier mondial sur Pi Network. Avec votre solde de {balance} π, je peux vous guider sur les marchés immobiliers des Émirats, d'Égypte, d'Arabie saoudite, des États-Unis, du Royaume-Uni, d'Europe et d'Asie : stratégies d'investissement, rendement, Golden Visa, risques de l'off-plan, paiements en Pi, prêts immobiliers, tendances du marché et conseils juridiques par pays. De quoi avez-vous besoin aujourd'hui ?",
    es: '¡Hola {name}! Soy Aladdin, tu asesor inmobiliario global en Pi Network. Con tu saldo de {balance} π, puedo orientarte en los mercados de Emiratos, Egipto, Arabia Saudí, EE. UU., Reino Unido, Europa y Asia: estrategias de inversión, rentabilidad, Golden Visa, riesgos de la compra sobre plano, pagos en Pi, hipotecas, tendencias del mercado y asesoría legal por país. ¿Qué necesitas hoy?',
    pt: 'Olá {name}! Sou o Aladdin, seu consultor imobiliário global na Pi Network. Com seu saldo de {balance} π, posso orientá-lo nos mercados dos Emirados, Egito, Arábia Saudita, EUA, Reino Unido, Europa e Ásia: estratégias de investimento, retorno, Golden Visa, riscos na planta, pagamentos em Pi, financiamento, tendências de mercado e orientação jurídica por país. Do que você precisa hoje?',
    ur: 'السلام علیکم {name}! میں علاء الدین ہوں، Pi Network پر آپ کا عالمی رئیل اسٹیٹ مشیر۔ آپ کے {balance} π بیلنس کے ساتھ میں امارات، مصر، سعودی عرب، امریکہ، برطانیہ، یورپ اور ایشیا کی جائیداد منڈیوں میں رہنمائی کر سکتا ہوں: سرمایہ کاری کی حکمتِ عملی، منافع، گولڈن ویزا، آف پلان کے خطرات، Pi ادائیگیاں، مارگیج، مارکیٹ رجحانات اور ملک کے لحاظ سے قانونی مشورہ۔ آج آپ کو کس چیز کی ضرورت ہے؟',
    zh: '您好 {name}！我是 Aladdin，您在 Pi Network 上的全球房地产顾问。凭您的 {balance} π 余额，我可以为您讲解阿联酋、埃及、沙特、美国、英国、欧洲和亚洲的房地产市场：投资策略、回报分析、黄金签证、期房风险、Pi 支付、按揭、市场趋势以及各国法律建议。今天您需要什么帮助？',
  },
  greetingPlain: {
    en: "Hi! I'm Aladdin, your world-class real estate advisor. I answer ANY question about global property markets, investments, ROI, legal advice, Pi payments, mortgages, and market trends. What can I help with?",
    ar: 'مرحبا! أنا علاء الدين، مستشارك العقاري العالمي. أجيب على أي سؤال عن الأسواق العقارية والاستثمارات والعوائد والقانون والدفع بـ Pi والرهن والاتجاهات. كيف يمكنني مساعدتك؟',
    fr: 'Bonjour ! Je suis Aladdin, votre conseiller immobilier mondial. Je réponds à toutes vos questions sur les marchés immobiliers, les investissements, le rendement, le droit, les paiements en Pi, les prêts et les tendances. Comment puis-je vous aider ?',
    es: '¡Hola! Soy Aladdin, tu asesor inmobiliario global. Respondo cualquier pregunta sobre mercados inmobiliarios, inversiones, rentabilidad, asesoría legal, pagos en Pi, hipotecas y tendencias. ¿En qué puedo ayudarte?',
    pt: 'Olá! Sou o Aladdin, seu consultor imobiliário global. Respondo qualquer pergunta sobre mercados imobiliários, investimentos, retorno, orientação jurídica, pagamentos em Pi, financiamento e tendências. Como posso ajudar?',
    ur: 'السلام علیکم! میں علاء الدین ہوں، آپ کا عالمی رئیل اسٹیٹ مشیر۔ میں جائیداد کی منڈیوں، سرمایہ کاری، منافع، قانونی مشورے، Pi ادائیگیوں، مارگیج اور رجحانات سے متعلق ہر سوال کا جواب دیتا ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟',
    zh: '您好！我是 Aladdin，您的全球房地产顾问。关于房地产市场、投资、回报、法律建议、Pi 支付、按揭和市场趋势的任何问题，我都可以解答。有什么可以帮您？',
  },
  tipHeading: { en: '💡 Pi Investment Tip:', ar: '💡 نصيحة استثمار Pi:', fr: '💡 Conseil d\'investissement Pi :', es: '💡 Consejo de inversión Pi:', pt: '💡 Dica de investimento Pi:', ur: '💡 Pi سرمایہ کاری کا مشورہ:', zh: '💡 Pi 投资提示：' },
} satisfies Record<string, Row>;

type AdvisorLabelKey = keyof typeof ADVISOR_LABELS;

export const ADVISOR_LANGUAGE_NAMES: Row = {
  en: 'English', ar: 'Arabic', fr: 'French', es: 'Spanish', pt: 'Portuguese', ur: 'Urdu', zh: 'Simplified Chinese',
};

export const isAdvisorLanguage = (x: unknown): x is NavLanguage => typeof x === 'string' && Object.prototype.hasOwnProperty.call(ADVISOR_LABELS.tipHeading, x);

export function advisorText(key: AdvisorLabelKey, language: string | undefined, vars: Record<string, string | number> = {}): string {
  const row = ADVISOR_LABELS[key] as Row;
  let text = isAdvisorLanguage(language) ? row[language] : row.en;
  for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
  return text;
}

/** What the AI is told about the language of its answer. Empty for Arabic, whose prompt is already in Arabic. */
export function languageInstruction(language: string): string {
  if (language === 'ar' || !isAdvisorLanguage(language)) return '';
  return `\n\nLANGUAGE: The app is set to ${ADVISOR_LANGUAGE_NAMES[language]}. Write your whole answer in ${ADVISOR_LANGUAGE_NAMES[language]}, unless the user clearly writes in another language, then use theirs. Start the closing tip line with "${ADVISOR_LABELS.tipHeading[language]}".`;
}
