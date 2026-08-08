// RE Inspect — robotic/drone property inspection layer
// Mirrors the shape of the other Firestore-backed features in firebase-database.ts.
// NOTE: This is the type + client-side contract for the feature. Backend wiring
// (Firestore collection `inspections`, re-global-v2 routes, blockchain cert
// issuance) is a follow-up step — see /areas/re-global.md task notes.

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

export function healthScoreLabel(score: number, isArabic: boolean): string {
  if (score >= 90) return isArabic ? 'ممتاز' : 'Excellent';
  if (score >= 75) return isArabic ? 'جيد جدًا' : 'Very Good';
  if (score >= 60) return isArabic ? 'جيد' : 'Good';
  if (score >= 40) return isArabic ? 'يحتاج متابعة' : 'Needs Attention';
  return isArabic ? 'حرج' : 'Critical';
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

export const INSPECTION_STEPS = [
  {
    id: 1,
    titleEn: 'Request',
    titleAr: 'الطلب',
    descEn: 'Owner or buyer requests a certified inspection from the property page.',
    descAr: 'المالك أو المشتري يطلب فحصًا معتمدًا من صفحة العقار.',
  },
  {
    id: 2,
    titleEn: 'Scan',
    titleAr: 'المسح',
    descEn: 'Drone covers the exterior and site; ground robot scans interior spaces with thermal and visual sensors.',
    descAr: 'الدرون يغطي الواجهة والموقع الخارجي، والروبوت الأرضي يفحص المساحات الداخلية بحساسات حرارية وبصرية.',
  },
  {
    id: 3,
    titleEn: 'AI Analysis',
    titleAr: 'تحليل الذكاء الاصطناعي',
    descEn: 'Aladdin AI reviews the raw scan data and produces the Property Health Score and a plain-language summary.',
    descAr: 'يحلل "علاء الدين" بيانات المسح الخام ويصدر مؤشر صحة العقار مع ملخص بلغة مبسطة.',
  },
  {
    id: 4,
    titleEn: 'On-Chain Certificate',
    titleAr: 'الشهادة على البلوكتشين',
    descEn: 'The report is hashed and certified on Pi Testnet — permanent, tamper-proof, and publicly verifiable.',
    descAr: 'يتم تجزئة التقرير وتوثيقه على شبكة Pi Testnet — دائم وغير قابل للتلاعب وقابل للتحقق للجميع.',
  },
];
