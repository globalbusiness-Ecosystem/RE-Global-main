import type { NavLanguage } from './nav-i18n';

interface Tpl {
  dir: 'ltr' | 'rtl';
  locale: string;
  title: string;
  status: string;
  contractId: string;
  date: string;
  parties: string;
  partyA: string;
  verified: string;
  partyB: string;
  subject: string;
  property: string;
  txType: string;
  amount: string;
  terms: string;
  clauses: string[];
  note: string;
  types: Record<string, string>;
}

// {pid} = payment id, {txid} = transaction id
const T: Record<Exclude<NavLanguage, 'en'>, Tpl> = {
  ar: {
    dir: 'rtl', locale: 'ar-EG',
    title: 'RE GLOBAL — عقد معاملة عقارية',
    status: 'المرحلة: تجريبية / TESTNET — بانتظار المراجعة القانونية في الإمارات (المرسوم بقانون اتحادي رقم 46 لسنة 2021)',
    contractId: 'رقم العقد', date: 'التاريخ', parties: 'الأطراف',
    partyA: 'الطرف الأول (المشتري)', verified: 'تم التحقق من الهوية عبر دفع شبكة Pi',
    partyB: 'الطرف الثاني (المنصة)', subject: 'الموضوع', property: 'العقار', txType: 'نوع المعاملة', amount: 'المبلغ', terms: 'الشروط',
    clauses: [
      'الموضوع. يوافق المشتري على شراء العقار الموصوف أعلاه، وتوافق المنصة على نقل الحقوق فيه، وفقًا للشروط الواردة هنا.',
      'المقابل. دفع المشتري المبلغ المذكور أعلاه عبر نظام مدفوعات شبكة Pi (رقم الدفعة: {pid}، المعاملة: {txid}).',
      'إثبات المعاملة. يتفق الطرفان على أن سجل معاملة شبكة Pi على السلسلة يُعد دليلًا قاطعًا على السداد وعلى موافقة المشتري على هذا العقد.',
      'حالة العقار. عند وجود تقرير RE Inspect معتمد لهذا العقار، تُدرج نتائجه ودرجة الصحة فيه ضمن هذا العقد بالإحالة عبر هاش الشهادة المرتبط.',
      'المرحلة التجريبية. صدر هذا العقد خلال مرحلة تجريبية تقنية، ولا يُعد نقلًا عقاريًا ملزمًا قانونًا إلا بعد مراجعته والتأكد من توافقه مع القانون المعمول به.',
      'القانون الواجب التطبيق. بعد استكمال الإجراءات القانونية يخضع هذا العقد لقوانين دولة الإمارات العربية المتحدة.',
    ],
    note: 'ملاحظة: هذه ترجمة للتسهيل فقط. النص الإنجليزي الموقَّع هو النص المرجعي الملزم.',
    types: { buy: 'شراء', rent: 'إيجار', invest: 'استثمار', tokenized: 'عقار مرمَّز', hotel: 'حجز فندقي' },
  },
  fr: {
    dir: 'ltr', locale: 'fr-FR',
    title: 'RE GLOBAL — CONTRAT DE TRANSACTION IMMOBILIÈRE',
    status: 'Statut : PILOTE / TESTNET — En attente de validation juridique aux EAU (Décret-loi fédéral n° 46/2021)',
    contractId: 'ID du contrat', date: 'Date', parties: 'PARTIES',
    partyA: 'Partie A (Acheteur)', verified: 'identité vérifiée via un paiement Pi Network',
    partyB: 'Partie B (Plateforme)', subject: 'OBJET', property: 'Bien', txType: 'Type de transaction', amount: 'Montant', terms: 'CONDITIONS',
    clauses: [
      'Objet. L’Acheteur accepte d’acquérir, et la Plateforme accepte de transférer les droits sur le bien décrit ci-dessus, sous réserve des conditions du présent contrat.',
      'Contrepartie. L’Acheteur a payé le montant indiqué ci-dessus via le système de paiement Pi Network (ID de paiement : {pid}, transaction : {txid}).',
      'Preuve de la transaction. Les parties conviennent que l’enregistrement on-chain de la transaction Pi Network constitue une preuve concluante du paiement et de l’accord de l’Acheteur au présent contrat.',
      'État du bien. Lorsqu’un rapport RE Inspect certifié existe pour ce bien, ses conclusions et son Health Score sont intégrés au présent contrat par référence via le hash de certificat associé.',
      'Phase pilote. Ce contrat est émis pendant une phase pilote technique et ne constitue pas encore un transfert immobilier juridiquement contraignant tant qu’il n’a pas été examiné et jugé conforme à la loi applicable.',
      'Droit applicable. Après finalisation juridique, ce contrat sera régi par les lois des Émirats arabes unis.',
    ],
    note: 'Note : traduction fournie à titre indicatif. Le texte anglais signé fait foi.',
    types: { buy: 'achat', rent: 'location', invest: 'investissement', tokenized: 'bien tokenisé', hotel: 'réservation d’hôtel' },
  },
  es: {
    dir: 'ltr', locale: 'es-ES',
    title: 'RE GLOBAL — CONTRATO DE TRANSACCIÓN INMOBILIARIA',
    status: 'Estado: PILOTO / TESTNET — Pendiente de revisión legal en EAU (Decreto-Ley Federal n.º 46/2021)',
    contractId: 'ID del contrato', date: 'Fecha', parties: 'PARTES',
    partyA: 'Parte A (Comprador)', verified: 'identidad verificada mediante un pago de Pi Network',
    partyB: 'Parte B (Plataforma)', subject: 'OBJETO', property: 'Propiedad', txType: 'Tipo de transacción', amount: 'Importe', terms: 'CONDICIONES',
    clauses: [
      'Objeto. El Comprador acepta adquirir, y la Plataforma acepta transferir los derechos sobre, la propiedad descrita arriba, sujeto a los términos de este contrato.',
      'Contraprestación. El Comprador ha pagado el importe indicado arriba mediante el sistema de pagos de Pi Network (ID de pago: {pid}, transacción: {txid}).',
      'Prueba de la transacción. Las partes acuerdan que el registro on-chain de la transacción de Pi Network constituye prueba concluyente del pago y de la conformidad del Comprador con este contrato.',
      'Estado de la propiedad. Cuando exista un informe RE Inspect certificado para esta propiedad, sus conclusiones y su Health Score se incorporan a este contrato por referencia mediante el hash del certificado vinculado.',
      'Fase piloto. Este contrato se emite durante una fase piloto técnica y todavía no constituye una transmisión inmobiliaria legalmente vinculante hasta que sea revisado y confirmado conforme a la ley aplicable.',
      'Ley aplicable. Una vez finalizada la revisión legal, este contrato se regirá por las leyes de los Emiratos Árabes Unidos.',
    ],
    note: 'Nota: traducción de cortesía. El texto en inglés firmado es el original vinculante.',
    types: { buy: 'compra', rent: 'alquiler', invest: 'inversión', tokenized: 'propiedad tokenizada', hotel: 'reserva de hotel' },
  },
  pt: {
    dir: 'ltr', locale: 'pt-PT',
    title: 'RE GLOBAL — CONTRATO DE TRANSAÇÃO IMOBILIÁRIA',
    status: 'Estado: PILOTO / TESTNET — A aguardar revisão jurídica nos EAU (Decreto-Lei Federal n.º 46/2021)',
    contractId: 'ID do contrato', date: 'Data', parties: 'PARTES',
    partyA: 'Parte A (Comprador)', verified: 'identidade verificada através de um pagamento Pi Network',
    partyB: 'Parte B (Plataforma)', subject: 'OBJETO', property: 'Imóvel', txType: 'Tipo de transação', amount: 'Valor', terms: 'CONDIÇÕES',
    clauses: [
      'Objeto. O Comprador concorda em adquirir, e a Plataforma concorda em transferir os direitos sobre, o imóvel descrito acima, sujeito aos termos deste contrato.',
      'Contrapartida. O Comprador pagou o valor indicado acima através do sistema de pagamentos Pi Network (ID de pagamento: {pid}, transação: {txid}).',
      'Prova da transação. As partes acordam que o registo on-chain da transação Pi Network constitui prova conclusiva do pagamento e da concordância do Comprador com este contrato.',
      'Estado do imóvel. Quando existir um relatório RE Inspect certificado para este imóvel, as suas conclusões e o Health Score ficam incorporados neste contrato por referência, através do hash do certificado associado.',
      'Fase piloto. Este contrato é emitido durante uma fase piloto técnica e ainda não constitui uma transmissão imobiliária juridicamente vinculativa até ser revisto e confirmado em conformidade com a lei aplicável.',
      'Lei aplicável. Após a finalização jurídica, este contrato será regido pelas leis dos Emirados Árabes Unidos.',
    ],
    note: 'Nota: tradução de cortesia. O texto em inglês assinado é o original vinculativo.',
    types: { buy: 'compra', rent: 'arrendamento', invest: 'investimento', tokenized: 'imóvel tokenizado', hotel: 'reserva de hotel' },
  },
  ur: {
    dir: 'rtl', locale: 'ur-PK',
    title: 'RE GLOBAL — جائیداد کے لین دین کا معاہدہ',
    status: 'حیثیت: پائلٹ / TESTNET — یو اے ای میں قانونی جائزے کا منتظر (وفاقی فرمانِ قانون نمبر 46/2021)',
    contractId: 'معاہدہ نمبر', date: 'تاریخ', parties: 'فریقین',
    partyA: 'فریقِ اول (خریدار)', verified: 'شناخت Pi Network کی ادائیگی کے ذریعے تصدیق شدہ',
    partyB: 'فریقِ دوم (پلیٹ فارم)', subject: 'موضوع', property: 'جائیداد', txType: 'لین دین کی قسم', amount: 'رقم', terms: 'شرائط',
    clauses: [
      'موضوع۔ خریدار مذکورہ بالا جائیداد خریدنے پر اور پلیٹ فارم اس کے حقوق منتقل کرنے پر اس معاہدے کی شرائط کے مطابق متفق ہیں۔',
      'معاوضہ۔ خریدار نے مذکورہ رقم Pi Network کے ادائیگی نظام کے ذریعے ادا کر دی ہے (ادائیگی کی شناخت: {pid}، ٹرانزیکشن: {txid})۔',
      'لین دین کا ثبوت۔ فریقین متفق ہیں کہ Pi Network کا آن چین ٹرانزیکشن ریکارڈ ادائیگی اور اس معاہدے سے خریدار کی رضامندی کا حتمی ثبوت ہے۔',
      'جائیداد کی حالت۔ جہاں اس جائیداد کی مصدقہ RE Inspect رپورٹ موجود ہو، اس کے نتائج اور ہیلتھ اسکور منسلک سرٹیفکیٹ ہیش کے حوالے سے اس معاہدے کا حصہ ہوں گے۔',
      'پائلٹ مرحلہ۔ یہ معاہدہ تکنیکی پائلٹ مرحلے میں جاری ہوا ہے اور جائزہ لے کر قابلِ اطلاق قانون کے مطابق تسلیم ہونے تک قانونی طور پر پابند جائیداد منتقلی نہیں ہے۔',
      'حاکم قانون۔ قانونی تکمیل کے بعد یہ معاہدہ متحدہ عرب امارات کے قوانین کے تحت ہوگا۔',
    ],
    note: 'نوٹ: یہ سہولت کے لیے ترجمہ ہے۔ دستخط شدہ انگریزی متن ہی مستند اور پابند ہے۔',
    types: { buy: 'خریداری', rent: 'کرایہ', invest: 'سرمایہ کاری', tokenized: 'ٹوکنائزڈ جائیداد', hotel: 'ہوٹل بکنگ' },
  },
  zh: {
    dir: 'ltr', locale: 'zh-CN',
    title: 'RE GLOBAL — 房产交易合同',
    status: '状态：试点 / TESTNET — 待阿联酋法律审查（联邦法令第46/2021号）',
    contractId: '合同编号', date: '日期', parties: '合同双方',
    partyA: '甲方（买方）', verified: '身份已通过 Pi Network 支付验证',
    partyB: '乙方（平台）', subject: '标的', property: '房产', txType: '交易类型', amount: '金额', terms: '条款',
    clauses: [
      '标的。买方同意购买上述房产，平台同意依据本合同条款转让相关权利。',
      '对价。买方已通过 Pi Network 支付系统支付上述金额（支付ID：{pid}，交易：{txid}）。',
      '交易证明。双方同意，Pi Network 链上交易记录是付款及买方同意本合同的确凿证据。',
      '房产状况。如该房产存在经认证的 RE Inspect 报告，其结论及健康评分通过关联的证书哈希并入本合同。',
      '试点阶段。本合同在技术试点阶段签发；在经审查并确认符合适用法律之前，不构成具有法律约束力的房产转让。',
      '适用法律。法律程序完成后，本合同适用阿拉伯联合酋长国法律。',
    ],
    note: '注：本译文仅供参考，以已签署的英文原文为准。',
    types: { buy: '购买', rent: '租赁', invest: '投资', tokenized: '代币化房产', hotel: '酒店预订' },
  },
};

