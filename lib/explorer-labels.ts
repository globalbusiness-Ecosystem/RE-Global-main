import type { NavLanguage } from './nav-i18n';

// Texts of the blockchain explorer page and its home card, in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const EXPLORER_LABELS = {
  title: { en: 'Blockchain', ar: 'البلوك تشين', fr: 'Blockchain', es: 'Blockchain', pt: 'Blockchain', ur: 'بلاک چین', zh: '区块链' },
  sub: { en: 'Check any contract or transaction on the Pi blockchain. No sign-in needed.', ar: 'تحقق من أي عقد أو معاملة على بلوك تشين Pi. من غير تسجيل دخول.', fr: "Vérifiez n'importe quel contrat ou transaction sur la blockchain Pi. Sans connexion.", es: 'Comprueba cualquier contrato o transacción en la blockchain de Pi. Sin iniciar sesión.', pt: 'Verifique qualquer contrato ou transação na blockchain Pi. Sem iniciar sessão.', ur: 'Pi بلاک چین پر کوئی بھی معاہدہ یا لین دین چیک کریں۔ لاگ اِن کی ضرورت نہیں۔', zh: '在 Pi 区块链上查询任何合同或交易，无需登录。' },
  placeholder: { en: 'Transaction hash, contract hash or contract number', ar: 'رقم المعاملة (Hash) أو بصمة العقد أو رقم العقد', fr: 'Hash de transaction, empreinte ou numéro de contrat', es: 'Hash de transacción, huella o número de contrato', pt: 'Hash da transação, impressão ou número do contrato', ur: 'ٹرانزیکشن ہیش، معاہدے کا ہیش یا معاہدہ نمبر', zh: '交易哈希、合同哈希或合同编号' },
  search: { en: 'Search', ar: 'بحث', fr: 'Rechercher', es: 'Buscar', pt: 'Pesquisar', ur: 'تلاش', zh: '搜索' },
  searching: { en: 'Searching...', ar: 'جاري البحث...', fr: 'Recherche...', es: 'Buscando...', pt: 'A pesquisar...', ur: 'تلاش جاری ہے...', zh: '搜索中...' },
  recent: { en: 'Latest records on the chain', ar: 'آخر التسجيلات على البلوك تشين', fr: 'Derniers enregistrements sur la chaîne', es: 'Últimos registros en la cadena', pt: 'Últimos registos na cadeia', ur: 'چین پر تازہ ترین اندراجات', zh: '链上最新记录' },
  recentEmpty: { en: 'Nothing recorded yet.', ar: 'لسه مفيش تسجيلات.', fr: "Rien d'enregistré pour le moment.", es: 'Aún no hay registros.', pt: 'Ainda não há registos.', ur: 'ابھی کوئی اندراج نہیں۔', zh: '暂无记录。' },
  notFound: { en: 'Nothing found for this number. Check it and try again.', ar: 'مفيش نتيجة للرقم ده. راجعه وجرّب تاني.', fr: 'Aucun résultat pour ce numéro. Vérifiez-le et réessayez.', es: 'No se encontró nada con ese número. Revísalo e inténtalo de nuevo.', pt: 'Nada encontrado para este número. Verifique e tente novamente.', ur: 'اس نمبر پر کچھ نہیں ملا۔ دوبارہ چیک کریں۔', zh: '未找到该编号的结果，请检查后重试。' },
  invalid: { en: 'Enter a transaction hash (64 characters) or a contract number.', ar: 'اكتب رقم معاملة (64 حرف) أو رقم عقد.', fr: 'Saisissez un hash de transaction (64 caractères) ou un numéro de contrat.', es: 'Introduce un hash de transacción (64 caracteres) o un número de contrato.', pt: 'Introduza um hash de transação (64 caracteres) ou um número de contrato.', ur: 'ٹرانزیکشن ہیش (64 حروف) یا معاہدہ نمبر درج کریں۔', zh: '请输入交易哈希（64 位）或合同编号。' },
  failed: { en: 'Could not reach the blockchain. Please try again.', ar: 'مقدرناش نوصل للبلوك تشين. جرّب تاني.', fr: 'Blockchain injoignable. Réessayez.', es: 'No se pudo conectar con la blockchain. Inténtalo de nuevo.', pt: 'Não foi possível contactar a blockchain. Tente novamente.', ur: 'بلاک چین تک رسائی نہیں ہو سکی۔ دوبارہ کوشش کریں۔', zh: '无法连接区块链，请重试。' },
  tx: { en: 'Transaction', ar: 'المعاملة', fr: 'Transaction', es: 'Transacción', pt: 'Transação', ur: 'لین دین', zh: '交易' },
  confirmed: { en: 'Confirmed on the blockchain', ar: 'مؤكدة على البلوك تشين', fr: 'Confirmée sur la blockchain', es: 'Confirmada en la blockchain', pt: 'Confirmada na blockchain', ur: 'بلاک چین پر تصدیق شدہ', zh: '已在区块链上确认' },
  notConfirmed: { en: 'Found but not successful', ar: 'موجودة لكن مش ناجحة', fr: 'Trouvée mais non réussie', es: 'Encontrada pero no exitosa', pt: 'Encontrada mas sem sucesso', ur: 'ملا مگر کامیاب نہیں', zh: '已找到但未成功' },
  ledger: { en: 'Ledger', ar: 'رقم الدفتر', fr: 'Registre', es: 'Libro mayor', pt: 'Livro-razão', ur: 'لیجر', zh: '账本号' },
  time: { en: 'Time', ar: 'الوقت', fr: 'Date', es: 'Fecha', pt: 'Data', ur: 'وقت', zh: '时间' },
  hash: { en: 'Hash', ar: 'رقم المعاملة', fr: 'Hash', es: 'Hash', pt: 'Hash', ur: 'ہیش', zh: '哈希' },
  source: { en: 'Recorded by', ar: 'سجّلها', fr: 'Enregistrée par', es: 'Registrada por', pt: 'Registada por', ur: 'اندراج کنندہ', zh: '记录方' },
  fingerprint: { en: 'Contract fingerprint on the chain', ar: 'بصمة العقد على البلوك تشين', fr: "Empreinte du contrat sur la chaîne", es: 'Huella del contrato en la cadena', pt: 'Impressão do contrato na cadeia', ur: 'چین پر معاہدے کا فنگر پرنٹ', zh: '链上合同指纹' },
  contract: { en: 'Contract', ar: 'العقد', fr: 'Contrat', es: 'Contrato', pt: 'Contrato', ur: 'معاہدہ', zh: '合同' },
  property: { en: 'Property', ar: 'العقار', fr: 'Bien', es: 'Propiedad', pt: 'Imóvel', ur: 'جائیداد', zh: '房产' },
  signed: { en: 'Signed on', ar: 'تاريخ التوقيع', fr: 'Signé le', es: 'Firmado el', pt: 'Assinado em', ur: 'دستخط کی تاریخ', zh: '签署日期' },
  matches: { en: 'The fingerprint on the chain matches this contract exactly.', ar: 'البصمة على البلوك تشين مطابقة للعقد تمامًا.', fr: "L'empreinte sur la chaîne correspond exactement à ce contrat.", es: 'La huella en la cadena coincide exactamente con este contrato.', pt: 'A impressão na cadeia corresponde exatamente a este contrato.', ur: 'چین پر موجود فنگر پرنٹ اس معاہدے سے بالکل مطابقت رکھتا ہے۔', zh: '链上指纹与此合同完全一致。' },
  notAnchored: { en: 'This contract is signed but not recorded on the chain yet. It is recorded within a short time.', ar: 'العقد موقّع لكن لسه متسجّلش على البلوك تشين. بيتسجّل خلال وقت قصير.', fr: "Ce contrat est signé mais pas encore enregistré sur la chaîne. Il le sera sous peu.", es: 'Este contrato está firmado pero aún no registrado en la cadena. Se registrará en breve.', pt: 'Este contrato está assinado mas ainda não registado na cadeia. Será registado em breve.', ur: 'یہ معاہدہ دستخط شدہ ہے مگر ابھی چین پر درج نہیں ہوا۔ جلد درج ہو جائے گا۔', zh: '该合同已签署，但尚未上链，稍后会自动记录。' },
  registry: { en: 'Ownership smart contract', ar: 'العقد الذكي للملكية', fr: 'Contrat intelligent de propriété', es: 'Contrato inteligente de propiedad', pt: 'Contrato inteligente de propriedade', ur: 'ملکیت کا اسمارٹ کنٹریکٹ', zh: '所有权智能合约' },
  registryDone: { en: 'Recorded', ar: 'متسجّل', fr: 'Enregistré', es: 'Registrado', pt: 'Registado', ur: 'درج شدہ', zh: '已记录' },
  openContract: { en: 'Open the contract', ar: 'فتح العقد', fr: 'Ouvrir le contrat', es: 'Abrir el contrato', pt: 'Abrir o contrato', ur: 'معاہدہ کھولیں', zh: '打开合同' },
  openRaw: { en: 'Open the raw record', ar: 'فتح السجل الخام', fr: "Ouvrir l'enregistrement brut", es: 'Abrir el registro original', pt: 'Abrir o registo original', ur: 'اصل ریکارڈ کھولیں', zh: '查看原始记录' },
  openExplorer: { en: 'Search on the blockchain', ar: 'ابحث على البلوك تشين', fr: 'Rechercher sur la blockchain', es: 'Buscar en la blockchain', pt: 'Pesquisar na blockchain', ur: 'بلاک چین پر تلاش کریں', zh: '在区块链上查询' },
  copy: { en: 'Copy', ar: 'نسخ', fr: 'Copier', es: 'Copiar', pt: 'Copiar', ur: 'کاپی', zh: '复制' },
  copied: { en: 'Copied', ar: 'اتنسخ', fr: 'Copié', es: 'Copiado', pt: 'Copiado', ur: 'کاپی ہو گیا', zh: '已复制' },
  network: { en: 'Pi Testnet', ar: 'شبكة Pi التجريبية', fr: 'Pi Testnet', es: 'Pi Testnet', pt: 'Pi Testnet', ur: 'Pi ٹیسٹ نیٹ', zh: 'Pi 测试网' },
  home: { en: 'Back to the platform', ar: 'العودة إلى المنصة', fr: 'Retour à la plateforme', es: 'Volver a la plataforma', pt: 'Voltar à plataforma', ur: 'پلیٹ فارم پر واپس', zh: '返回平台' },
} satisfies Record<string, Row>;

export type ExplorerLabelKey = keyof typeof EXPLORER_LABELS;

export function ex(key: ExplorerLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (EXPLORER_LABELS[key] as Row)[known];
}
