// RE Inspect — robotic/drone property inspection layer
// Mirrors the shape of the other Firestore-backed features in firebase-database.ts.
// NOTE: This is the type + client-side contract for the feature. Backend wiring
// (Firestore collection `inspections`, re-global-v2 routes, blockchain cert
// issuance) is a follow-up step — see /areas/re-global.md task notes.

import type { NavLanguage } from './nav-i18n';
import { INSPECTIONS_I18N } from './inspections-i18n';

export type InspectionType = 'drone_exterior' | 'robot_interior' | 'thermal' | 'hybrid';
export type InspectionStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'certified';

export interface InspectionSubScore {
  structural: number; // 0-100
  moisture: number;
  thermal: number;
  safety: number;
}

export interface InspectionFinding {
  type: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  imageRef?: string;
}

export interface PropertyInspection {
  id: string;
  propertyId: string;
  propertyTitleEn: string;
  propertyTitleAr: string;
  requestedBy: string; // username
  status: InspectionStatus;
  inspectionType: InspectionType;
  scheduledDate?: string;
  operatorId?: string;
  scores: InspectionSubScore;
  overallHealthScore: number; // 0-100, weighted average of scores
  aiSummaryEn?: string;
  aiSummaryAr?: string;
  flaggedIssues: InspectionFinding[];
  blockchainCertHash?: string; // Pi Testnet tx hash once certified on-chain
  certifiedAt?: string;
  createdAt: string;
}

/** Weighted overall score — structural and safety count more than moisture/thermal. */
export function computeOverallHealthScore(scores: InspectionSubScore): number {
  const weighted =
    scores.structural * 0.35 +
    scores.safety * 0.3 +
    scores.thermal * 0.2 +
    scores.moisture * 0.15;
  return Math.round(weighted);
}

export function healthScoreLabel(score: number, language: NavLanguage): string {
  const l = INSPECTIONS_I18N[language].healthLabels;
  if (score >= 90) return l.excellent;
  if (score >= 75) return l.veryGood;
  if (score >= 60) return l.good;
  if (score >= 40) return l.needsAttention;
  return l.critical;
}

export function healthScoreColor(score: number): string {
  if (score >= 90) return '#34d399'; // emerald
  if (score >= 75) return 'oklch(0.68 0.16 70)'; // brand gold/accent
  if (score >= 60) return '#fbbf24'; // amber
  if (score >= 40) return '#fb923c'; // orange
  return '#f87171'; // red
}

