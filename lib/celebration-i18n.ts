import type { NavLanguage } from './nav-i18n';

interface CelebrationStrings { userTitle: string; userBody: string; founderSub: string; tapSound: string; close: string }
export const CELEBRATION_I18N: Record<NavLanguage, CelebrationStrings> = {
  en: { userTitle: 'Congratulations!', userBody: 'Your identity is verified. Welcome to the verified members of RE Global.', founderSub: 'Founder of RE Global', tapSound: 'Tap to play the sound', close: 'Close' },
  ar: { userTitle: 'مبروك!', userBody: 'اتوثقت هويتك. أهلاً بيك بين الأعضاء الموثّقين في RE Global.', founderSub: 'مؤسس RE Global', tapSound: 'اضغط لتشغيل الصوت', close: 'إغلاق' },
  fr: { userTitle: 'Félicitations !', userBody: 'Votre identité est vérifiée. Bienvenue parmi les membres vérifiés de RE Global.', founderSub: 'Fondateur de RE Global', tapSound: 'Touchez pour activer le son', close: 'Fermer' },
  es: { userTitle: '¡Felicidades!', userBody: 'Tu identidad está verificada. Bienvenido a los miembros verificados de RE Global.', founderSub: 'Fundador de RE Global', tapSound: 'Toca para activar el sonido', close: 'Cerrar' },
  pt: { userTitle: 'Parabéns!', userBody: 'Sua identidade foi verificada. Bem-vindo aos membros verificados da RE Global.', founderSub: 'Fundador da RE Global', tapSound: 'Toque para ativar o som', close: 'Fechar' },
  ur: { userTitle: 'مبارک ہو!', userBody: 'آپ کی شناخت کی تصدیق ہو گئی۔ RE Global کے تصدیق شدہ اراکین میں خوش آمدید۔', founderSub: 'RE Global کے بانی', tapSound: 'آواز چلانے کے لیے ٹیپ کریں', close: 'بند کریں' },
  zh: { userTitle: '恭喜！', userBody: '你的身份已通过验证。欢迎加入 RE Global 的已验证会员。', founderSub: 'RE Global 创始人', tapSound: '点击播放声音', close: '关闭' },
};
export const celebrationStrings = (lang: string): CelebrationStrings => CELEBRATION_I18N[lang as NavLanguage] ?? CELEBRATION_I18N.en;
