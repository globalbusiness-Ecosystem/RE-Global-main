import type { NavLanguage } from './nav-i18n';

export interface MyDataStrings {
  title: string;
  intro: string;
  download: string;
  working: string;
  erase: string;
  eraseInfo: string;
  typeWord: string;
  confirmErase: string;
  cancel: string;
  erased: string;
  failed: string;
  tooMany: string;
  signIn: string;
}

export const MY_DATA_I18N: Record<NavLanguage, MyDataStrings> = {
  en: {
    title: 'My data and privacy',
    intro: 'Download everything we hold about you, or delete your personal data.',
    download: 'Download my data',
    working: 'Please wait...',
    erase: 'Delete my personal data',
    eraseInfo: 'This deletes your profile, verified email, preferences, favorites and referral code. Payments, contracts, ownerships and payouts are kept as legal and accounting records. This cannot be undone.',
    typeWord: 'Type DELETE to confirm',
    confirmErase: 'Delete now',
    cancel: 'Cancel',
    erased: 'Your personal data was deleted.',
    failed: 'Something went wrong. Please try again.',
    tooMany: 'Too many attempts. Please try again later.',
    signIn: 'Sign in with Pi to manage your data.',
  },
  ar: {
    title: 'بياناتي وخصوصيتي',
    intro: 'نزّل كل البيانات اللي عندنا عنك، أو احذف بياناتك الشخصية.',
    download: 'تنزيل بياناتي',
    working: 'استنى لحظة...',
    erase: 'حذف بياناتي الشخصية',
    eraseInfo: 'ده بيحذف ملفك الشخصي وإيميلك الموثّق وتفضيلاتك ومفضلتك وكود الإحالة. المدفوعات والعقود والملكيات والمستحقات بتفضل محفوظة كسجلات قانونية ومحاسبية. ومينفعش التراجع.',
    typeWord: 'اكتب DELETE للتأكيد',
    confirmErase: 'احذف الآن',
    cancel: 'إلغاء',
    erased: 'تم حذف بياناتك الشخصية.',
    failed: 'حصل خطأ. حاول تاني.',
    tooMany: 'محاولات كتير. حاول لاحقاً.',
    signIn: 'سجّل الدخول بـ Pi لإدارة بياناتك.',
  },
  fr: {
    title: 'Mes données et ma vie privée',
    intro: 'Téléchargez toutes les données que nous détenons sur vous, ou supprimez vos données personnelles.',
    download: 'Télécharger mes données',
    working: 'Veuillez patienter...',
    erase: 'Supprimer mes données personnelles',
    eraseInfo: 'Cela supprime votre profil, votre e-mail vérifié, vos préférences, vos favoris et votre code de parrainage. Les paiements, contrats, titres de propriété et versements sont conservés comme documents légaux et comptables. Action irréversible.',
    typeWord: 'Tapez DELETE pour confirmer',
    confirmErase: 'Supprimer maintenant',
    cancel: 'Annuler',
    erased: 'Vos données personnelles ont été supprimées.',
    failed: "Une erreur s'est produite. Veuillez réessayer.",
    tooMany: 'Trop de tentatives. Réessayez plus tard.',
    signIn: 'Connectez-vous avec Pi pour gérer vos données.',
  },
  es: {
    title: 'Mis datos y privacidad',
    intro: 'Descarga todo lo que tenemos sobre ti, o elimina tus datos personales.',
    download: 'Descargar mis datos',
    working: 'Espera un momento...',
    erase: 'Eliminar mis datos personales',
    eraseInfo: 'Esto elimina tu perfil, correo verificado, preferencias, favoritos y código de referido. Los pagos, contratos, propiedades y pagos pendientes se conservan como registros legales y contables. No se puede deshacer.',
    typeWord: 'Escribe DELETE para confirmar',
    confirmErase: 'Eliminar ahora',
    cancel: 'Cancelar',
    erased: 'Tus datos personales fueron eliminados.',
    failed: 'Algo salió mal. Inténtalo de nuevo.',
    tooMany: 'Demasiados intentos. Inténtalo más tarde.',
    signIn: 'Inicia sesión con Pi para gestionar tus datos.',
  },
  pt: {
    title: 'Meus dados e privacidade',
    intro: 'Baixe tudo o que temos sobre você, ou exclua seus dados pessoais.',
    download: 'Baixar meus dados',
    working: 'Aguarde...',
    erase: 'Excluir meus dados pessoais',
    eraseInfo: 'Isto exclui seu perfil, e-mail verificado, preferências, favoritos e código de indicação. Pagamentos, contratos, propriedades e repasses são mantidos como registros legais e contábeis. Não pode ser desfeito.',
    typeWord: 'Digite DELETE para confirmar',
    confirmErase: 'Excluir agora',
    cancel: 'Cancelar',
    erased: 'Seus dados pessoais foram excluídos.',
    failed: 'Algo deu errado. Tente novamente.',
    tooMany: 'Muitas tentativas. Tente mais tarde.',
    signIn: 'Entre com Pi para gerenciar seus dados.',
  },
  ur: {
    title: 'میرا ڈیٹا اور پرائیویسی',
    intro: 'ہمارے پاس آپ کا جو بھی ڈیٹا ہے وہ ڈاؤن لوڈ کریں، یا اپنا ذاتی ڈیٹا حذف کریں۔',
    download: 'میرا ڈیٹا ڈاؤن لوڈ کریں',
    working: 'براہ کرم انتظار کریں...',
    erase: 'میرا ذاتی ڈیٹا حذف کریں',
    eraseInfo: 'اس سے آپ کا پروفائل، تصدیق شدہ ای میل، ترجیحات، پسندیدہ اور ریفرل کوڈ حذف ہو جائے گا۔ ادائیگیاں، معاہدے، ملکیتیں اور واجبات قانونی و حسابی ریکارڈ کے طور پر محفوظ رہتے ہیں۔ یہ عمل واپس نہیں ہو سکتا۔',
    typeWord: 'تصدیق کے لیے DELETE لکھیں',
    confirmErase: 'ابھی حذف کریں',
    cancel: 'منسوخ کریں',
    erased: 'آپ کا ذاتی ڈیٹا حذف کر دیا گیا۔',
    failed: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔',
    tooMany: 'بہت زیادہ کوششیں۔ بعد میں کوشش کریں۔',
    signIn: 'اپنا ڈیٹا منظم کرنے کے لیے Pi سے سائن اِن کریں۔',
  },
  zh: {
    title: '我的数据与隐私',
    intro: '下载我们持有的关于您的全部数据，或删除您的个人数据。',
    download: '下载我的数据',
    working: '请稍候...',
    erase: '删除我的个人数据',
    eraseInfo: '这将删除您的个人资料、已验证的邮箱、偏好设置、收藏和推荐码。付款、合同、产权和待付款项将作为法律和会计记录保留。此操作无法撤销。',
    typeWord: '输入 DELETE 以确认',
    confirmErase: '立即删除',
    cancel: '取消',
    erased: '您的个人数据已删除。',
    failed: '出错了，请重试。',
    tooMany: '尝试次数过多，请稍后再试。',
    signIn: '请使用 Pi 登录以管理您的数据。',
  },
};
