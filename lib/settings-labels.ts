import type { NavLanguage } from './nav-i18n';

// Labels on the Settings page that used to exist in Arabic and English only. Same text in all 7 languages.
type Row = Record<NavLanguage, string>;

export const SETTINGS_LABELS = {
  tabProfile: { en: 'Profile', ar: 'الملف الشخصي', fr: 'Profil', es: 'Perfil', pt: 'Perfil', ur: 'پروفائل', zh: '资料' },
  tabRewards: { en: 'Rewards', ar: 'المكافآت', fr: 'Récompenses', es: 'Recompensas', pt: 'Recompensas', ur: 'انعامات', zh: '奖励' },
  tabSecurity: { en: 'Security', ar: 'الأمان', fr: 'Sécurité', es: 'Seguridad', pt: 'Segurança', ur: 'سیکیورٹی', zh: '安全' },
  tabNotifications: { en: 'Notifications', ar: 'الإشعارات', fr: 'Notifications', es: 'Notificaciones', pt: 'Notificações', ur: 'اطلاعات', zh: '通知' },
  secBasic: { en: 'Basic', ar: 'أساسي', fr: 'Basique', es: 'Básico', pt: 'Básico', ur: 'بنیادی', zh: '基础' },
  secGood: { en: 'Good', ar: 'جيد', fr: 'Bon', es: 'Bueno', pt: 'Bom', ur: 'اچھا', zh: '良好' },
  secExcellent: { en: 'Excellent', ar: 'ممتاز', fr: 'Excellent', es: 'Excelente', pt: 'Excelente', ur: 'بہترین', zh: '优秀' },
  guest: { en: 'Guest', ar: 'زائر', fr: 'Invité', es: 'Invitado', pt: 'Convidado', ur: 'مہمان', zh: '访客' },
  connectedPi: { en: 'Connected via Pi Network', ar: 'متصل عبر Pi Network', fr: 'Connecté via Pi Network', es: 'Conectado mediante Pi Network', pt: 'Conectado via Pi Network', ur: 'Pi Network کے ذریعے منسلک', zh: '已通过 Pi Network 连接' },
  notConnected: { en: 'Not connected', ar: 'غير متصل', fr: 'Non connecté', es: 'No conectado', pt: 'Não conectado', ur: 'منسلک نہیں', zh: '未连接' },
  securityLevel: { en: 'Account security: ', ar: 'مستوى أمان الحساب: ', fr: 'Sécurité du compte : ', es: 'Seguridad de la cuenta: ', pt: 'Segurança da conta: ', ur: 'اکاؤنٹ کی سیکیورٹی: ', zh: '账户安全：' },
  referralCode: { en: 'Referral Code', ar: 'كود الإحالة', fr: 'Code de parrainage', es: 'Código de referido', pt: 'Código de indicação', ur: 'ریفرل کوڈ', zh: '推荐码' },
  copied: { en: 'Copied', ar: 'تم النسخ', fr: 'Copié', es: 'Copiado', pt: 'Copiado', ur: 'کاپی ہو گیا', zh: '已复制' },
  copy: { en: 'Copy', ar: 'نسخ', fr: 'Copier', es: 'Copiar', pt: 'Copiar', ur: 'کاپی', zh: '复制' },
  referralCount: { en: 'People who used your code: {n}', ar: 'عدد الأشخاص الذين استخدموا كودك: {n}', fr: 'Personnes ayant utilisé votre code : {n}', es: 'Personas que usaron tu código: {n}', pt: 'Pessoas que usaram seu código: {n}', ur: 'آپ کا کوڈ استعمال کرنے والے: {n}', zh: '使用你的推荐码的人数：{n}' },
  username: { en: 'Username', ar: 'اسم المستخدم', fr: 'Nom d\'utilisateur', es: 'Usuario', pt: 'Usuário', ur: 'صارف نام', zh: '用户名' },
  verification: { en: 'Verification', ar: 'حالة التحقق', fr: 'Vérification', es: 'Verificación', pt: 'Verificação', ur: 'تصدیق', zh: '验证' },
  unverified: { en: 'Unverified', ar: 'غير موثّق', fr: 'Non vérifié', es: 'Sin verificar', pt: 'Não verificado', ur: 'غیر تصدیق شدہ', zh: '未验证' },
  fullyVerified: { en: 'Fully verified', ar: 'موثّق بالكامل', fr: 'Entièrement vérifié', es: 'Totalmente verificado', pt: 'Totalmente verificado', ur: 'مکمل تصدیق شدہ', zh: '已完全验证' },
  verifiedPi: { en: 'Verified via Pi', ar: 'موثّق عبر Pi', fr: 'Vérifié via Pi', es: 'Verificado con Pi', pt: 'Verificado via Pi', ur: 'Pi کے ذریعے تصدیق شدہ', zh: '已通过 Pi 验证' },
  community: { en: 'Community', ar: 'المجتمع', fr: 'Communauté', es: 'Comunidad', pt: 'Comunidade', ur: 'کمیونٹی', zh: '社区' },
  dataPrivacy: { en: 'Data & Privacy', ar: 'البيانات والخصوصية', fr: 'Données et confidentialité', es: 'Datos y privacidad', pt: 'Dados e privacidade', ur: 'ڈیٹا اور رازداری', zh: '数据与隐私' },
  privacyPolicy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية', fr: 'Politique de confidentialité', es: 'Política de privacidad', pt: 'Política de privacidade', ur: 'رازداری کی پالیسی', zh: '隐私政策' },
  accountStatus: { en: 'Account Status', ar: 'حالة الحساب', fr: 'État du compte', es: 'Estado de la cuenta', pt: 'Status da conta', ur: 'اکاؤنٹ کی حیثیت', zh: '账户状态' },
  piVerification: { en: 'Pi Network Verification', ar: 'التحقق عبر Pi Network', fr: 'Vérification Pi Network', es: 'Verificación de Pi Network', pt: 'Verificação Pi Network', ur: 'Pi Network تصدیق', zh: 'Pi Network 验证' },
  active: { en: 'Active', ar: 'مفعّل', fr: 'Actif', es: 'Activo', pt: 'Ativo', ur: 'فعال', zh: '已启用' },
  emailVerification: { en: 'Email verification', ar: 'توثيق البريد الإلكتروني', fr: 'Vérification de l\'e-mail', es: 'Verificación del correo', pt: 'Verificação do e-mail', ur: 'ای میل کی تصدیق', zh: '邮箱验证' },
  verified: { en: 'Verified', ar: 'موثّق', fr: 'Vérifié', es: 'Verificado', pt: 'Verificado', ur: 'تصدیق شدہ', zh: '已验证' },
  notVerified: { en: 'Not verified', ar: 'غير موثّق', fr: 'Non vérifié', es: 'No verificado', pt: 'Não verificado', ur: 'تصدیق نہیں ہوئی', zh: '未验证' },
  verifyEmailHint: { en: '+ Verify your email in your profile to raise your security level', ar: '+ وثّق بريدك الإلكتروني في الملف الشخصي لرفع مستوى الأمان', fr: '+ Vérifiez votre e-mail dans votre profil pour renforcer votre sécurité', es: '+ Verifica tu correo en tu perfil para subir tu nivel de seguridad', pt: '+ Verifique seu e-mail no perfil para aumentar sua segurança', ur: '+ سیکیورٹی بڑھانے کے لیے اپنے پروفائل میں ای میل تصدیق کریں', zh: '+ 在资料中验证邮箱以提高安全等级' },
  priceAlerts: { en: 'Price alerts', ar: 'تنبيهات الأسعار', fr: 'Alertes de prix', es: 'Alertas de precio', pt: 'Alertas de preço', ur: 'قیمت کے الرٹس', zh: '价格提醒' },
  newListings: { en: 'New listings', ar: 'عقارات جديدة', fr: 'Nouvelles annonces', es: 'Nuevos anuncios', pt: 'Novos anúncios', ur: 'نئی لسٹنگز', zh: '新房源' },
  contractUpdates: { en: 'Contract updates', ar: 'تحديثات العقود', fr: 'Mises à jour des contrats', es: 'Actualizaciones de contratos', pt: 'Atualizações de contratos', ur: 'معاہدوں کی اپ ڈیٹس', zh: '合同更新' },
} satisfies Record<string, Row>;

export type SettingsLabelKey = keyof typeof SETTINGS_LABELS;

/** The label in the user's language, falling back to English. {n} is replaced when a number is given. */
export function sl(key: SettingsLabelKey, language: NavLanguage, n?: number): string {
  const row = SETTINGS_LABELS[key] as Row;
  const text = row[language] ?? row.en;
  return n === undefined ? text : text.replace('{n}', String(n));
}
