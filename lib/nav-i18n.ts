export type NavLanguage = 'en' | 'ar' | 'fr' | 'es' | 'pt' | 'ur' | 'zh';

export const LANGUAGE_OPTIONS: { code: NavLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'zh', label: 'Chinese', native: '中文' },
];

export const NAV_DICTIONARY: Record<NavLanguage, {
  menu: string;
  whitepaper: string;
  hotel: string;
  invest: string;
  tokenized: string;
  abroad: string;
  offplan: string;
  partners: string;
  sell: string;
  help: string;
  dashboard: string;
  contracts: string;
  favorites: string;
  settings: string;
  displayLanguage: string;
  theme: string;
  darkMode: string;
  lightMode: string;
  translationNote: string;
  signedInAs: string;
  notSignedIn: string;
}> = {
  en: {
    menu: 'Menu', whitepaper: 'White Paper 📄', hotel: 'Hotel', invest: 'Invest', tokenized: 'Tokenized',
    abroad: 'Abroad', offplan: 'Off-Plan', partners: 'Partners', sell: 'Sell Property', help: 'Help',
    dashboard: 'Dashboard', contracts: 'My Contracts', favorites: 'Favorites', settings: 'Settings',
    displayLanguage: 'Display Language', theme: 'Appearance', darkMode: 'Dark', lightMode: 'Light',
    translationNote: 'Full app translation for this language is coming soon — pages will still show in English or Arabic for now.',
    signedInAs: 'Signed in as', notSignedIn: 'Not signed in',
  },
  ar: {
    menu: 'القائمة', whitepaper: 'الورقة البيضاء 📄', hotel: 'فندق', invest: 'استثمر', tokenized: 'معمّم',
    abroad: 'بالخارج', offplan: 'قيد الإنشاء', partners: 'الشركاء', sell: 'بيع العقار', help: 'مساعدة',
    dashboard: 'لوحة التحكم', contracts: 'عقودي', favorites: 'المفضلات', settings: 'الإعدادات',
    displayLanguage: 'لغة العرض', theme: 'المظهر', darkMode: 'ليلي', lightMode: 'نهاري',
    translationNote: 'الترجمة الكاملة لهذه اللغة قريباً — الصفحات ستظهر بالعربي أو الإنجليزي حالياً.',
    signedInAs: 'مسجل دخول باسم', notSignedIn: 'غير مسجل دخول',
  },
  fr: {
    menu: 'Menu', whitepaper: 'Livre blanc 📄', hotel: 'Hôtel', invest: 'Investir', tokenized: 'Tokenisé',
    abroad: 'À l\'étranger', offplan: 'Sur plan', partners: 'Partenaires', sell: 'Vendre un bien', help: 'Aide',
    dashboard: 'Tableau de bord', contracts: 'Mes contrats', favorites: 'Favoris', settings: 'Paramètres',
    displayLanguage: "Langue d'affichage", theme: 'Apparence', darkMode: 'Sombre', lightMode: 'Clair',
    translationNote: "La traduction complète de l'application pour cette langue arrive bientôt — les pages resteront en anglais ou en arabe pour le moment.",
    signedInAs: 'Connecté en tant que', notSignedIn: 'Non connecté',
  },
  es: {
    menu: 'Menú', whitepaper: 'Libro blanco 📄', hotel: 'Hotel', invest: 'Invertir', tokenized: 'Tokenizado',
    abroad: 'En el extranjero', offplan: 'Sobre plano', partners: 'Socios', sell: 'Vender propiedad', help: 'Ayuda',
    dashboard: 'Panel', contracts: 'Mis contratos', favorites: 'Favoritos', settings: 'Configuración',
    displayLanguage: 'Idioma de la interfaz', theme: 'Apariencia', darkMode: 'Oscuro', lightMode: 'Claro',
    translationNote: 'La traducción completa de la app para este idioma llegará pronto — por ahora las páginas seguirán en inglés o árabe.',
    signedInAs: 'Conectado como', notSignedIn: 'No conectado',
  },
  pt: {
    menu: 'Menu', whitepaper: 'Livro branco 📄', hotel: 'Hotel', invest: 'Investir', tokenized: 'Tokenizado',
    abroad: 'No exterior', offplan: 'Na planta', partners: 'Parceiros', sell: 'Vender imóvel', help: 'Ajuda',
    dashboard: 'Painel', contracts: 'Meus contratos', favorites: 'Favoritos', settings: 'Configurações',
    displayLanguage: 'Idioma de exibição', theme: 'Aparência', darkMode: 'Escuro', lightMode: 'Claro',
    translationNote: 'A tradução completa do app para este idioma chega em breve — por enquanto as páginas continuam em inglês ou árabe.',
    signedInAs: 'Conectado como', notSignedIn: 'Não conectado',
  },
  ur: {
    menu: 'مینو', whitepaper: 'وائٹ پیپر 📄', hotel: 'ہوٹل', invest: 'سرمایہ کاری', tokenized: 'ٹوکنائزڈ',
    abroad: 'بیرون ملک', offplan: 'زیر تعمیر', partners: 'شراکت دار', sell: 'جائیداد بیچیں', help: 'مدد',
    dashboard: 'ڈیش بورڈ', contracts: 'میرے معاہدے', favorites: 'پسندیدہ', settings: 'ترتیبات',
    displayLanguage: 'ڈسپلے زبان', theme: 'شکل', darkMode: 'ڈارک', lightMode: 'لائٹ',
    translationNote: 'اس زبان میں مکمل ترجمہ جلد آ رہا ہے — فی الحال صفحات انگریزی یا عربی میں ہی رہیں گے۔',
    signedInAs: 'بطور سائن ان', notSignedIn: 'سائن ان نہیں',
  },
  zh: {
    menu: '菜单', whitepaper: '白皮书 📄', hotel: '酒店', invest: '投资', tokenized: '代币化',
    abroad: '海外', offplan: '期房', partners: '合作伙伴', sell: '出售房产', help: '帮助',
    dashboard: '仪表盘', contracts: '我的合同', favorites: '收藏', settings: '设置',
    displayLanguage: '显示语言', theme: '外观', darkMode: '深色', lightMode: '浅色',
    translationNote: '该语言的完整应用翻译即将推出——目前页面仍以英文或阿拉伯文显示。',
    signedInAs: '已登录为', notSignedIn: '未登录',
  },
};
