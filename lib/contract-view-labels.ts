import type { NavLanguage } from './nav-i18n';
import { CONTRACTS_I18N } from './contracts-i18n';
import type { ContractKind } from './contract-kind';

// Texts of the contract detail card (components/contract-detail-view.tsx), in all 7 languages.
// The downloadable PDF stays in English (its font cannot draw Arabic, Urdu or Chinese); {role} is the buyer/tenant/... word.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const CONTRACT_VIEW_LABELS = {
  contractNo: { en: 'Contract №', ar: 'عقد رقم', fr: 'Contrat n°', es: 'Contrato n.º', pt: 'Contrato n.º', ur: 'معاہدہ نمبر', zh: '合同编号' },
  downloadPdf: { en: 'Download as PDF', ar: 'تحميل PDF', fr: 'Télécharger en PDF', es: 'Descargar en PDF', pt: 'Baixar em PDF', ur: 'PDF ڈاؤن لوڈ کریں', zh: '下载 PDF' },
  type: { en: 'Type', ar: 'النوع', fr: 'Type', es: 'Tipo', pt: 'Tipo', ur: 'قسم', zh: '类型' },
  amount: { en: 'Amount', ar: 'المبلغ', fr: 'Montant', es: 'Importe', pt: 'Valor', ur: 'رقم', zh: '金额' },
  status: { en: 'Status', ar: 'الحالة', fr: 'Statut', es: 'Estado', pt: 'Estado', ur: 'حیثیت', zh: '状态' },
  signatures: { en: 'Signatures', ar: 'التوقيعات', fr: 'Signatures', es: 'Firmas', pt: 'Assinaturas', ur: 'دستخط', zh: '签名' },
  partyA: { en: 'Party A · {role}', ar: 'الطرف الأول · {role}', fr: 'Partie A · {role}', es: 'Parte A · {role}', pt: 'Parte A · {role}', ur: 'فریق اول · {role}', zh: '甲方 · {role}' },
  partyB: { en: 'Party B · RE Global Platform', ar: 'الطرف الثاني · منصة RE Global', fr: 'Partie B · Plateforme RE Global', es: 'Parte B · Plataforma RE Global', pt: 'Parte B · Plataforma RE Global', ur: 'فریق دوم · RE Global پلیٹ فارم', zh: '乙方 · RE Global 平台' },
  verifiedPi: { en: 'Verified via Pi payment', ar: 'تم التحقق عبر دفعة Pi', fr: 'Vérifié via le paiement Pi', es: 'Verificado mediante el pago con Pi', pt: 'Verificado pelo pagamento em Pi', ur: 'Pi ادائیگی کے ذریعے تصدیق شدہ', zh: '已通过 Pi 支付验证' },
  verifiedCard: { en: 'Identity verified · paid by card', ar: 'تم التحقق من الهوية · دفع بالبطاقة', fr: 'Identité vérifiée · payé par carte', es: 'Identidad verificada · pagado con tarjeta', pt: 'Identidade verificada · pago com cartão', ur: 'شناخت کی تصدیق · کارڈ سے ادائیگی', zh: '身份已验证 · 银行卡支付' },
  nameOnRecord: { en: 'Name on record', ar: 'الاسم المسجّل', fr: 'Nom enregistré', es: 'Nombre registrado', pt: 'Nome registado', ur: 'درج شدہ نام', zh: '登记姓名' },
  inviteCode: { en: 'Personal invite code', ar: 'رمز الدعوة الشخصي', fr: "Code d'invitation personnel", es: 'Código de invitación personal', pt: 'Código de convite pessoal', ur: 'ذاتی دعوتی کوڈ', zh: '个人邀请码' },
  paymentId: { en: 'Payment ID', ar: 'رقم الدفعة', fr: 'ID de paiement', es: 'ID de pago', pt: 'ID do pagamento', ur: 'ادائیگی کی شناخت', zh: '支付编号' },
  transactionId: { en: 'Transaction ID', ar: 'رقم المعاملة', fr: 'ID de transaction', es: 'ID de transacción', pt: 'ID da transação', ur: 'ٹرانزیکشن کی شناخت', zh: '交易编号' },
  edSigned: { en: 'Ed25519 signed', ar: 'موقّع بـ Ed25519', fr: 'Signé Ed25519', es: 'Firmado con Ed25519', pt: 'Assinado com Ed25519', ur: 'Ed25519 سے دستخط شدہ', zh: '已用 Ed25519 签名' },
  notSigned: { en: 'Not yet signed', ar: 'لم يُوقَّع بعد', fr: 'Pas encore signé', es: 'Aún sin firmar', pt: 'Ainda não assinado', ur: 'ابھی دستخط نہیں ہوئے', zh: '尚未签名' },
  publicKey: { en: 'Public key', ar: 'المفتاح العام', fr: 'Clé publique', es: 'Clave pública', pt: 'Chave pública', ur: 'عوامی کلید', zh: '公钥' },
  documentHash: { en: 'Document hash', ar: 'بصمة المستند', fr: 'Empreinte du document', es: 'Hash del documento', pt: 'Hash do documento', ur: 'دستاویز کا ہیش', zh: '文档哈希' },
  linkedVerification: { en: 'Linked verification', ar: 'التحقق المرتبط', fr: 'Vérification liée', es: 'Verificación vinculada', pt: 'Verificação vinculada', ur: 'منسلک تصدیق', zh: '关联验证' },
  scanBefore: { en: 'Scan to open the public, no-login record for ', ar: 'امسح الرمز لفتح السجل العام (بدون تسجيل دخول) الخاص بـ ', fr: 'Scannez pour ouvrir le dossier public, sans connexion, de ', es: 'Escanea para abrir el registro público, sin iniciar sesión, de ', pt: 'Digitalize para abrir o registo público, sem login, de ', ur: 'لاگ اِن کے بغیر عوامی ریکارڈ کھولنے کے لیے اسکین کریں: ', zh: '扫码打开无需登录的公开记录：' },
  scanAfter: { en: ' — this contract and its property.', ar: ' — العقد والعقار.', fr: ' — ce contrat et son bien.', es: ' — este contrato y su propiedad.', pt: ' — este contrato e o seu imóvel.', ur: ' — یہ معاہدہ اور اس کی جائیداد۔', zh: '（本合同及其房产）。' },
  certOnRecord: { en: '✓ Linked inspection certificate on record', ar: '✓ شهادة الفحص المرتبطة مسجّلة', fr: '✓ Certificat d’inspection lié enregistré', es: '✓ Certificado de inspección vinculado registrado', pt: '✓ Certificado de inspeção vinculado registado', ur: '✓ منسلک معائنہ سرٹیفکیٹ ریکارڈ پر موجود ہے', zh: '✓ 已记录关联的检验证书' },
  fullText: { en: 'Full contract text', ar: 'نص العقد الكامل', fr: 'Texte complet du contrat', es: 'Texto completo del contrato', pt: 'Texto completo do contrato', ur: 'معاہدے کا مکمل متن', zh: '合同全文' },
  privTitle: { en: 'Your private details', ar: 'بياناتك الخاصة', fr: 'Vos données privées', es: 'Tus datos privados', pt: 'Os seus dados privados', ur: 'آپ کی نجی معلومات', zh: '您的私密信息' },
  privNote: { en: 'Only you can see this. The public contract shows only the last 4 characters of your ID and a fingerprint.', ar: 'أنت فقط من يراها. العقد المنشور يعرض آخر 4 خانات من هويتك وبصمة فقط.', fr: 'Visible par vous seul. Le contrat public ne montre que les 4 derniers caractères de votre pièce et une empreinte.', es: 'Solo tú puedes verlo. El contrato público muestra solo los últimos 4 caracteres de tu documento y una huella.', pt: 'Só você pode ver. O contrato público mostra apenas os últimos 4 caracteres do seu documento e uma impressão digital.', ur: 'صرف آپ دیکھ سکتے ہیں۔ عوامی معاہدے میں آپ کے شناختی نمبر کے آخری 4 حروف اور ایک فنگر پرنٹ ہوتا ہے۔', zh: '仅您本人可见。公开合同只显示证件号后 4 位和一个指纹。' },
  privShow: { en: 'Show my details', ar: 'إظهار بياناتي', fr: 'Afficher mes données', es: 'Mostrar mis datos', pt: 'Mostrar os meus dados', ur: 'میری معلومات دکھائیں', zh: '显示我的信息' },
  privHide: { en: 'Hide', ar: 'إخفاء', fr: 'Masquer', es: 'Ocultar', pt: 'Ocultar', ur: 'چھپائیں', zh: '隐藏' },
  privName: { en: 'Legal name', ar: 'الاسم القانوني', fr: 'Nom légal', es: 'Nombre legal', pt: 'Nome legal', ur: 'قانونی نام', zh: '法定姓名' },
  privId: { en: 'ID number', ar: 'رقم الهوية', fr: 'Numéro de pièce', es: 'Número de documento', pt: 'Número do documento', ur: 'شناختی نمبر', zh: '证件号码' },
  privPhone: { en: 'Phone', ar: 'الهاتف', fr: 'Téléphone', es: 'Teléfono', pt: 'Telefone', ur: 'فون', zh: '电话' },
  privMatch: { en: '✓ Matches the fingerprint signed in the contract', ar: '✓ مطابقة للبصمة الموقّعة داخل العقد', fr: '✓ Correspond à l’empreinte signée dans le contrat', es: '✓ Coincide con la huella firmada en el contrato', pt: '✓ Corresponde à impressão digital assinada no contrato', ur: '✓ معاہدے میں دستخط شدہ فنگر پرنٹ سے مطابقت', zh: '✓ 与合同中签署的指纹一致' },
  privMismatch: { en: 'Does not match the contract fingerprint — contact support', ar: 'لا تطابق بصمة العقد — تواصل مع الدعم', fr: 'Ne correspond pas à l’empreinte du contrat — contactez le support', es: 'No coincide con la huella del contrato — contacta con soporte', pt: 'Não corresponde à impressão digital do contrato — contacte o suporte', ur: 'معاہدے کے فنگر پرنٹ سے مطابقت نہیں — سپورٹ سے رابطہ کریں', zh: '与合同指纹不一致——请联系支持' },
} satisfies Record<string, Row>;

