import type { NavLanguage } from './nav-i18n';

// Texts of the home page that were still Arabic/English only: the sell and support cards and the admin PIN window, in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const HOME_LABELS = {
  sellTitle: { en: 'Sell Your Property', ar: 'بيع العقار', fr: 'Vendez votre bien', es: 'Vende tu propiedad', pt: 'Venda seu imóvel', ur: 'اپنی جائیداد بیچیں', zh: '出售您的房产' },
  sellSub: { en: 'List your property on RE Platform', ar: 'ضع قائمة بعقارك على منصة RE', fr: 'Publiez votre bien sur la plateforme RE', es: 'Publica tu propiedad en la plataforma RE', pt: 'Anuncie seu imóvel na plataforma RE', ur: 'اپنی جائیداد RE پلیٹ فارم پر درج کریں', zh: '在 RE 平台上发布您的房产' },
  helpTitle: { en: 'Help & Support', ar: 'المساعدة والدعم', fr: 'Aide et assistance', es: 'Ayuda y soporte', pt: 'Ajuda e suporte', ur: 'مدد اور معاونت', zh: '帮助与支持' },
  helpSub: { en: 'Get help with your account and properties', ar: 'احصل على المساعدة في حسابك والعقارات', fr: 'Obtenez de l’aide pour votre compte et vos biens', es: 'Obtén ayuda con tu cuenta y tus propiedades', pt: 'Receba ajuda com sua conta e seus imóveis', ur: 'اپنے اکاؤنٹ اور جائیدادوں کے لیے مدد حاصل کریں', zh: '获取有关账户和房产的帮助' },
  email: { en: 'Email', ar: 'البريد الإلكتروني', fr: 'E-mail', es: 'Correo electrónico', pt: 'E-mail', ur: 'ای میل', zh: '电子邮件' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب', fr: 'WhatsApp', es: 'WhatsApp', pt: 'WhatsApp', ur: 'واٹس ایپ', zh: 'WhatsApp' },
  pinTooMany: { en: 'Too many attempts. Try again later.', ar: 'محاولات كثيرة. حاول لاحقاً.', fr: 'Trop de tentatives. Réessayez plus tard.', es: 'Demasiados intentos. Inténtalo más tarde.', pt: 'Muitas tentativas. Tente novamente mais tarde.', ur: 'بہت زیادہ کوششیں۔ بعد میں دوبارہ کوشش کریں۔', zh: '尝试次数过多，请稍后再试。' },
  pinNotConfigured: { en: 'Admin access is not configured', ar: 'الوصول الإداري غير مفعّل', fr: 'L’accès administrateur n’est pas configuré', es: 'El acceso de administrador no está configurado', pt: 'O acesso de administrador não está configurado', ur: 'ایڈمن رسائی ترتیب نہیں دی گئی', zh: '未配置管理员访问' },
  pinInvalid: { en: 'Invalid PIN', ar: 'رمز PIN غير صحيح', fr: 'Code PIN invalide', es: 'PIN no válido', pt: 'PIN inválido', ur: 'غلط PIN', zh: 'PIN 码无效' },
  pinConnection: { en: 'Connection error', ar: 'خطأ في الاتصال', fr: 'Erreur de connexion', es: 'Error de conexión', pt: 'Erro de conexão', ur: 'کنکشن میں خرابی', zh: '连接错误' },
  adminAccess: { en: 'Admin Access', ar: 'الوصول الإداري', fr: 'Accès administrateur', es: 'Acceso de administrador', pt: 'Acesso de administrador', ur: 'ایڈمن رسائی', zh: '管理员访问' },
  enterPin: { en: 'Enter PIN code', ar: 'أدخل رمز PIN', fr: 'Saisissez le code PIN', es: 'Introduce el PIN', pt: 'Digite o PIN', ur: 'PIN کوڈ درج کریں', zh: '输入 PIN 码' },
  cancel: { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler', es: 'Cancelar', pt: 'Cancelar', ur: 'منسوخ کریں', zh: '取消' },
  submit: { en: 'Submit', ar: 'إرسال', fr: 'Valider', es: 'Enviar', pt: 'Enviar', ur: 'جمع کرائیں', zh: '提交' },
  accessGranted: { en: 'Access Granted', ar: 'تم منح الوصول', fr: 'Accès accordé', es: 'Acceso concedido', pt: 'Acesso concedido', ur: 'رسائی دے دی گئی', zh: '已授予访问权限' },
  welcomeAdmin: { en: 'Welcome to Admin Panel', ar: 'مرحبا بك في لوحة التحكم', fr: 'Bienvenue dans le panneau d’administration', es: 'Bienvenido al panel de administración', pt: 'Bem-vindo ao painel de administração', ur: 'ایڈمن پینل میں خوش آمدید', zh: '欢迎进入管理面板' },
} satisfies Record<string, Row>;

export type HomeLabelKey = keyof typeof HOME_LABELS;

export function hm(key: HomeLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (HOME_LABELS[key] as Row)[known];
}
