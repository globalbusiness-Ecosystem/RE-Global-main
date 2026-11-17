import type { NavLanguage } from './nav-i18n';

interface Item { title: string; desc: string }
export interface GuideStrings {
  headerTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  stepsTitle: string;
  steps: Item[];
  investTitle: string;
  invest: Item[];
  verifyTitle: string;
  verifyIntro: string;
  verifyPi: Item;
  verifyWeb: Item;
  verifyPhotos: Item;
  verifyStatus: Item;
  verifyPrivacy: Item;
  verifyCta: string;
  protectTitle: string;
  protect: Item[];
  risksTitle: string;
  risks: Item[];
  glossaryTitle: string;
  glossary: Item[];
  faqTitle: string;
  faq: Item[];
  browseCta: string;
  tokenizedCta: string;
  supportTitle: string;
  supportBody: string;
  disclaimer: string;
}

const en: GuideStrings = {
  headerTitle: 'Getting started',
  heroTitle: 'New here? Start in 5 steps',
  heroSubtitle: 'A plain guide to using RE-Global: opening your account, verifying who you are, understanding property investing, buying and trading, and how your money is protected.',
  stepsTitle: 'Your first 5 steps',
  steps: [
    { title: '1. Sign in', desc: 'Open RE-Global in the Pi Browser and sign in with Pi, or sign in on the web with Google or e-mail. You can also add a fingerprint or face unlock in Settings so nobody else can open your account.' },
    { title: '2. Verify your identity', desc: 'Pi users are already identity-checked by Pi Network. If you sign in on the web, send a short verification request (see "How verification works" below). Payments open once it is approved.' },
    { title: '3. Learn before you invest', desc: 'Read "Investing in plain words" and "Risks you must know" below. Start small, and only with money you can afford to leave invested.' },
    { title: '4. Choose a property or shares', desc: 'Browse Buy, Rent, Off-Plan, Abroad or Tokenized. Open a listing to see photos, price, location and details before you decide.' },
    { title: '5. Pay and keep your contract', desc: 'After payment you receive a digitally signed contract. It is saved in "My Contracts" and anyone you share it with can check it is genuine.' },
  ],
  investTitle: 'Investing in plain words',
  invest: [
    { title: 'What is property investing?', desc: 'You put money into real estate hoping it grows in value or earns rent. Property is usually a long-term investment, not a quick trade.' },
    { title: 'What are tokenized shares?', desc: 'A property is split into small digital shares, so you can own a part of it instead of the whole thing. You can start with a smaller amount and spread your money across several properties.' },
    { title: 'How do I buy?', desc: 'Pick a listing, review the details, and pay with Pi (or by card where available). Your payment is recorded and a signed contract is created for it.' },
    { title: 'How do I trade shares?', desc: 'Shares can be offered to other users in the share market. Selling depends on another user buying, so it can take time and the price can differ from what you paid.' },
    { title: 'How do I follow my investments?', desc: 'Your Dashboard and My Contracts show what you own and what you paid. Check them regularly.' },
  ],
  verifyTitle: 'How verification works',
  verifyIntro: 'Verification proves you are a real person so that your money and everyone else\'s stay safe. It follows the same idea as "know your customer" checks on global platforms.',
  verifyPi: { title: 'If you use Pi', desc: 'Pi Network has already verified you, so you are not asked again.' },
  verifyWeb: { title: 'If you sign in on the web', desc: 'Open the verification page and send your full legal name, country and phone number. Choose a national ID or a passport.' },
  verifyPhotos: { title: 'Photos you send', desc: 'National ID: front, back and a selfie. Passport: the photo page and a selfie. Use a clear, well-lit photo with all corners visible.' },
  verifyStatus: { title: 'What happens next', desc: 'Our team reviews your request. The status shows as Pending, then Approved or Rejected (with a reason, and you can send it again). Payments for web accounts stay closed until you are approved.' },
  verifyPrivacy: { title: 'Your privacy', desc: 'Your photos are used only to review your request and are visible only to authorized admins. You choose whether your real name or an alias appears on your contracts.' },
  verifyCta: 'Verify my identity',
  protectTitle: 'How your investment is protected',
  protect: [
    { title: 'Verified users only', desc: 'Web accounts cannot pay or trade until their identity is approved, which makes fraud and fake accounts harder.' },
    { title: 'Signed contracts you can check', desc: 'Every purchase creates a digitally signed contract. Anyone you share it with can check on the Verify page that it is genuine and unchanged.' },
    { title: 'Account lock', desc: 'Turn on fingerprint or face unlock in Settings. Sensitive actions then ask you to confirm again, so a stolen phone or an open tab cannot move your money.' },
    { title: 'Reviewed by the team', desc: 'Listings, partners and verification requests are reviewed by our team, and admin actions are logged.' },
    { title: 'Your payments are recorded', desc: 'Each payment is checked and tied to one contract, so a payment cannot be reused.' },
    { title: 'Your part', desc: 'Never share your password, passkey or verification codes. RE-Global staff will never ask for them. Use only the official app and the contact details in this app.' },
  ],
  risksTitle: 'Risks you must know',
  risks: [
    { title: 'No guaranteed returns', desc: 'Property values and rents can go down as well as up. Be careful with anyone promising fixed or "risk-free" profit.' },
    { title: 'You may not be able to sell quickly', desc: 'Property and shares can take time to sell, and sometimes at a lower price.' },
    { title: 'Spread your money', desc: 'Do not put everything into one property. Invest only what you can afford to leave for the long term.' },
    { title: 'Check before you pay', desc: 'Read the listing and contract, and confirm the details. If something looks too good to be true, contact us first.' },
  ],
  glossaryTitle: 'Words you will see',
  glossary: [
    { title: 'KYC', desc: 'Know your customer: the identity check described above.' },
    { title: 'Tokenization', desc: 'Turning a property into small digital shares.' },
    { title: 'Off-plan', desc: 'A property that is sold before it is finished building.' },
    { title: 'ROI', desc: 'Return on investment: what you earned compared with what you put in.' },
    { title: 'Liquidity', desc: 'How quickly you can turn an investment back into cash.' },
    { title: 'Alias', desc: 'A display name you can use on contracts instead of your real name.' },
  ],
  faqTitle: 'Common questions',
  faq: [
    { title: 'How much do I need to start?', desc: 'Prices differ for each listing and share. The amount is shown on the listing before you pay.' },
    { title: 'My verification was rejected. What now?', desc: 'Open the verification page, read the reason, fix the photos or details and send it again.' },
    { title: 'I lost access to my account.', desc: 'Contact us using the details below and we will help you recover it safely.' },
  ],
  browseCta: 'Browse properties',
  tokenizedCta: 'See tokenized shares',
  supportTitle: 'Need help?',
  supportBody: 'Our team answers questions about verification, payments and contracts. Use the contact details in Help.',
  disclaimer: 'This guide is general information, not financial, legal or tax advice. Investing carries risk, including the loss of the money you put in.',
};

