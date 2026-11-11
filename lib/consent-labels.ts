import type { NavLanguage } from './nav-i18n';

// Texts of the first-visit "Before you continue" window (components/terms-consent-modal.tsx), in all 7 languages.
// Only the window is translated: the Privacy Policy and Terms pages themselves are legal texts and stay in English,
// which is what docsNote tells the reader in the other languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const CONSENT_LABELS = {
  title: { en: 'Before you continue', ar: 'قبل أن تتابع', fr: 'Avant de continuer', es: 'Antes de continuar', pt: 'Antes de continuar', ur: 'آگے بڑھنے سے پہلے', zh: '继续之前' },
  intro: { en: 'Please review our Privacy Policy and Terms of Service before using RE.', ar: 'من فضلك راجع سياسة الخصوصية وشروط الخدمة قبل استخدام RE.', fr: 'Veuillez consulter notre Politique de confidentialité et nos Conditions d’utilisation avant d’utiliser RE.', es: 'Revisa nuestra Política de privacidad y los Términos de servicio antes de usar RE.', pt: 'Leia a nossa Política de Privacidade e os Termos de Serviço antes de usar o RE.', ur: 'RE استعمال کرنے سے پہلے براہ کرم ہماری رازداری کی پالیسی اور سروس کی شرائط دیکھ لیں۔', zh: '使用 RE 之前，请先查看我们的隐私政策和服务条款。' },
  privacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية', fr: 'Politique de confidentialité', es: 'Política de privacidad', pt: 'Política de Privacidade', ur: 'رازداری کی پالیسی', zh: '隐私政策' },
  terms: { en: 'Terms of Service', ar: 'شروط الخدمة', fr: 'Conditions d’utilisation', es: 'Términos de servicio', pt: 'Termos de Serviço', ur: 'سروس کی شرائط', zh: '服务条款' },
  docsNote: { en: 'The full documents are available in English.', ar: 'النصوص الكاملة متاحة بالإنجليزية.', fr: 'Les documents complets sont disponibles en anglais.', es: 'Los documentos completos están disponibles en inglés.', pt: 'Os documentos completos estão disponíveis em inglês.', ur: 'مکمل دستاویزات انگریزی میں دستیاب ہیں۔', zh: '完整文件仅提供英文版。' },
  agree: { en: 'I have read and agree to the Privacy Policy and Terms of Service.', ar: 'قرأت سياسة الخصوصية وشروط الخدمة وأوافق عليهما.', fr: 'J’ai lu et j’accepte la Politique de confidentialité et les Conditions d’utilisation.', es: 'He leído y acepto la Política de privacidad y los Términos de servicio.', pt: 'Li e concordo com a Política de Privacidade e os Termos de Serviço.', ur: 'میں نے رازداری کی پالیسی اور سروس کی شرائط پڑھ لی ہیں اور ان سے اتفاق کرتا ہوں۔', zh: '我已阅读并同意隐私政策和服务条款。' },
  accept: { en: 'Accept & Continue', ar: 'موافق ومتابعة', fr: 'Accepter et continuer', es: 'Aceptar y continuar', pt: 'Aceitar e continuar', ur: 'قبول کریں اور جاری رکھیں', zh: '同意并继续' },
} satisfies Record<string, Row>;

type ConsentLabelKey = keyof typeof CONSENT_LABELS;

export function cl(key: ConsentLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (CONSENT_LABELS[key] as Row)[known];
}
