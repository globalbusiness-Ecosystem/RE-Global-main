import type { NavLanguage } from './nav-i18n';

interface Item { title: string; desc: string }
export interface AboutStrings {
  headerTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionBody: string;
  whatTitle: string;
  what: Item[];
  valuesTitle: string;
  values: Item[];
  ecoTitle: string;
  ecoBody: string;
  contactTitle: string;
  contactBody: string;
  emailLabel: string;
  websiteLabel: string;
  whatsappLabel: string;
  ctaTitle: string;
  ctaButton: string;
}

// Built-in text of the "About us" page. The admin can change any line (Arabic and English) from "نصوص الصفحات".
export const ABOUT_I18N: Record<NavLanguage, AboutStrings> = {
  en: {
    headerTitle: 'About us',
    heroTitle: 'Real estate, without borders',
    heroSubtitle: 'RE is the real estate pillar of the GlobalBusiness ecosystem.',
    missionTitle: 'Our mission',
    missionBody: 'We make it simple and safe to find, buy, rent and invest in property anywhere in the world, with Pi payments, digital contracts and clear, verified information.',
    whatTitle: 'What you can do on RE',
    what: [
      { title: 'Browse and compare', desc: 'Search listings by country, type and price, with maps and photos.' },
      { title: 'Buy, rent or stay', desc: 'Pay with Pi or by card and sign digital contracts inside the app.' },
      { title: 'Invest in shares', desc: 'Own a share of a property and trade it on the secondary market.' },
      { title: 'Grow with partners', desc: 'Partners list projects and earn commission through the partner program.' },
    ],
    valuesTitle: 'What we stand for',
    values: [
      { title: 'Trust', desc: 'Identity checks and clear contracts protect both sides of every deal.' },
      { title: 'Transparency', desc: 'Prices, fees and terms are shown up front, before you commit.' },
      { title: 'Security', desc: 'Fingerprint protection and verified payments keep your account safe.' },
    ],
    ecoTitle: 'Part of GlobalBusiness',
    ecoBody: 'RE is one of the apps in the GlobalBusiness ecosystem, a family of Pi Network apps built to bring everyday commerce to Pi users.',
    contactTitle: 'Get in touch',
    contactBody: 'Questions, partnerships or support? We would love to hear from you.',
    emailLabel: 'Email',
    websiteLabel: 'Website',
    whatsappLabel: 'WhatsApp',
    ctaTitle: 'Ready to start?',
    ctaButton: 'Explore properties',
  },
  ar: {
    headerTitle: 'نبذة عنا',
    heroTitle: 'العقارات بلا حدود',
    heroSubtitle: 'RE هو ركن العقارات في منظومة GlobalBusiness.',
    missionTitle: 'رسالتنا',
    missionBody: 'نسهّل ونأمّن البحث عن العقارات وشراءها وإيجارها والاستثمار فيها في أي مكان في العالم، بالدفع بعملة Pi وعقود رقمية ومعلومات واضحة وموثّقة.',
    whatTitle: 'تقدر تعمل إيه على RE',
    what: [
      { title: 'تصفّح وقارن', desc: 'ابحث في العقارات حسب الدولة والنوع والسعر، مع الخرائط والصور.' },
      { title: 'اشترِ أو استأجر أو أقم', desc: 'ادفع بـ Pi أو بالكارت ووقّع العقود الرقمية جوه التطبيق.' },
      { title: 'استثمر في حصص', desc: 'امتلك حصة في عقار وبِعها في السوق الثانوي.' },
      { title: 'انمو مع الشركاء', desc: 'الشركاء بيعرضوا مشاريعهم ويكسبوا عمولة من برنامج الشركاء.' },
    ],
    valuesTitle: 'قيمنا',
    values: [
      { title: 'الثقة', desc: 'التحقق من الهوية والعقود الواضحة بتحمي الطرفين في كل صفقة.' },
      { title: 'الشفافية', desc: 'الأسعار والرسوم والشروط بتتعرض قدامك قبل ما تلتزم.' },
      { title: 'الأمان', desc: 'حماية البصمة والمدفوعات الموثّقة بتحافظ على حسابك.' },
    ],
    ecoTitle: 'جزء من GlobalBusiness',
    ecoBody: 'RE واحد من تطبيقات منظومة GlobalBusiness، عائلة تطبيقات على شبكة Pi هدفها توصيل التجارة اليومية لمستخدمي Pi.',
    contactTitle: 'تواصل معنا',
    contactBody: 'عندك سؤال أو شراكة أو محتاج دعم؟ يسعدنا نسمعك.',
    emailLabel: 'البريد الإلكتروني',
    websiteLabel: 'الموقع',
    whatsappLabel: 'واتساب',
    ctaTitle: 'جاهز تبدأ؟',
    ctaButton: 'استكشف العقارات',
  },
  fr: {
    headerTitle: 'À propos',
    heroTitle: 'L’immobilier sans frontières',
    heroSubtitle: 'RE est le pilier immobilier de l’écosystème GlobalBusiness.',
    missionTitle: 'Notre mission',
    missionBody: 'Nous rendons la recherche, l’achat, la location et l’investissement immobilier simples et sûrs partout dans le monde, avec des paiements en Pi, des contrats numériques et des informations claires et vérifiées.',
    whatTitle: 'Ce que vous pouvez faire sur RE',
    what: [
      { title: 'Parcourir et comparer', desc: 'Recherchez par pays, type et prix, avec cartes et photos.' },
      { title: 'Acheter, louer ou séjourner', desc: 'Payez en Pi ou par carte et signez des contrats numériques dans l’application.' },
      { title: 'Investir en parts', desc: 'Détenez une part d’un bien et échangez-la sur le marché secondaire.' },
      { title: 'Grandir avec des partenaires', desc: 'Les partenaires publient leurs projets et gagnent une commission.' },
    ],
    valuesTitle: 'Nos valeurs',
    values: [
      { title: 'Confiance', desc: 'La vérification d’identité et des contrats clairs protègent les deux parties.' },
      { title: 'Transparence', desc: 'Prix, frais et conditions sont affichés avant tout engagement.' },
      { title: 'Sécurité', desc: 'La protection par empreinte et les paiements vérifiés sécurisent votre compte.' },
    ],
    ecoTitle: 'Partie de GlobalBusiness',
    ecoBody: 'RE fait partie de l’écosystème GlobalBusiness, une famille d’applications Pi Network qui apportent le commerce quotidien aux utilisateurs de Pi.',
    contactTitle: 'Contactez-nous',
    contactBody: 'Une question, un partenariat ou besoin d’aide ? Nous serions ravis de vous lire.',
    emailLabel: 'E-mail',
    websiteLabel: 'Site web',
    whatsappLabel: 'WhatsApp',
    ctaTitle: 'Prêt à commencer ?',
    ctaButton: 'Découvrir les biens',
  },
  es: {
    headerTitle: 'Sobre nosotros',
    heroTitle: 'Inmuebles sin fronteras',
    heroSubtitle: 'RE es el pilar inmobiliario del ecosistema GlobalBusiness.',
    missionTitle: 'Nuestra misión',
    missionBody: 'Hacemos simple y seguro buscar, comprar, alquilar e invertir en propiedades en cualquier lugar del mundo, con pagos en Pi, contratos digitales e información clara y verificada.',
    whatTitle: 'Qué puedes hacer en RE',
    what: [
      { title: 'Explorar y comparar', desc: 'Busca por país, tipo y precio, con mapas y fotos.' },
      { title: 'Comprar, alquilar o alojarte', desc: 'Paga con Pi o tarjeta y firma contratos digitales en la app.' },
      { title: 'Invertir en participaciones', desc: 'Sé dueño de una parte de una propiedad y véndela en el mercado secundario.' },
      { title: 'Crecer con socios', desc: 'Los socios publican proyectos y ganan comisión con el programa de socios.' },
    ],
    valuesTitle: 'Nuestros valores',
    values: [
      { title: 'Confianza', desc: 'La verificación de identidad y los contratos claros protegen a ambas partes.' },
      { title: 'Transparencia', desc: 'Precios, tarifas y condiciones se muestran antes de comprometerte.' },
      { title: 'Seguridad', desc: 'La protección con huella y los pagos verificados cuidan tu cuenta.' },
    ],
    ecoTitle: 'Parte de GlobalBusiness',
    ecoBody: 'RE es una de las apps del ecosistema GlobalBusiness, una familia de apps de Pi Network que lleva el comercio diario a los usuarios de Pi.',
    contactTitle: 'Contáctanos',
    contactBody: '¿Preguntas, alianzas o soporte? Nos encantará escucharte.',
    emailLabel: 'Correo',
    websiteLabel: 'Sitio web',
    whatsappLabel: 'WhatsApp',
    ctaTitle: '¿Listo para empezar?',
    ctaButton: 'Explorar propiedades',
  },
  pt: {
    headerTitle: 'Sobre nós',
    heroTitle: 'Imóveis sem fronteiras',
    heroSubtitle: 'RE é o pilar imobiliário do ecossistema GlobalBusiness.',
    missionTitle: 'Nossa missão',
    missionBody: 'Tornamos simples e seguro encontrar, comprar, alugar e investir em imóveis em qualquer lugar do mundo, com pagamentos em Pi, contratos digitais e informações claras e verificadas.',
    whatTitle: 'O que você pode fazer no RE',
    what: [
      { title: 'Explorar e comparar', desc: 'Pesquise por país, tipo e preço, com mapas e fotos.' },
      { title: 'Comprar, alugar ou se hospedar', desc: 'Pague com Pi ou cartão e assine contratos digitais no app.' },
      { title: 'Investir em cotas', desc: 'Tenha uma cota de um imóvel e negocie no mercado secundário.' },
      { title: 'Crescer com parceiros', desc: 'Parceiros publicam projetos e ganham comissão pelo programa de parceiros.' },
    ],
    valuesTitle: 'Nossos valores',
    values: [
      { title: 'Confiança', desc: 'Verificação de identidade e contratos claros protegem os dois lados.' },
      { title: 'Transparência', desc: 'Preços, taxas e condições aparecem antes de você se comprometer.' },
      { title: 'Segurança', desc: 'Proteção por digital e pagamentos verificados mantêm sua conta segura.' },
    ],
    ecoTitle: 'Parte do GlobalBusiness',
    ecoBody: 'RE é um dos apps do ecossistema GlobalBusiness, uma família de apps da Pi Network que leva o comércio do dia a dia aos usuários do Pi.',
    contactTitle: 'Fale conosco',
    contactBody: 'Dúvidas, parcerias ou suporte? Adoraríamos ouvir você.',
    emailLabel: 'E-mail',
    websiteLabel: 'Site',
    whatsappLabel: 'WhatsApp',
    ctaTitle: 'Pronto para começar?',
    ctaButton: 'Explorar imóveis',
  },
  ur: {
    headerTitle: 'ہمارے بارے میں',
    heroTitle: 'سرحدوں کے بغیر رئیل اسٹیٹ',
    heroSubtitle: 'RE گلوبل بزنس ایکو سسٹم کا رئیل اسٹیٹ ستون ہے۔',
    missionTitle: 'ہمارا مشن',
    missionBody: 'ہم دنیا میں کہیں بھی جائیداد تلاش کرنا، خریدنا، کرائے پر لینا اور اس میں سرمایہ کاری کرنا آسان اور محفوظ بناتے ہیں، Pi ادائیگیوں، ڈیجیٹل معاہدوں اور واضح تصدیق شدہ معلومات کے ساتھ۔',
    whatTitle: 'RE پر آپ کیا کر سکتے ہیں',
    what: [
      { title: 'تلاش اور موازنہ', desc: 'ملک، قسم اور قیمت کے لحاظ سے نقشوں اور تصاویر کے ساتھ تلاش کریں۔' },
      { title: 'خریدیں، کرائے پر لیں یا ٹھہریں', desc: 'Pi یا کارڈ سے ادائیگی کریں اور ایپ میں ڈیجیٹل معاہدے پر دستخط کریں۔' },
      { title: 'حصص میں سرمایہ کاری', desc: 'جائیداد کا حصہ خریدیں اور ثانوی مارکیٹ میں بیچیں۔' },
      { title: 'شراکت داروں کے ساتھ ترقی', desc: 'شراکت دار منصوبے پیش کرتے ہیں اور کمیشن کماتے ہیں۔' },
    ],
    valuesTitle: 'ہماری اقدار',
    values: [
      { title: 'اعتماد', desc: 'شناخت کی تصدیق اور واضح معاہدے دونوں فریقوں کی حفاظت کرتے ہیں۔' },
      { title: 'شفافیت', desc: 'قیمتیں، فیس اور شرائط پہلے ہی دکھائی جاتی ہیں۔' },
      { title: 'تحفظ', desc: 'فنگر پرنٹ تحفظ اور تصدیق شدہ ادائیگیاں آپ کے اکاؤنٹ کو محفوظ رکھتی ہیں۔' },
    ],
    ecoTitle: 'گلوبل بزنس کا حصہ',
    ecoBody: 'RE گلوبل بزنس ایکو سسٹم کی ایپس میں سے ایک ہے، Pi نیٹ ورک ایپس کا ایک خاندان جو روزمرہ تجارت Pi صارفین تک پہنچاتا ہے۔',
    contactTitle: 'ہم سے رابطہ کریں',
    contactBody: 'سوال، شراکت یا مدد چاہیے؟ ہمیں آپ کی بات سن کر خوشی ہو گی۔',
    emailLabel: 'ای میل',
    websiteLabel: 'ویب سائٹ',
    whatsappLabel: 'واٹس ایپ',
    ctaTitle: 'شروع کرنے کے لیے تیار؟',
    ctaButton: 'جائیدادیں دیکھیں',
  },
  zh: {
    headerTitle: '关于我们',
    heroTitle: '无国界的房地产',
    heroSubtitle: 'RE 是 GlobalBusiness 生态系统的房地产支柱。',
    missionTitle: '我们的使命',
    missionBody: '我们让您在全球任何地方查找、购买、租赁和投资房产变得简单而安全，支持 Pi 支付、数字合同以及清晰、经过验证的信息。',
    whatTitle: '您可以在 RE 做什么',
    what: [
      { title: '浏览与比较', desc: '按国家、类型和价格搜索房源，配有地图和照片。' },
      { title: '购买、租赁或入住', desc: '用 Pi 或银行卡付款，并在应用内签署数字合同。' },
      { title: '投资份额', desc: '持有房产份额，并在二级市场交易。' },
      { title: '与合作伙伴共同成长', desc: '合作伙伴发布项目，并通过合作伙伴计划赚取佣金。' },
    ],
    valuesTitle: '我们的价值观',
    values: [
      { title: '信任', desc: '身份验证和清晰的合同保护交易双方。' },
      { title: '透明', desc: '价格、费用和条款在您承诺之前就已列明。' },
      { title: '安全', desc: '指纹保护和经过验证的支付保障您的账户安全。' },
    ],
    ecoTitle: 'GlobalBusiness 的一部分',
    ecoBody: 'RE 是 GlobalBusiness 生态系统中的应用之一，这是一个 Pi Network 应用家族，旨在把日常商业带给 Pi 用户。',
    contactTitle: '联系我们',
    contactBody: '有问题、合作或需要支持？我们期待您的来信。',
    emailLabel: '邮箱',
    websiteLabel: '网站',
    whatsappLabel: 'WhatsApp',
    ctaTitle: '准备好开始了吗？',
    ctaButton: '探索房产',
  },
};
