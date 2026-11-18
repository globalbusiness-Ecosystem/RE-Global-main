import type { NavLanguage } from './nav-i18n';
import type { TourStep } from './tour';

export interface TourStrings {
  steps: TourStep[];
  next: string; back: string; skip: string; done: string; hideCard: string; replay: string; stepOf: string;
}

const en: TourStrings = {
  steps: [
    { target: null, title: 'Welcome to RE-Global 👋', text: 'A quick 30-second tour will show you where everything is. You can skip it any time.' },
    { target: '[data-tour="nav-map"]', title: 'Find property on the map', text: 'Browse properties by location and open any pin to see its price and details.' },
    { target: '[data-tour="nav-dashboard"]', title: 'Your dashboard', text: 'See what you own and follow your investments in one place.' },
    { target: '[data-tour="nav-alerts"]', title: 'Alerts', text: 'Updates about your payments, contracts and verification arrive here.' },
    { target: '[data-tour="nav-profile"]', title: 'Profile and security', text: 'Verify your identity here, and turn on fingerprint or face unlock to protect your account.' },
    { target: '[data-tour="nav-partners"]', title: 'Partners', text: 'Find trusted partners: developers, agents and service companies.' },
    { target: '[data-tour="menu"]', title: 'The menu', text: 'Buy, rent, invest, tokenized shares, contracts, help and more are all in this menu.' },
    { target: '[data-tour="guide-card"]', title: 'Full beginner guide', text: 'How verification works, how your investment is protected and the risks to know. Open it whenever you like.' },
    { target: null, title: 'You are ready ✅', text: 'Start by verifying your identity (if you signed in on the web), then pick a property or tokenized shares. Start small.' },
  ],
  next: 'Next', back: 'Back', skip: 'Skip', done: 'Done', hideCard: 'Hide this card', replay: 'Take the app tour', stepOf: 'of',
};

const ar: TourStrings = {
  steps: [
    { target: null, title: 'أهلاً بيك في RE-Global 👋', text: 'جولة سريعة 30 ثانية هتوريك كل حاجة فين. تقدر تتخطاها في أي وقت.' },
    { target: '[data-tour="nav-map"]', title: 'دوّر على عقار في الخريطة', text: 'تصفح العقارات حسب الموقع، وافتح أي دبوس تشوف سعره وتفاصيله.' },
    { target: '[data-tour="nav-dashboard"]', title: 'لوحة التحكم', text: 'شوف اللي تملكه وتابع استثماراتك في مكان واحد.' },
    { target: '[data-tour="nav-alerts"]', title: 'التنبيهات', text: 'تحديثات مدفوعاتك وعقودك والتوثيق بتوصلك هنا.' },
    { target: '[data-tour="nav-profile"]', title: 'الملف الشخصي والأمان', text: 'وثّق هويتك من هنا، وفعّل البصمة أو الوجه عشان تحمي حسابك.' },
    { target: '[data-tour="nav-partners"]', title: 'الشركاء', text: 'اتعرف على شركاء موثوقين: مطورين ووسطاء وشركات خدمات.' },
    { target: '[data-tour="menu"]', title: 'القائمة', text: 'شراء، إيجار، استثمار، حصص معمّمة، عقود، مساعدة وأكتر كلها في القائمة دي.' },
    { target: '[data-tour="guide-card"]', title: 'دليل المبتدئين الكامل', text: 'إزاي التوثيق بيتم، وإزاي استثمارك محمي، والمخاطر اللي لازم تعرفها. افتحه وقت ما تحب.' },
    { target: null, title: 'جاهز تبدأ ✅', text: 'ابدأ بتوثيق هويتك (لو دخلت من الويب)، وبعدين اختار عقار أو حصص معمّمة. وابدأ بمبلغ صغير.' },
  ],
  next: 'التالي', back: 'السابق', skip: 'تخطي', done: 'تم', hideCard: 'إخفاء الكارت', replay: 'ابدأ جولة التطبيق', stepOf: 'من',
};

// Other languages show the English tour until the texts are translated.
export const TOUR_I18N: Record<NavLanguage, TourStrings> = { en, ar, fr: en, es: en, pt: en, ur: en, zh: en };
