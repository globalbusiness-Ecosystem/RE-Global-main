import type { NavLanguage } from './nav-i18n';

type Row = Record<NavLanguage, string>;
const r = (en: string, ar: string, fr: string, es: string, pt: string, ur: string, zh: string): Row => ({ en, ar, fr, es, pt, ur, zh });

export const PASSKEY_TEXT = {
  title: r('Fingerprint / Face ID', 'البصمة / Face ID', 'Empreinte / Face ID', 'Huella / Face ID', 'Digital / Face ID', 'فنگر پرنٹ / Face ID', '指纹 / Face ID'),
  intro: r('Use your phone or computer’s fingerprint, face or screen lock to confirm it is really you. Your biometrics never leave your device.', 'استخدم بصمة موبايلك أو الكمبيوتر أو الوجه أو قفل الشاشة عشان تأكد إنك أنت. بياناتك البيومترية مبتسيبش جهازك.', 'Utilisez l’empreinte, le visage ou le verrouillage de votre appareil pour confirmer votre identité. Vos données biométriques ne quittent jamais l’appareil.', 'Usa la huella, el rostro o el bloqueo de pantalla de tu dispositivo para confirmar que eres tú. Tus datos biométricos nunca salen del dispositivo.', 'Use a digital, o rosto ou o bloqueio de tela do aparelho para confirmar que é você. Seus dados biométricos nunca saem do dispositivo.', 'اپنی شناخت کی تصدیق کے لیے ڈیوائس کی فنگر پرنٹ، چہرہ یا اسکرین لاک استعمال کریں۔ آپ کا بایومیٹرک ڈیٹا ڈیوائس سے باہر نہیں جاتا۔', '使用设备的指纹、面容或屏幕锁来确认是您本人。生物特征数据不会离开您的设备。'),
  add: r('Add this device', 'إضافة الجهاز ده', 'Ajouter cet appareil', 'Añadir este dispositivo', 'Adicionar este dispositivo', 'یہ ڈیوائس شامل کریں', '添加此设备'),
  adding: r('Waiting for your device…', 'في انتظار جهازك…', 'En attente de votre appareil…', 'Esperando tu dispositivo…', 'Aguardando seu dispositivo…', 'آپ کی ڈیوائس کا انتظار…', '等待您的设备…'),
  labelPh: r('Device name (optional)', 'اسم الجهاز (اختياري)', 'Nom de l’appareil (facultatif)', 'Nombre del dispositivo (opcional)', 'Nome do dispositivo (opcional)', 'ڈیوائس کا نام (اختیاری)', '设备名称（可选）'),
  none: r('No device added yet.', 'لسه مفيش جهاز مضاف.', 'Aucun appareil ajouté.', 'Aún no hay dispositivos.', 'Nenhum dispositivo ainda.', 'ابھی کوئی ڈیوائس نہیں۔', '尚未添加设备。'),
  added: r('Added', 'اتضاف', 'Ajouté', 'Añadido', 'Adicionado', 'شامل ہوا', '添加于'),
  lastUsed: r('Last used', 'آخر استخدام', 'Dernière utilisation', 'Último uso', 'Último uso', 'آخری استعمال', '最近使用'),
  never: r('never', 'لسه', 'jamais', 'nunca', 'nunca', 'کبھی نہیں', '从未'),
  synced: r('Synced across your devices', 'متزامنة بين أجهزتك', 'Synchronisée entre vos appareils', 'Sincronizada entre tus dispositivos', 'Sincronizada entre seus dispositivos', 'آپ کی ڈیوائسز میں ہم آہنگ', '已在您的设备间同步'),
  remove: r('Remove', 'إزالة', 'Retirer', 'Quitar', 'Remover', 'ہٹائیں', '移除'),
  removeConfirm: r('Remove this device?', 'إزالة الجهاز ده؟', 'Retirer cet appareil ?', '¿Quitar este dispositivo?', 'Remover este dispositivo?', 'کیا یہ ڈیوائس ہٹائیں؟', '移除此设备？'),
  okAdded: r('Device added.', 'تم إضافة الجهاز.', 'Appareil ajouté.', 'Dispositivo añadido.', 'Dispositivo adicionado.', 'ڈیوائس شامل ہو گئی۔', '设备已添加。'),
  cancelled: r('Cancelled. Nothing was added.', 'اتلغى. مفيش حاجة اتضافت.', 'Annulé. Rien n’a été ajouté.', 'Cancelado. No se añadió nada.', 'Cancelado. Nada foi adicionado.', 'منسوخ۔ کچھ شامل نہیں ہوا۔', '已取消，未添加任何内容。'),
  e_duplicate: r('This device is already added.', 'الجهاز ده مضاف بالفعل.', 'Cet appareil est déjà ajouté.', 'Este dispositivo ya está añadido.', 'Este dispositivo já foi adicionado.', 'یہ ڈیوائس پہلے ہی شامل ہے۔', '此设备已添加。'),
  e_limit: r('You reached the maximum number of devices. Remove one first.', 'وصلت للحد الأقصى من الأجهزة. شيل جهاز الأول.', 'Nombre maximal d’appareils atteint. Retirez-en un.', 'Máximo de dispositivos alcanzado. Quita uno.', 'Máximo de dispositivos atingido. Remova um.', 'ڈیوائسز کی حد پوری ہو گئی۔ پہلے ایک ہٹائیں۔', '已达设备数量上限，请先移除一个。'),
  e_origin: r('This site address is not set up for fingerprint sign-in.', 'عنوان الموقع ده مش متظبط للبصمة.', 'Cette adresse n’est pas configurée pour l’empreinte.', 'Esta dirección no está configurada para huella.', 'Este endereço não está configurado para digital.', 'یہ سائٹ ایڈریس فنگر پرنٹ کے لیے سیٹ نہیں۔', '此网站地址未启用指纹登录。'),
  e_generic: r('Something went wrong. Please try again.', 'حصل خطأ. حاول مرة أخرى.', 'Une erreur est survenue. Réessayez.', 'Algo salió mal. Inténtalo de nuevo.', 'Algo deu errado. Tente novamente.', 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔', '出错了，请重试。'),
  scanIdle: r('Tap to scan your fingerprint', 'اضغط لمسح بصمتك', 'Touchez pour scanner votre empreinte', 'Toca para escanear tu huella', 'Toque para escanear sua digital', 'اپنی فنگر پرنٹ اسکین کرنے کے لیے ٹیپ کریں', '点击扫描指纹'),
  scanIdleMore: r('Tap to add another device', 'اضغط لإضافة جهاز تاني', 'Touchez pour ajouter un autre appareil', 'Toca para añadir otro dispositivo', 'Toque para adicionar outro dispositivo', 'دوسری ڈیوائس شامل کرنے کے لیے ٹیپ کریں', '点击添加另一台设备'),
  scanning: r('Scanning… confirm on your device', 'جارٍ المسح… أكّد على جهازك', 'Scan en cours… confirmez sur votre appareil', 'Escaneando… confirma en tu dispositivo', 'Escaneando… confirme no seu dispositivo', 'اسکین ہو رہا ہے… اپنی ڈیوائس پر تصدیق کریں', '扫描中…请在设备上确认'),
  scanOk: r('Fingerprint enabled on this device', 'تم تفعيل البصمة على الجهاز ده', 'Empreinte activée sur cet appareil', 'Huella activada en este dispositivo', 'Digital ativada neste dispositivo', 'اس ڈیوائس پر فنگر پرنٹ فعال ہو گئی', '此设备已启用指纹'),
  scanFail: r('Scan failed. Tap to try again.', 'فشل المسح. اضغط وحاول تاني.', 'Échec du scan. Touchez pour réessayer.', 'Falló el escaneo. Toca para reintentar.', 'Falha no escaneamento. Toque para tentar de novo.', 'اسکین ناکام۔ دوبارہ کوشش کے لیے ٹیپ کریں۔', '扫描失败，点击重试'),
  thisDevice: r('Your devices', 'أجهزتك', 'Vos appareils', 'Tus dispositivos', 'Seus dispositivos', 'آپ کی ڈیوائسز', '您的设备'),
  // Admin sign-in, confirmation of sensitive actions and fast sign-in (the next steps use these)
  confirmTitle: r('Confirm with your fingerprint', 'أكّد ببصمتك', 'Confirmez avec votre empreinte', 'Confirma con tu huella', 'Confirme com sua digital', 'اپنی فنگر پرنٹ سے تصدیق کریں', '用指纹确认'),
  confirmBody: r('This action needs you to confirm it is you.', 'العملية دي محتاجة تأكيد إنك أنت.', 'Cette action demande de confirmer votre identité.', 'Esta acción requiere confirmar tu identidad.', 'Esta ação exige confirmar sua identidade.', 'اس عمل کے لیے آپ کی تصدیق ضروری ہے۔', '此操作需要确认是您本人。'),
  confirmBtn: r('Confirm', 'تأكيد', 'Confirmer', 'Confirmar', 'Confirmar', 'تصدیق کریں', '确认'),
  loginWith: r('Sign in with fingerprint', 'الدخول بالبصمة', 'Se connecter avec l’empreinte', 'Entrar con huella', 'Entrar com digital', 'فنگر پرنٹ سے لاگ ان', '用指纹登录'),
} satisfies Record<string, Row>;

export type PasskeyTextKey = keyof typeof PASSKEY_TEXT;
export const pk = (key: PasskeyTextKey, language: string): string => {
  const row = PASSKEY_TEXT[key] as Row;
  return row[language as NavLanguage] ?? row.en;
};

export const passkeyErrorKey = (code: unknown): PasskeyTextKey => (code === 'duplicate' ? 'e_duplicate' : code === 'limit' ? 'e_limit' : code === 'origin' ? 'e_origin' : 'e_generic');
