import type { NavLanguage } from './nav-i18n';

// Texts of the sign-in page used outside the Pi Browser, in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const LOGIN_LABELS = {
  title: { en: 'Sign in', ar: 'تسجيل الدخول', fr: 'Connexion', es: 'Iniciar sesión', pt: 'Entrar', ur: 'سائن اِن کریں', zh: '登录' },
  intro: { en: 'Use your Google account or your e-mail. Inside the Pi Browser you are signed in automatically.', ar: 'استخدم حساب Google أو بريدك الإلكتروني. داخل متصفح Pi يتم تسجيل دخولك تلقائيًا.', fr: 'Utilisez votre compte Google ou votre e-mail. Dans le navigateur Pi, la connexion est automatique.', es: 'Usa tu cuenta de Google o tu correo. En el navegador Pi inicias sesión automáticamente.', pt: 'Use a sua conta Google ou o seu e-mail. No navegador Pi a sessão é iniciada automaticamente.', ur: 'اپنا Google اکاؤنٹ یا ای میل استعمال کریں۔ Pi براؤزر میں سائن اِن خودکار ہوتا ہے۔', zh: '使用 Google 账号或电子邮箱登录。在 Pi 浏览器中会自动登录。' },
  google: { en: 'Continue with Google', ar: 'المتابعة عبر Google', fr: 'Continuer avec Google', es: 'Continuar con Google', pt: 'Continuar com Google', ur: 'Google کے ساتھ جاری رکھیں', zh: '使用 Google 继续' },
  or: { en: 'or', ar: 'أو', fr: 'ou', es: 'o', pt: 'ou', ur: 'یا', zh: '或' },
  emailLabel: { en: 'E-mail', ar: 'البريد الإلكتروني', fr: 'E-mail', es: 'Correo electrónico', pt: 'E-mail', ur: 'ای میل', zh: '电子邮箱' },
  sendLink: { en: 'Send me a sign-in link', ar: 'أرسل لي رابط الدخول', fr: 'Envoyer un lien de connexion', es: 'Enviarme un enlace de acceso', pt: 'Enviar link de acesso', ur: 'مجھے سائن اِن لنک بھیجیں', zh: '发送登录链接' },
  linkSent: { en: 'We sent a link to {email}. Open it on this device to finish.', ar: 'أرسلنا رابطًا إلى {email}. افتحه على هذا الجهاز لإكمال الدخول.', fr: 'Lien envoyé à {email}. Ouvrez-le sur cet appareil pour terminer.', es: 'Enviamos un enlace a {email}. Ábrelo en este dispositivo para terminar.', pt: 'Enviámos um link para {email}. Abra-o neste dispositivo para concluir.', ur: '{email} پر لنک بھیج دیا گیا ہے۔ مکمل کرنے کے لیے اسے اسی ڈیوائس پر کھولیں۔', zh: '我们已向 {email} 发送链接。请在此设备上打开以完成登录。' },
  confirmEmail: { en: 'Confirm your e-mail to finish signing in.', ar: 'أكّد بريدك الإلكتروني لإكمال تسجيل الدخول.', fr: 'Confirmez votre e-mail pour terminer la connexion.', es: 'Confirma tu correo para terminar de iniciar sesión.', pt: 'Confirme o seu e-mail para concluir a entrada.', ur: 'سائن اِن مکمل کرنے کے لیے اپنی ای میل کی تصدیق کریں۔', zh: '请确认您的邮箱以完成登录。' },
  confirm: { en: 'Confirm', ar: 'تأكيد', fr: 'Confirmer', es: 'Confirmar', pt: 'Confirmar', ur: 'تصدیق کریں', zh: '确认' },
  invalidEmail: { en: 'Please enter a valid e-mail.', ar: 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.', fr: 'Saisissez un e-mail valide.', es: 'Introduce un correo válido.', pt: 'Introduza um e-mail válido.', ur: 'براہ کرم درست ای میل درج کریں۔', zh: '请输入有效的邮箱。' },
  failed: { en: 'Sign-in did not work. Please try again.', ar: 'تعذّر تسجيل الدخول. حاول مرة أخرى.', fr: 'La connexion a échoué. Réessayez.', es: 'No se pudo iniciar sesión. Inténtalo de nuevo.', pt: 'Não foi possível entrar. Tente novamente.', ur: 'سائن اِن نہیں ہو سکا۔ دوبارہ کوشش کریں۔', zh: '登录失败，请重试。' },
  signedInAs: { en: 'Signed in as {email}', ar: 'تم الدخول بحساب {email}', fr: 'Connecté en tant que {email}', es: 'Sesión iniciada como {email}', pt: 'Sessão iniciada como {email}', ur: '{email} کے طور پر سائن اِن', zh: '已登录：{email}' },
  signOut: { en: 'Sign out', ar: 'تسجيل الخروج', fr: 'Se déconnecter', es: 'Cerrar sesión', pt: 'Sair', ur: 'سائن آؤٹ', zh: '退出登录' },
  home: { en: 'Back to the platform', ar: 'العودة إلى المنصة', fr: 'Retour à la plateforme', es: 'Volver a la plataforma', pt: 'Voltar à plataforma', ur: 'پلیٹ فارم پر واپس', zh: '返回平台' },
  inPi: { en: 'You are in the Pi Browser, so you are already signed in with Pi.', ar: 'أنت داخل متصفح Pi، لذلك دخولك يتم عبر Pi تلقائيًا.', fr: 'Vous êtes dans le navigateur Pi : la connexion se fait déjà avec Pi.', es: 'Estás en el navegador Pi: ya inicias sesión con Pi.', pt: 'Está no navegador Pi: a sessão já é feita com o Pi.', ur: 'آپ Pi براؤزر میں ہیں، اس لیے Pi کے ساتھ سائن اِن خودکار ہے۔', zh: '您正在使用 Pi 浏览器，已通过 Pi 自动登录。' },
} satisfies Record<string, Row>;

export type LoginLabelKey = keyof typeof LOGIN_LABELS;

export function ll(key: LoginLabelKey, language: string | undefined, vars: Record<string, string> = {}): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  let s = (LOGIN_LABELS[key] as Row)[known];
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}
