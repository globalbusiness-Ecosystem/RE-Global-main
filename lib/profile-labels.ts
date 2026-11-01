import type { NavLanguage } from './nav-i18n';

// Email-verification and location labels on the Profile page, in all 7 languages.
type Row = Record<NavLanguage, string>;

export const PROFILE_LABELS = {
  codeSent: { en: 'Verification code sent to your email', ar: 'تم إرسال كود التحقق لبريدك', fr: 'Code de vérification envoyé à votre e-mail', es: 'Código de verificación enviado a tu correo', pt: 'Código de verificação enviado para o seu e-mail', ur: 'تصدیقی کوڈ آپ کے ای میل پر بھیج دیا گیا', zh: '验证码已发送到你的邮箱' },
  sendFailed: { en: 'Failed to send code', ar: 'فشل إرسال الكود', fr: 'Échec de l\'envoi du code', es: 'No se pudo enviar el código', pt: 'Falha ao enviar o código', ur: 'کوڈ بھیجنے میں ناکامی', zh: '验证码发送失败' },
  connError: { en: 'Connection error', ar: 'خطأ في الاتصال', fr: 'Erreur de connexion', es: 'Error de conexión', pt: 'Erro de conexão', ur: 'کنکشن میں خرابی', zh: '连接错误' },
  emailVerified: { en: 'Email verified', ar: 'تم توثيق بريدك الإلكتروني', fr: 'E-mail vérifié', es: 'Correo verificado', pt: 'E-mail verificado', ur: 'ای میل کی تصدیق ہو گئی', zh: '邮箱已验证' },
  wrongCode: { en: 'Incorrect code', ar: 'كود غير صحيح', fr: 'Code incorrect', es: 'Código incorrecto', pt: 'Código incorreto', ur: 'غلط کوڈ', zh: '验证码错误' },
  verified: { en: 'Verified', ar: 'موثّق', fr: 'Vérifié', es: 'Verificado', pt: 'Verificado', ur: 'تصدیق شدہ', zh: '已验证' },
  sending: { en: 'Sending...', ar: 'جاري الإرسال...', fr: 'Envoi...', es: 'Enviando...', pt: 'Enviando...', ur: 'بھیجا جا رہا ہے...', zh: '发送中...' },
  sendCode: { en: 'Send verification code', ar: 'إرسال كود التحقق', fr: 'Envoyer le code de vérification', es: 'Enviar código de verificación', pt: 'Enviar código de verificação', ur: 'تصدیقی کوڈ بھیجیں', zh: '发送验证码' },
  codePlaceholder: { en: '6-digit code', ar: 'الكود المكوّن من 6 أرقام', fr: 'Code à 6 chiffres', es: 'Código de 6 dígitos', pt: 'Código de 6 dígitos', ur: '6 ہندسوں کا کوڈ', zh: '6 位验证码' },
  verify: { en: 'Verify', ar: 'تأكيد', fr: 'Vérifier', es: 'Verificar', pt: 'Verificar', ur: 'تصدیق کریں', zh: '验证' },
  resend: { en: 'Resend', ar: 'إعادة إرسال', fr: 'Renvoyer', es: 'Reenviar', pt: 'Reenviar', ur: 'دوبارہ بھیجیں', zh: '重新发送' },
  useMyLocation: { en: 'Use my current location', ar: 'استخدم موقعي الحالي', fr: 'Utiliser ma position actuelle', es: 'Usar mi ubicación actual', pt: 'Usar minha localização atual', ur: 'میرا موجودہ مقام استعمال کریں', zh: '使用我的当前位置' },
  currentLocation: { en: 'Current location', ar: 'موقعي الحالي', fr: 'Position actuelle', es: 'Ubicación actual', pt: 'Localização atual', ur: 'موجودہ مقام', zh: '当前位置' },
} satisfies Record<string, Row>;

export type ProfileLabelKey = keyof typeof PROFILE_LABELS;

export function pl(key: ProfileLabelKey, language: string): string {
  const row = PROFILE_LABELS[key] as Row;
  return row[language as NavLanguage] ?? row.en;
}
