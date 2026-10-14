// Per-country legal wording for contracts and notices. The defaults are deliberately generic
// (they name the jurisdiction but state no specific statute, except the original UAE pilot wording).
// A lawyer can replace any of it from the admin panel (Firestore legal_profiles/{code}).

export const COUNTRIES: Record<string, { en: string; ar: string }> = {
  AE: { en: 'United Arab Emirates', ar: 'الإمارات' },
  EG: { en: 'Egypt', ar: 'مصر' },
  SA: { en: 'Saudi Arabia', ar: 'السعودية' },
  QA: { en: 'Qatar', ar: 'قطر' },
  KW: { en: 'Kuwait', ar: 'الكويت' },
  JO: { en: 'Jordan', ar: 'الأردن' },
  TR: { en: 'Turkey', ar: 'تركيا' },
  GB: { en: 'United Kingdom', ar: 'بريطانيا' },
  US: { en: 'United States', ar: 'أمريكا' },
  CA: { en: 'Canada', ar: 'كندا' },
  FR: { en: 'France', ar: 'فرنسا' },
  ES: { en: 'Spain', ar: 'إسبانيا' },
  DE: { en: 'Germany', ar: 'ألمانيا' },
  AU: { en: 'Australia', ar: 'أستراليا' },
};

export const isCountry = (c: unknown): c is string => typeof c === 'string' && c in COUNTRIES;

export type LegalProfile = {
  code: string;
  statusLine: string;     // line under the contract title
  governingLaw: string;   // completes "governed by ..."
  extraClause: string;    // optional extra contract clause (English), '' = none
  noticeEn: string;       // shown to buyers on the property page
  noticeAr: string;
};

export type LegalOverride = Partial<Omit<LegalProfile, 'code'>>;

export function defaultProfile(code: string | null | undefined): LegalProfile {
  if (code === 'AE') {
    return {
      code,
      statusLine: 'PILOT / TESTNET — Pending UAE Legal Review (Federal Decree-Law No. 46/2021)',
      governingLaw: 'the laws of the United Arab Emirates',
      extraClause: '',
      noticeEn: 'This property is in the United Arab Emirates. The platform contract is a signed payment record; an official transfer of title requires registration with the competent real-estate authority and is subject to UAE law.',
      noticeAr: 'العقار ده في الإمارات. عقد المنصة إيصال دفع موقّع، ونقل الملكية الرسمي يتطلب التسجيل لدى الجهة العقارية المختصة ويخضع لقانون الإمارات.',
    };
  }
  const c = code && isCountry(code) ? COUNTRIES[code] : null;
  if (!c) {
    return {
      code: code || '',
      statusLine: 'PILOT / TESTNET — Pending legal review in the jurisdiction of the property',
      governingLaw: 'the laws of the jurisdiction where the property is located',
      extraClause: '',
      noticeEn: 'The platform contract is a signed payment record. An official transfer of title requires registration with the competent authority in the country where the property is located and is subject to that country\'s law.',
      noticeAr: 'عقد المنصة إيصال دفع موقّع. نقل الملكية الرسمي يتطلب التسجيل لدى الجهة المختصة في البلد اللي فيه العقار ويخضع لقانون البلد ده.',
    };
  }
  return {
    code: code as string,
    statusLine: `PILOT / TESTNET — Pending legal review in ${c.en}`,
    governingLaw: `the laws of ${c.en}`,
    extraClause: '',
    noticeEn: `This property is in ${c.en}. The platform contract is a signed payment record; an official transfer of title requires registration with the competent authority in ${c.en} and is subject to its law.`,
    noticeAr: `العقار ده في ${c.ar}. عقد المنصة إيصال دفع موقّع، ونقل الملكية الرسمي يتطلب التسجيل لدى الجهة المختصة في ${c.ar} ويخضع لقانونها.`,
  };
}

const FIELDS: { k: keyof LegalOverride; max: number }[] = [
  { k: 'statusLine', max: 200 }, { k: 'governingLaw', max: 200 }, { k: 'extraClause', max: 1500 },
  { k: 'noticeEn', max: 800 }, { k: 'noticeAr', max: 800 },
];

// Keeps only known, non-empty, length-limited text fields (single-line ones lose line breaks).
export function sanitizeLegalOverride(input: unknown): { ok: true; override: LegalOverride } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'Invalid override' };
  const out: LegalOverride = {};
  for (const { k, max } of FIELDS) {
    const v = (input as Record<string, unknown>)[k];
    if (v === undefined || v === null || v === '') continue;
    if (typeof v !== 'string') return { ok: false, error: 'Invalid ' + k };
    const t = (k === 'extraClause' || k.startsWith('notice') ? v : v.replace(/\s*\n\s*/g, ' ')).trim();
    if (t.length > max) return { ok: false, error: k + ' is too long' };
    if (t) out[k] = t;
  }
  return { ok: true, override: out };
}

export function mergeProfile(code: string | null | undefined, override: LegalOverride | null | undefined): LegalProfile {
  const base = defaultProfile(code);
  if (!override) return base;
  const merged = { ...base };
  for (const { k } of FIELDS) {
    const v = override[k];
    if (typeof v === 'string' && v.trim()) merged[k] = v.trim();
  }
  return merged;
}