type ContractViewLabelKey = keyof typeof CONTRACT_VIEW_LABELS;

const known = (language: string | undefined): NavLanguage => LANGS.find((l) => l === language) ?? 'en';

export function cv(key: ContractViewLabelKey, language: string | undefined, vars: Record<string, string | number> = {}): string {
  let text = (CONTRACT_VIEW_LABELS[key] as Row)[known(language)];
  for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
}

const KIND_PARTY_LABELS: Record<ContractKind, Row> = {
  sale: { en: 'Buyer', ar: 'المشتري', fr: 'Acheteur', es: 'Comprador', pt: 'Comprador', ur: 'خریدار', zh: '买方' },
  invest: { en: 'Investor', ar: 'المستثمر', fr: 'Investisseur', es: 'Inversor', pt: 'Investidor', ur: 'سرمایہ کار', zh: '投资者' },
  rent: { en: 'Tenant', ar: 'المستأجر', fr: 'Locataire', es: 'Inquilino', pt: 'Inquilino', ur: 'کرایہ دار', zh: '租户' },
  hotel: { en: 'Guest', ar: 'الضيف', fr: 'Client', es: 'Huésped', pt: 'Hóspede', ur: 'مہمان', zh: '住客' },
};

const KIND_TITLE_LABELS: Record<ContractKind, Row> = {
  sale: { en: 'RE Global — Property Sale Contract', ar: 'RE Global — عقد بيع عقار', fr: 'RE Global — Contrat de vente immobilière', es: 'RE Global — Contrato de compraventa de inmueble', pt: 'RE Global — Contrato de compra e venda de imóvel', ur: 'RE Global — جائیداد کی فروخت کا معاہدہ', zh: 'RE Global — 房产买卖合同' },
  invest: { en: 'RE Global — Property Investment Contract', ar: 'RE Global — عقد استثمار عقاري', fr: 'RE Global — Contrat d’investissement immobilier', es: 'RE Global — Contrato de inversión inmobiliaria', pt: 'RE Global — Contrato de investimento imobiliário', ur: 'RE Global — جائیداد میں سرمایہ کاری کا معاہدہ', zh: 'RE Global — 房产投资合同' },
  rent: { en: 'RE Global — Property Rental Contract', ar: 'RE Global — عقد إيجار عقار', fr: 'RE Global — Contrat de location immobilière', es: 'RE Global — Contrato de alquiler de inmueble', pt: 'RE Global — Contrato de arrendamento de imóvel', ur: 'RE Global — جائیداد کے کرائے کا معاہدہ', zh: 'RE Global — 房产租赁合同' },
  hotel: { en: 'RE Global — Hotel Stay Contract', ar: 'RE Global — عقد إقامة فندقية', fr: 'RE Global — Contrat de séjour hôtelier', es: 'RE Global — Contrato de estancia hotelera', pt: 'RE Global — Contrato de estadia em hotel', ur: 'RE Global — ہوٹل میں قیام کا معاہدہ', zh: 'RE Global — 酒店住宿合同' },
};

export function kindPartyLabel(kind: ContractKind, language: string | undefined): string {
  return KIND_PARTY_LABELS[kind][known(language)];
}
export function kindTitleLabel(kind: ContractKind, language: string | undefined): string {
  return KIND_TITLE_LABELS[kind][known(language)];
}
/** The contract's status word in the reader's language (the raw word when it is not one we know). */
export function contractStatusLabel(status: string, language: string | undefined): string {
  const labels = CONTRACTS_I18N[known(language)].statusLabels as Record<string, string>;
  return Object.prototype.hasOwnProperty.call(labels, status) ? labels[status] : status;
}