/** Demo record used to showcase the feature before live data/backend wiring exists. */
export const DEMO_INSPECTION: PropertyInspection = {
  id: 'demo-insp-001',
  propertyId: 'demo-property',
  propertyTitleEn: 'Marina Heights Tower — Unit 1204',
  propertyTitleAr: 'برج مارينا هايتس — وحدة 1204',
  requestedBy: 'demo_user',
  status: 'certified',
  inspectionType: 'hybrid',
  scores: { structural: 96, moisture: 88, thermal: 91, safety: 97 },
  overallHealthScore: computeOverallHealthScore({ structural: 96, moisture: 88, thermal: 91, safety: 97 }),
  aiSummaryEn:
    'No structural concerns detected. Minor moisture reading near the north balcony door threshold — recommend monitoring next cycle. Thermal envelope and safety systems performing within expected range.',
  aiSummaryAr:
    'لم يتم رصد أي مخاوف إنشائية. قراءة رطوبة طفيفة بالقرب من عتبة باب الشرفة الشمالية — يُنصح بالمتابعة في الدورة القادمة. الغلاف الحراري وأنظمة السلامة ضمن المعدل المتوقع.',
  flaggedIssues: [
    { type: 'moisture', severity: 'low', location: 'North balcony door threshold' },
  ],
  blockchainCertHash: undefined,
  certifiedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

/** Extra-language demo copy (fr/es/pt/ur/zh); en/ar stay on the fields above for backward compat. */
export const DEMO_INSPECTION_TRANSLATIONS: Partial<Record<NavLanguage, { propertyTitle: string; aiSummary: string }>> = {
  fr: {
    propertyTitle: 'Tour Marina Heights — Unité 1204',
    aiSummary:
      "Aucun problème structurel détecté. Légère humidité relevée près du seuil de la porte du balcon nord — surveillance recommandée au prochain cycle. Enveloppe thermique et systèmes de sécurité conformes aux attentes.",
  },
  es: {
    propertyTitle: 'Torre Marina Heights — Unidad 1204',
    aiSummary:
      'No se detectaron problemas estructurales. Ligera lectura de humedad cerca del umbral de la puerta del balcón norte — se recomienda monitorear en el próximo ciclo. La envolvente térmica y los sistemas de seguridad funcionan dentro del rango esperado.',
  },
  pt: {
    propertyTitle: 'Torre Marina Heights — Unidade 1204',
    aiSummary:
      'Nenhum problema estrutural detectado. Leve leitura de umidade próxima ao limiar da porta da varanda norte — recomenda-se monitorar no próximo ciclo. Envoltória térmica e sistemas de segurança funcionando dentro do esperado.',
  },
  ur: {
    propertyTitle: 'مارینا ہائٹس ٹاور — یونٹ 1204',
    aiSummary:
      'کوئی ساختی مسئلہ نہیں پایا گیا۔ شمالی بالکونی کے دروازے کی دہلیز کے قریب معمولی نمی ریکارڈ ہوئی — اگلے چکر میں نگرانی کی سفارش کی جاتی ہے۔ حرارتی نظام اور حفاظتی نظام متوقع حد میں کام کر رہے ہیں۔',
  },
  zh: {
    propertyTitle: '滨海高地大厦 — 1204 单元',
    aiSummary:
      '未检测到结构问题。北侧阳台门槛附近检测到轻微湿度，建议在下一周期监测。隔热层和安全系统运行正常，均在预期范围内。',
  },
};

export function getDemoPropertyTitle(language: NavLanguage): string {
  if (language === 'ar') return DEMO_INSPECTION.propertyTitleAr;
  return DEMO_INSPECTION_TRANSLATIONS[language]?.propertyTitle || DEMO_INSPECTION.propertyTitleEn;
}

export function getDemoAiSummary(language: NavLanguage): string {
  if (language === 'ar') return DEMO_INSPECTION.aiSummaryAr || '';
  return DEMO_INSPECTION_TRANSLATIONS[language]?.aiSummary || DEMO_INSPECTION.aiSummaryEn || '';
}

export const INSPECTION_STEPS = [
  {
    id: 1,
    titleEn: 'Request',
    titleAr: 'الطلب',
    descEn: 'Owner or buyer requests a certified inspection from the property page.',
    descAr: 'المالك أو المشتري يطلب فحصًا معتمدًا من صفحة العقار.',
    translations: {
      fr: { title: 'Demande', desc: 'Le propriétaire ou l\'acheteur demande une inspection certifiée depuis la page du bien.' },
      es: { title: 'Solicitud', desc: 'El propietario o comprador solicita una inspección certificada desde la página de la propiedad.' },
      pt: { title: 'Solicitação', desc: 'O proprietário ou comprador solicita uma inspeção certificada na página do imóvel.' },
      ur: { title: 'درخواست', desc: 'مالک یا خریدار جائیداد کے صفحے سے تصدیق شدہ معائنے کی درخواست دیتا ہے۔' },
      zh: { title: '申请', desc: '业主或买家在房产页面申请认证检查。' },
    },
  },
  {
    id: 2,
    titleEn: 'Scan',
    titleAr: 'المسح',
    descEn: 'Drone covers the exterior and site; ground robot scans interior spaces with thermal and visual sensors.',
    descAr: 'الدرون يغطي الواجهة والموقع الخارجي، والروبوت الأرضي يفحص المساحات الداخلية بحساسات حرارية وبصرية.',
    translations: {
      fr: { title: 'Scan', desc: "Le drone couvre l'extérieur et le site ; le robot au sol scanne les espaces intérieurs avec des capteurs thermiques et visuels." },
      es: { title: 'Escaneo', desc: 'El dron cubre el exterior y el sitio; el robot terrestre escanea los espacios interiores con sensores térmicos y visuales.' },
      pt: { title: 'Varredura', desc: 'O drone cobre o exterior e o local; o robô terrestre varre os espaços internos com sensores térmicos e visuais.' },
      ur: { title: 'اسکین', desc: 'ڈرون بیرونی حصے اور جگہ کا احاطہ کرتا ہے؛ زمینی روبوٹ حرارتی اور بصری سینسرز سے اندرونی جگہوں کو اسکین کرتا ہے۔' },
      zh: { title: '扫描', desc: '无人机覆盖外部和场地；地面机器人使用热成像和视觉传感器扫描室内空间。' },
    },
  },
  {
    id: 3,
    titleEn: 'AI Analysis',
    titleAr: 'تحليل الذكاء الاصطناعي',
    descEn: 'Aladdin AI reviews the raw scan data and produces the Property Health Score and a plain-language summary.',
    descAr: 'يحلل "علاء الدين" بيانات المسح الخام ويصدر مؤشر صحة العقار مع ملخص بلغة مبسطة.',
    translations: {
      fr: { title: 'Analyse IA', desc: "Aladdin AI examine les données brutes du scan et produit le Health Score du bien ainsi qu'un résumé en langage clair." },
      es: { title: 'Análisis de IA', desc: 'Aladdin AI revisa los datos brutos del escaneo y genera el Health Score de la propiedad junto con un resumen en lenguaje sencillo.' },
      pt: { title: 'Análise de IA', desc: 'A Aladdin AI analisa os dados brutos da varredura e gera o Health Score do imóvel com um resumo em linguagem simples.' },
      ur: { title: 'AI تجزیہ', desc: 'علاء الدین AI خام اسکین ڈیٹا کا جائزہ لیتا ہے اور جائیداد کا ہیلتھ اسکور اور آسان زبان میں خلاصہ تیار کرتا ہے۔' },
      zh: { title: 'AI 分析', desc: '阿拉丁 AI 审查原始扫描数据，生成房产健康评分及通俗易懂的摘要。' },
    },
  },
  {
    id: 4,
    titleEn: 'On-Chain Certificate',
    titleAr: 'الشهادة على البلوكتشين',
    descEn: 'The report is hashed and certified on Pi Testnet — permanent, tamper-proof, and publicly verifiable.',
    descAr: 'يتم تجزئة التقرير وتوثيقه على شبكة Pi Testnet — دائم وغير قابل للتلاعب وقابل للتحقق للجميع.',
    translations: {
      fr: { title: 'Certificat sur la blockchain', desc: 'Le rapport est haché et certifié sur Pi Testnet — permanent, inviolable et vérifiable publiquement.' },
      es: { title: 'Certificado en blockchain', desc: 'El informe se hashea y certifica en Pi Testnet — permanente, a prueba de manipulaciones y verificable públicamente.' },
      pt: { title: 'Certificado on-chain', desc: 'O relatório é hasheado e certificado na Pi Testnet — permanente, à prova de adulteração e verificável publicamente.' },
      ur: { title: 'آن چین سرٹیفکیٹ', desc: 'رپورٹ کو ہیش کر کے Pi Testnet پر تصدیق کیا جاتا ہے — مستقل، چھیڑ چھاڑ سے محفوظ، اور عوامی طور پر قابل تصدیق۔' },
      zh: { title: '链上证书', desc: '报告经过哈希处理并在 Pi Testnet 上认证 — 永久保存、防篡改，且可公开验证。' },
    },
  },
];

export function getStepTitle(step: (typeof INSPECTION_STEPS)[number], language: NavLanguage): string {
  if (language === 'ar') return step.titleAr;
  return step.translations[language as keyof typeof step.translations]?.title || step.titleEn;
}

export function getStepDesc(step: (typeof INSPECTION_STEPS)[number], language: NavLanguage): string {
  if (language === 'ar') return step.descAr;
  return step.translations[language as keyof typeof step.translations]?.desc || step.descEn;
}