export const CONTRACT_LANGS: { code: NavLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ur', label: 'اردو' },
  { code: 'zh', label: '中文' },
];

export function contractDir(lang: NavLanguage): 'ltr' | 'rtl' {
  return lang === 'en' ? 'ltr' : T[lang].dir;
}

export interface TranslatableContract {
  id: string;
  contractText?: string;
  propertyId: string;
  propertyTitle: string;
  buyerUsername: string;
  sellerUsername: string;
  type: string;
  amount: number;
  currency: string;
  paymentId?: string;
  txid?: string;
  signedAt?: string;
}

// Rebuilds the readable contract in another language from the stored fields.
// The signed original is always the English text; this is a courtesy translation.
export function translateContract(lang: NavLanguage, c: TranslatableContract): string {
  if (lang === 'en') return c.contractText ?? '';
  const t = T[lang];
  const contractId = c.contractText?.match(/^Contract ID:\s*(.+)$/m)?.[1]?.trim() || c.id;
  let when = '';
  if (c.signedAt) {
    const d = new Date(c.signedAt);
    if (!Number.isNaN(d.getTime())) when = d.toLocaleString(t.locale);
  }
  const pid = c.paymentId || '-';
  const txid = c.txid || '-';
  const clauses = t.clauses
    .map((x, i) => `${i + 1}. ${x.replace('{pid}', pid).replace('{txid}', txid)}`)
    .join('\n');
  return [
    t.title,
    t.status,
    '',
    `${t.contractId}: ${contractId}`,
    `${t.date}: ${when}`,
    '',
    t.parties,
    `${t.partyA}: @${c.buyerUsername} — ${t.verified}`,
    `${t.partyB}: RE Global (${c.sellerUsername})`,
    '',
    t.subject,
    `${t.property}: ${c.propertyTitle} (ID: ${c.propertyId})`,
    `${t.txType}: ${t.types[c.type] ?? c.type}`,
    `${t.amount}: ${c.amount} ${c.currency}`,
    '',
    t.terms,
    clauses,
    '',
    t.note,
  ].join('\n');
}
