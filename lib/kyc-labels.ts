import type { NavLanguage } from './nav-i18n';

// Identity verification texts (the /kyc page and the card button), in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const KYC_LABELS = {
  title: { en: 'Identity verification', ar: 'التحقق من الهوية', fr: "Vérification d'identité", es: 'Verificación de identidad', pt: 'Verificação de identidade', ur: 'شناخت کی تصدیق', zh: '身份验证' },
  intro: { en: 'To protect everyone from fraud and money laundering, we verify the identity of people who pay by card. Our team reviews your request.', ar: 'لحماية الجميع من الاحتيال وغسل الأموال، نتحقق من هوية من يدفع بالبطاقة. يراجع فريقنا طلبك.', fr: "Pour protéger chacun contre la fraude et le blanchiment d'argent, nous vérifions l'identité des personnes qui paient par carte. Notre équipe examine votre demande.", es: 'Para proteger a todos del fraude y el lavado de dinero, verificamos la identidad de quienes pagan con tarjeta. Nuestro equipo revisa tu solicitud.', pt: 'Para proteger todos contra fraude e branqueamento de capitais, verificamos a identidade de quem paga por cartão. A nossa equipa analisa o seu pedido.', ur: 'سب کو دھوکے اور منی لانڈرنگ سے بچانے کے لیے ہم کارڈ سے ادائیگی کرنے والوں کی شناخت کی تصدیق کرتے ہیں۔ ہماری ٹیم آپ کی درخواست کا جائزہ لے گی۔', zh: '为了保护所有人免受欺诈和洗钱，我们会核实使用银行卡付款者的身份。我们的团队将审核您的申请。' },
  legalName: { en: 'Full legal name (as on your ID)', ar: 'الاسم القانوني الكامل (كما في الهوية)', fr: "Nom légal complet (comme sur votre pièce d'identité)", es: 'Nombre legal completo (como en tu documento)', pt: 'Nome legal completo (como no documento)', ur: 'مکمل قانونی نام (شناختی دستاویز کے مطابق)', zh: '法定全名（与证件一致）' },
  country: { en: 'Country', ar: 'الدولة', fr: 'Pays', es: 'País', pt: 'País', ur: 'ملک', zh: '国家' },
  phone: { en: 'Phone number (with country code)', ar: 'رقم الهاتف (مع مفتاح الدولة)', fr: 'Téléphone (avec indicatif)', es: 'Teléfono (con prefijo del país)', pt: 'Telefone (com indicativo)', ur: 'فون نمبر (ملکی کوڈ کے ساتھ)', zh: '电话号码（含国家区号）' },
  submit: { en: 'Send for review', ar: 'إرسال للمراجعة', fr: 'Envoyer pour examen', es: 'Enviar a revisión', pt: 'Enviar para análise', ur: 'جائزے کے لیے بھیجیں', zh: '提交审核' },
  pending: { en: 'Your request is under review. We will approve it as soon as we finish.', ar: 'طلبك قيد المراجعة. سنوافق عليه فور الانتهاء.', fr: 'Votre demande est en cours d’examen. Nous la validerons dès que possible.', es: 'Tu solicitud está en revisión. La aprobaremos en cuanto terminemos.', pt: 'O seu pedido está em análise. Aprovaremos assim que terminarmos.', ur: 'آپ کی درخواست زیرِ جائزہ ہے۔ جائزہ مکمل ہوتے ہی منظور کر دی جائے گی۔', zh: '您的申请正在审核中，完成后我们会尽快通过。' },
  approved: { en: 'Your identity is verified. You can pay by card.', ar: 'تم التحقق من هويتك. يمكنك الدفع بالبطاقة.', fr: 'Votre identité est vérifiée. Vous pouvez payer par carte.', es: 'Tu identidad está verificada. Puedes pagar con tarjeta.', pt: 'A sua identidade está verificada. Pode pagar por cartão.', ur: 'آپ کی شناخت کی تصدیق ہو گئی ہے۔ اب آپ کارڈ سے ادائیگی کر سکتے ہیں۔', zh: '您的身份已验证，可以使用银行卡付款。' },
  rejected: { en: 'Your request was not approved. Reason: {reason}. You can send a corrected request.', ar: 'لم تتم الموافقة على طلبك. السبب: {reason}. يمكنك إرسال طلب مُصحَّح.', fr: "Votre demande n'a pas été approuvée. Motif : {reason}. Vous pouvez envoyer une demande corrigée.", es: 'Tu solicitud no fue aprobada. Motivo: {reason}. Puedes enviar una solicitud corregida.', pt: 'O seu pedido não foi aprovado. Motivo: {reason}. Pode enviar um pedido corrigido.', ur: 'آپ کی درخواست منظور نہیں ہوئی۔ وجہ: {reason}۔ آپ درست کر کے دوبارہ بھیج سکتے ہیں۔', zh: '您的申请未获通过。原因：{reason}。您可以更正后重新提交。' },
  invalid: { en: 'Please check your details: full name (two words or more), country and a valid phone number.', ar: 'راجع بياناتك: الاسم الكامل (كلمتان على الأقل) والدولة ورقم هاتف صحيح.', fr: 'Vérifiez vos informations : nom complet (deux mots ou plus), pays et numéro valide.', es: 'Revisa tus datos: nombre completo (dos palabras o más), país y teléfono válido.', pt: 'Verifique os dados: nome completo (duas palavras ou mais), país e telefone válido.', ur: 'اپنی تفصیلات چیک کریں: مکمل نام (کم از کم دو الفاظ)، ملک اور درست فون نمبر۔', zh: '请检查信息：全名（至少两个词）、国家和有效的电话号码。' },
  failed: { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ. حاول مرة أخرى.', fr: 'Une erreur est survenue. Réessayez.', es: 'Algo salió mal. Inténtalo de nuevo.', pt: 'Ocorreu um erro. Tente novamente.', ur: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔', zh: '出错了，请重试。' },
  needLogin: { en: 'Please sign in first.', ar: 'سجّل الدخول أولًا.', fr: "Connectez-vous d'abord.", es: 'Inicia sesión primero.', pt: 'Inicie sessão primeiro.', ur: 'پہلے سائن اِن کریں۔', zh: '请先登录。' },
  login: { en: 'Sign in', ar: 'تسجيل الدخول', fr: 'Connexion', es: 'Iniciar sesión', pt: 'Entrar', ur: 'سائن اِن', zh: '登录' },
  notRequired: { en: 'You signed in with Pi, which already verified you. Nothing more is needed.', ar: 'دخلت عبر Pi وتم التحقق منك بالفعل. لا يلزم شيء آخر.', fr: 'Vous êtes connecté avec Pi, qui vous a déjà vérifié. Rien de plus n’est requis.', es: 'Iniciaste sesión con Pi, que ya te verificó. No necesitas nada más.', pt: 'Entrou com o Pi, que já o verificou. Não é preciso mais nada.', ur: 'آپ Pi سے سائن اِن ہیں جو پہلے ہی آپ کی تصدیق کر چکا ہے۔ مزید کچھ درکار نہیں۔', zh: '您通过 Pi 登录，Pi 已验证您的身份，无需其他操作。' },
  required: { en: 'Verify your identity before paying by card.', ar: 'تحقق من هويتك قبل الدفع بالبطاقة.', fr: "Vérifiez votre identité avant de payer par carte.", es: 'Verifica tu identidad antes de pagar con tarjeta.', pt: 'Verifique a sua identidade antes de pagar por cartão.', ur: 'کارڈ سے ادائیگی سے پہلے اپنی شناخت کی تصدیق کریں۔', zh: '使用银行卡付款前请先验证身份。' },
  verifyCta: { en: 'Verify identity', ar: 'تحقق من هويتك', fr: "Vérifier l'identité", es: 'Verificar identidad', pt: 'Verificar identidade', ur: 'شناخت کی تصدیق کریں', zh: '验证身份' },
  home: { en: 'Back to the platform', ar: 'العودة إلى المنصة', fr: 'Retour à la plateforme', es: 'Volver a la plataforma', pt: 'Voltar à plataforma', ur: 'پلیٹ فارم پر واپس', zh: '返回平台' },
} satisfies Record<string, Row>;

export type KycLabelKey = keyof typeof KYC_LABELS;

export function kl(key: KycLabelKey, language: string | undefined, vars: Record<string, string> = {}): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  let s = (KYC_LABELS[key] as Row)[known];
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}