const ar: GuideStrings = {
  headerTitle: 'دليل البداية',
  heroTitle: 'جديد هنا؟ ابدأ في 5 خطوات',
  heroSubtitle: 'دليل بسيط لاستخدام RE-Global: فتح الحساب، توثيق هويتك، فهم الاستثمار العقاري، الشراء والتداول، وإزاي أموالك محمية.',
  stepsTitle: 'أول 5 خطوات',
  steps: [
    { title: '1. سجّل الدخول', desc: 'افتح RE-Global في متصفح Pi وسجّل بحساب Pi، أو سجّل من الويب بجوجل أو الإيميل. وتقدر تفعّل البصمة أو الوجه من الإعدادات عشان محدش غيرك يفتح حسابك.' },
    { title: '2. وثّق هويتك', desc: 'مستخدمو Pi اتحقق منهم Pi Network بالفعل. لو دخلت من الويب، ابعت طلب توثيق قصير (شوف «إزاي التوثيق بيتم» تحت). الدفع بيتفتح بعد الموافقة.' },
    { title: '3. اتعلّم قبل ما تستثمر', desc: 'اقرأ «الاستثمار ببساطة» و«مخاطر لازم تعرفها» تحت. ابدأ بمبلغ صغير، ومن فلوس تقدر تسيبها مستثمرة.' },
    { title: '4. اختار عقار أو حصص', desc: 'تصفح شراء، إيجار، على الخريطة، بالخارج أو التوكنز. افتح أي عرض وشوف الصور والسعر والموقع والتفاصيل قبل ما تقرر.' },
    { title: '5. ادفع واحتفظ بعقدك', desc: 'بعد الدفع بتستلم عقد موقّع رقمياً. بيتحفظ في «عقودي»، وأي شخص تشاركه معاه يقدر يتأكد إنه أصلي.' },
  ],
  investTitle: 'الاستثمار ببساطة',
  invest: [
    { title: 'يعني إيه استثمار عقاري؟', desc: 'تحط فلوسك في عقار على أمل إن قيمته تزيد أو يجيب إيجار. العقار غالباً استثمار طويل المدى مش تجارة سريعة.' },
    { title: 'يعني إيه حصص معمّمة (Tokenized)؟', desc: 'العقار بيتقسم لحصص رقمية صغيرة، فتملك جزء منه بدل العقار كله. تقدر تبدأ بمبلغ أصغر وتوزع فلوسك على أكتر من عقار.' },
    { title: 'أشتري إزاي؟', desc: 'اختار عرض، راجع التفاصيل، وادفع بـ Pi (أو بالكارت لو متاح). دفعتك بتتسجل وبيتعمل عقد موقّع ليها.' },
    { title: 'أتاجر في الحصص إزاي؟', desc: 'الحصص ممكن تتعرض لمستخدمين تانيين في سوق الحصص. البيع بيعتمد على إن حد تاني يشتري، فممكن ياخد وقت والسعر يختلف عن اللي دفعته.' },
    { title: 'أتابع استثماراتي إزاي؟', desc: 'لوحة التحكم و«عقودي» بيوروك اللي تملكه واللي دفعته. راجعهم بانتظام.' },
  ],
  verifyTitle: 'إزاي التوثيق بيتم',
  verifyIntro: 'التوثيق بيثبت إنك شخص حقيقي عشان فلوسك وفلوس الكل تفضل في أمان. نفس فكرة فحص «اعرف عميلك» (KYC) في المنصات العالمية.',
  verifyPi: { title: 'لو بتستخدم Pi', desc: 'Pi Network تحقق منك بالفعل، فمش هنطلب منك تاني.' },
  verifyWeb: { title: 'لو دخلت من الويب', desc: 'افتح صفحة التوثيق وابعت اسمك القانوني الكامل وبلدك ورقم تليفونك. اختار بطاقة رقم قومي أو جواز سفر.' },
  verifyPhotos: { title: 'الصور المطلوبة', desc: 'البطاقة: الوش والضهر وسيلفي. جواز السفر: صفحة الصورة وسيلفي. استخدم صورة واضحة ومضاءة وكل الأركان ظاهرة.' },
  verifyStatus: { title: 'بعد كده إيه؟', desc: 'فريقنا بيراجع طلبك. الحالة بتظهر: قيد المراجعة، ثم مقبول أو مرفوض (مع السبب وتقدر تبعته تاني). الدفع لحسابات الويب بيفضل مقفول لحد ما توافق عليك.' },
  verifyPrivacy: { title: 'خصوصيتك', desc: 'صورك بتتستخدم بس لمراجعة طلبك وبيشوفها الأدمن المصرّح لهم فقط. وإنت بتختار يظهر اسمك الحقيقي أو اسم مستعار في عقودك.' },
  verifyCta: 'وثّق هويتي',
  protectTitle: 'إزاي استثمارك محمي',
  protect: [
    { title: 'مستخدمين موثّقين بس', desc: 'حسابات الويب مش بتقدر تدفع أو تتاجر قبل الموافقة على الهوية، وده بيصعّب الاحتيال والحسابات المزيفة.' },
    { title: 'عقود موقّعة تقدر تتأكد منها', desc: 'كل عملية شراء بتعمل عقد موقّع رقمياً. أي شخص تشاركه معاه يقدر في صفحة التحقق يتأكد إنه أصلي ومتغيرش.' },
    { title: 'قفل الحساب', desc: 'فعّل البصمة أو الوجه من الإعدادات. العمليات الحساسة بتطلب تأكيد تاني، فمحدش يقدر يحرّك فلوسك بتليفون مسروق أو تبويب مفتوح.' },
    { title: 'مراجعة من الفريق', desc: 'العروض والشركاء وطلبات التوثيق بيراجعها فريقنا، وإجراءات الأدمن بتتسجل.' },
    { title: 'مدفوعاتك متسجلة', desc: 'كل دفعة بيتم التحقق منها وربطها بعقد واحد، فمينفعش تتستخدم تاني.' },
    { title: 'دورك إنت', desc: 'ماتشاركش كلمة السر أو الـ passkey أو أكواد التحقق مع حد. فريق RE-Global عمره ما هيطلبها. استخدم التطبيق الرسمي وبيانات التواصل اللي جواه بس.' },
  ],
  risksTitle: 'مخاطر لازم تعرفها',
  risks: [
    { title: 'مفيش عوائد مضمونة', desc: 'أسعار العقارات والإيجارات ممكن تنزل زي ما تطلع. خد بالك من أي حد يوعدك بربح ثابت أو «بدون مخاطرة».' },
    { title: 'ممكن مقدرش أبيع بسرعة', desc: 'العقار والحصص ممكن ياخدوا وقت في البيع، وأحياناً بسعر أقل.' },
    { title: 'وزّع فلوسك', desc: 'ماتحطش كل فلوسك في عقار واحد. استثمر بس اللي تقدر تسيبه على المدى الطويل.' },
    { title: 'اتأكد قبل ما تدفع', desc: 'اقرأ العرض والعقد وراجع التفاصيل. لو حاجة شكلها حلوة زيادة عن اللزوم، كلمنا الأول.' },
  ],
  glossaryTitle: 'كلمات هتقابلها',
  glossary: [
    { title: 'KYC', desc: 'اعرف عميلك: فحص الهوية اللي اتشرح فوق.' },
    { title: 'التوكنة (Tokenization)', desc: 'تحويل العقار لحصص رقمية صغيرة.' },
    { title: 'على الخريطة (Off-plan)', desc: 'عقار بيتباع قبل ما البناء يخلص.' },
    { title: 'ROI', desc: 'العائد على الاستثمار: اللي كسبته مقارنة باللي دفعته.' },
    { title: 'السيولة', desc: 'سرعة تحويل استثمارك لكاش تاني.' },
    { title: 'الاسم المستعار', desc: 'اسم عرض تستخدمه في العقود بدل اسمك الحقيقي.' },
  ],
  faqTitle: 'أسئلة شائعة',
  faq: [
    { title: 'محتاج كام عشان أبدأ؟', desc: 'الأسعار بتختلف حسب كل عرض وحصة. المبلغ بيظهر في العرض قبل ما تدفع.' },
    { title: 'التوثيق اترفض. أعمل إيه؟', desc: 'افتح صفحة التوثيق، اقرأ السبب، صحّح الصور أو البيانات وابعته تاني.' },
    { title: 'فقدت الوصول لحسابي.', desc: 'كلمنا من بيانات التواصل تحت وهنساعدك ترجعه بشكل آمن.' },
  ],
  browseCta: 'تصفح العقارات',
  tokenizedCta: 'شوف الحصص المعمّمة',
  supportTitle: 'محتاج مساعدة؟',
  supportBody: 'فريقنا بيرد على أسئلة التوثيق والدفع والعقود. استخدم بيانات التواصل في صفحة المساعدة.',
  disclaimer: 'الدليل ده معلومات عامة وليس نصيحة مالية أو قانونية أو ضريبية. الاستثمار فيه مخاطرة، ومنها خسارة المبلغ اللي حطيته.',
};

// French, Spanish, Portuguese, Urdu and Chinese show the English guide until the admin writes them.
export const GUIDE_I18N: Record<NavLanguage, GuideStrings> = { en, ar, fr: en, es: en, pt: en, ur: en, zh: en };
