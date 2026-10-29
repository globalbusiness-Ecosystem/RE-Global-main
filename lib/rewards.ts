import type { NavLanguage } from './nav-i18n';

// Rewards program: points from real, verified activity, and four levels. The admin sets the points and the
// level thresholds; the benefits of each level are plain text the admin writes (nothing is promised by default).

export const TIER_IDS = ['bronze', 'silver', 'gold', 'platinum'] as const;
export type TierId = (typeof TIER_IDS)[number];

export type Rules = {
  points: { stay: number; purchase: number; review: number; referral: number };
  tiers: Record<TierId, number>;
  benefits: Record<TierId, string>;
};

export const POINTS_MAX = 10_000;
export const TIER_MAX = 10_000_000;
export const BENEFIT_MAX = 200;
// At most this many invited friends are checked and rewarded per member.
export const REFERRAL_CAP = 50;
// Contracts of these types are property purchases. Stays are counted from bookings; resale is left out on purpose.
export const PURCHASE_TYPES = ['buy', 'offplan', 'abroad', 'tokenized', 'invest'];

export const DEFAULT_RULES: Rules = {
  points: { stay: 100, purchase: 500, review: 20, referral: 50 },
  tiers: { bronze: 0, silver: 300, gold: 1000, platinum: 3000 },
  benefits: { bronze: '', silver: '', gold: '', platinum: '' },
};

const whole = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isInteger(n) ? n : null;
};

const cleanText = (v: unknown) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, BENEFIT_MAX) : '');

// Strict check for what the admin saves. null when anything is wrong.
export function parseRules(raw: unknown): Rules | null {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  const p = (r.points && typeof r.points === 'object' ? r.points : {}) as Record<string, unknown>;
  const t = (r.tiers && typeof r.tiers === 'object' ? r.tiers : {}) as Record<string, unknown>;
  const b = (r.benefits && typeof r.benefits === 'object' ? r.benefits : {}) as Record<string, unknown>;
  const stay = whole(p.stay), purchase = whole(p.purchase), review = whole(p.review);
  // Older saved rules have no referral points: use the default.
  const referral = p.referral === undefined || p.referral === null || p.referral === '' ? DEFAULT_RULES.points.referral : whole(p.referral);
  const silver = whole(t.silver), gold = whole(t.gold), platinum = whole(t.platinum);
  if (stay === null || purchase === null || review === null || referral === null || silver === null || gold === null || platinum === null) return null;
  for (const n of [stay, purchase, review, referral]) if (n < 0 || n > POINTS_MAX) return null;
  if (!(silver > 0 && gold > silver && platinum > gold && platinum <= TIER_MAX)) return null;
  return {
    points: { stay, purchase, review, referral },
    tiers: { bronze: 0, silver, gold, platinum },
    benefits: { bronze: cleanText(b.bronze), silver: cleanText(b.silver), gold: cleanText(b.gold), platinum: cleanText(b.platinum) },
  };
}

// Lenient read of a stored document: anything invalid falls back to the defaults.
export const readRules = (raw: unknown): Rules => parseRules(raw) ?? DEFAULT_RULES;

export type Counts = { stays: number; purchases: number; reviews: number; referrals: number };

export const pointsFor = (c: Counts, rules: Rules): number =>
  c.stays * rules.points.stay + c.purchases * rules.points.purchase + c.reviews * rules.points.review + c.referrals * rules.points.referral;

export function tierFor(points: number, rules: Rules): TierId {
  let cur: TierId = 'bronze';
  for (const id of TIER_IDS) if (points >= rules.tiers[id]) cur = id;
  return cur;
}

export function progress(points: number, rules: Rules): { tier: TierId; next: TierId | null; remaining: number; pct: number } {
  const tier = tierFor(points, rules);
  const i = TIER_IDS.indexOf(tier);
  const next = i < TIER_IDS.length - 1 ? TIER_IDS[i + 1] : null;
  if (!next) return { tier, next: null, remaining: 0, pct: 100 };
  const lo = rules.tiers[tier];
  const hi = rules.tiers[next];
  const pct = Math.max(0, Math.min(100, Math.floor(((points - lo) / (hi - lo)) * 100)));
  return { tier, next, remaining: hi - points, pct };
}

// A stay counts once it is over and still confirmed (cancelled or under-review bookings earn nothing).
export const countStays = (rows: { status?: unknown; end?: unknown }[], today: string): number =>
  rows.filter((r) => r.status === 'confirmed' && typeof r.end === 'string' && r.end <= today).length;

export const countPurchases = (rows: { status?: unknown; type?: unknown }[]): number =>
  rows.filter((r) => r.status === 'completed' && typeof r.type === 'string' && PURCHASE_TYPES.includes(r.type)).length;

export interface RewardStrings {
  title: string; points: string; unit: string; levels: string; yourLevel: string; nextLevel: string; topLevel: string; howTitle: string;
  stay: string; purchase: string; review: string; perEach: string; benefits: string; yourActivity: string; start: string; signIn: string; loadError: string; loading: string;
  bronze: string; silver: string; gold: string; platinum: string; from: string;
  referral: string; inviteTitle: string; inviteLine: string; codeTitle: string; codeHint: string; codePlaceholder: string; apply: string; applied: string;
  errNotFound: string; errOwn: string; errAlready: string; errNotNew: string; errMutual: string; errInvalid: string;
}
// {n} is a number, {tier} a level name.
export const REWARD_I18N: Record<NavLanguage, RewardStrings> = {
  en: { title: 'Rewards', points: 'Your points', unit: 'pts', levels: 'Levels', yourLevel: 'Your level', nextLevel: '{n} points to reach {tier}', topLevel: 'You are at the top level', howTitle: 'How you earn points', stay: 'Completed stay', purchase: 'Property purchase', review: 'Review of a stay', perEach: '{n} pts each', benefits: 'Benefits', yourActivity: 'Your activity', start: 'Your points start with your first completed stay.', signIn: 'Sign in with Pi to see your rewards.', loadError: 'Could not load your rewards.', loading: 'Loading...', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum', from: 'from {n} pts', referral: 'Invited friend who completed a stay or purchase', inviteTitle: 'Invite friends', inviteLine: '{n} invited, {m} completed a stay or purchase', codeTitle: "Got a friend's code?", codeHint: 'Enter it once, before your first booking or purchase. Your friend earns points when you complete a stay or purchase.', codePlaceholder: 'Friend code', apply: 'Apply code', applied: 'Code applied. Thank you!', errNotFound: 'This code does not exist.', errOwn: 'You cannot use your own code.', errAlready: 'You already used a code.', errNotNew: 'Codes can only be used before your first booking or purchase.', errMutual: 'This friend already used your code.', errInvalid: 'Check the code and try again.' },
  ar: { title: 'المكافآت', points: 'نقاطك', unit: 'نقطة', levels: 'المستويات', yourLevel: 'مستواك', nextLevel: 'باقي {n} نقطة وتوصل لـ {tier}', topLevel: 'إنت في أعلى مستوى', howTitle: 'إزاي تكسب نقاط', stay: 'إقامة مكتملة', purchase: 'شراء عقار', review: 'تقييم إقامة', perEach: '{n} نقطة لكل واحدة', benefits: 'المزايا', yourActivity: 'نشاطك', start: 'نقاطك بتبدأ من أول إقامة مكتملة.', signIn: 'سجّل دخولك بـ Pi عشان تشوف مكافآتك.', loadError: 'مقدرناش نحمّل مكافآتك.', loading: '...جاري التحميل', bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني', from: 'من {n} نقطة', referral: 'صديق دعيته وخلّص إقامة أو شراء', inviteTitle: 'ادعُ أصدقاءك', inviteLine: 'دعيت {n}، و{m} منهم خلّصوا إقامة أو شراء', codeTitle: 'معاك كود من صديق؟', codeHint: 'اكتبه مرة واحدة قبل أول حجز أو شراء ليك. صديقك بياخد نقاط لما تخلّص إقامة أو شراء.', codePlaceholder: 'كود الصديق', apply: 'تطبيق الكود', applied: 'اتطبق الكود. شكراً!', errNotFound: 'الكود ده مش موجود.', errOwn: 'مينفعش تستخدم كودك إنت.', errAlready: 'إنت استخدمت كود قبل كده.', errNotNew: 'الكود بيتستخدم بس قبل أول حجز أو شراء ليك.', errMutual: 'الصديق ده استخدم كودك قبل كده.', errInvalid: 'راجع الكود وجرّب تاني.' },
  fr: { title: 'Récompenses', points: 'Vos points', unit: 'pts', levels: 'Niveaux', yourLevel: 'Votre niveau', nextLevel: '{n} points pour atteindre {tier}', topLevel: 'Vous avez atteint le niveau maximal', howTitle: 'Comment gagner des points', stay: 'Séjour terminé', purchase: 'Achat de bien', review: 'Avis sur un séjour', perEach: '{n} pts chacun', benefits: 'Avantages', yourActivity: 'Votre activité', start: 'Vos points commencent avec votre premier séjour terminé.', signIn: 'Connectez-vous avec Pi pour voir vos récompenses.', loadError: 'Impossible de charger vos récompenses.', loading: 'Chargement...', bronze: 'Bronze', silver: 'Argent', gold: 'Or', platinum: 'Platine', from: 'dès {n} pts', referral: 'Ami invité ayant terminé un séjour ou un achat', inviteTitle: 'Invitez des amis', inviteLine: '{n} invités, {m} ont terminé un séjour ou un achat', codeTitle: "Un code d'ami ?", codeHint: "Saisissez-le une seule fois, avant votre première réservation ou achat. Votre ami gagne des points quand vous terminez un séjour ou un achat.", codePlaceholder: "Code d'ami", apply: 'Appliquer le code', applied: 'Code appliqué. Merci !', errNotFound: "Ce code n'existe pas.", errOwn: 'Vous ne pouvez pas utiliser votre propre code.', errAlready: 'Vous avez déjà utilisé un code.', errNotNew: "Un code ne peut être utilisé qu'avant votre première réservation ou achat.", errMutual: 'Cet ami a déjà utilisé votre code.', errInvalid: 'Vérifiez le code et réessayez.' },
  es: { title: 'Recompensas', points: 'Tus puntos', unit: 'pts', levels: 'Niveles', yourLevel: 'Tu nivel', nextLevel: '{n} puntos para llegar a {tier}', topLevel: 'Estás en el nivel más alto', howTitle: 'Cómo ganar puntos', stay: 'Estancia completada', purchase: 'Compra de propiedad', review: 'Reseña de una estancia', perEach: '{n} pts cada una', benefits: 'Beneficios', yourActivity: 'Tu actividad', start: 'Tus puntos empiezan con tu primera estancia completada.', signIn: 'Inicia sesión con Pi para ver tus recompensas.', loadError: 'No se pudieron cargar tus recompensas.', loading: 'Cargando...', bronze: 'Bronce', silver: 'Plata', gold: 'Oro', platinum: 'Platino', from: 'desde {n} pts', referral: 'Amigo invitado que completó una estancia o compra', inviteTitle: 'Invita a amigos', inviteLine: '{n} invitados, {m} completaron una estancia o compra', codeTitle: '¿Tienes el código de un amigo?', codeHint: 'Introdúcelo una sola vez, antes de tu primera reserva o compra. Tu amigo gana puntos cuando completes una estancia o compra.', codePlaceholder: 'Código del amigo', apply: 'Aplicar código', applied: 'Código aplicado. ¡Gracias!', errNotFound: 'Este código no existe.', errOwn: 'No puedes usar tu propio código.', errAlready: 'Ya usaste un código.', errNotNew: 'Los códigos solo se pueden usar antes de tu primera reserva o compra.', errMutual: 'Este amigo ya usó tu código.', errInvalid: 'Revisa el código e inténtalo de nuevo.' },
  pt: { title: 'Recompensas', points: 'Seus pontos', unit: 'pts', levels: 'Níveis', yourLevel: 'Seu nível', nextLevel: '{n} pontos para chegar a {tier}', topLevel: 'Você está no nível mais alto', howTitle: 'Como ganhar pontos', stay: 'Estadia concluída', purchase: 'Compra de imóvel', review: 'Avaliação de uma estadia', perEach: '{n} pts cada', benefits: 'Benefícios', yourActivity: 'Sua atividade', start: 'Seus pontos começam com a primeira estadia concluída.', signIn: 'Entre com Pi para ver suas recompensas.', loadError: 'Não foi possível carregar suas recompensas.', loading: 'Carregando...', bronze: 'Bronze', silver: 'Prata', gold: 'Ouro', platinum: 'Platina', from: 'a partir de {n} pts', referral: 'Amigo convidado que concluiu uma estadia ou compra', inviteTitle: 'Convide amigos', inviteLine: '{n} convidados, {m} concluíram uma estadia ou compra', codeTitle: 'Tem o código de um amigo?', codeHint: 'Digite uma única vez, antes da sua primeira reserva ou compra. Seu amigo ganha pontos quando você concluir uma estadia ou compra.', codePlaceholder: 'Código do amigo', apply: 'Aplicar código', applied: 'Código aplicado. Obrigado!', errNotFound: 'Este código não existe.', errOwn: 'Você não pode usar o seu próprio código.', errAlready: 'Você já usou um código.', errNotNew: 'Os códigos só podem ser usados antes da sua primeira reserva ou compra.', errMutual: 'Este amigo já usou o seu código.', errInvalid: 'Confira o código e tente novamente.' },
  ur: { title: 'انعامات', points: 'آپ کے پوائنٹس', unit: 'پوائنٹس', levels: 'درجے', yourLevel: 'آپ کا درجہ', nextLevel: '{tier} تک پہنچنے کے لیے {n} پوائنٹس باقی', topLevel: 'آپ سب سے اونچے درجے پر ہیں', howTitle: 'پوائنٹس کیسے کمائیں', stay: 'مکمل قیام', purchase: 'جائیداد کی خریداری', review: 'قیام کا جائزہ', perEach: 'ہر ایک کے {n} پوائنٹس', benefits: 'فوائد', yourActivity: 'آپ کی سرگرمی', start: 'آپ کے پوائنٹس پہلے مکمل قیام سے شروع ہوتے ہیں۔', signIn: 'انعامات دیکھنے کے لیے Pi سے سائن اِن کریں۔', loadError: 'آپ کے انعامات لوڈ نہیں ہو سکے۔', loading: '...لوڈ ہو رہا ہے', bronze: 'کانسی', silver: 'چاندی', gold: 'سونا', platinum: 'پلاٹینم', from: '{n} پوائنٹس سے', referral: 'مدعو دوست جس نے قیام یا خریداری مکمل کی', inviteTitle: 'دوستوں کو مدعو کریں', inviteLine: '{n} مدعو، {m} نے قیام یا خریداری مکمل کی', codeTitle: 'کیا دوست کا کوڈ ہے؟', codeHint: 'اسے ایک بار درج کریں، پہلی بکنگ یا خریداری سے پہلے۔ جب آپ قیام یا خریداری مکمل کریں گے تو آپ کے دوست کو پوائنٹس ملیں گے۔', codePlaceholder: 'دوست کا کوڈ', apply: 'کوڈ لگائیں', applied: 'کوڈ لگ گیا۔ شکریہ!', errNotFound: 'یہ کوڈ موجود نہیں۔', errOwn: 'آپ اپنا کوڈ استعمال نہیں کر سکتے۔', errAlready: 'آپ پہلے ہی کوڈ استعمال کر چکے ہیں۔', errNotNew: 'کوڈ صرف پہلی بکنگ یا خریداری سے پہلے استعمال ہو سکتا ہے۔', errMutual: 'اس دوست نے پہلے ہی آپ کا کوڈ استعمال کیا ہے۔', errInvalid: 'کوڈ چیک کر کے دوبارہ کوشش کریں۔' },
  zh: { title: '奖励', points: '你的积分', unit: '分', levels: '等级', yourLevel: '你的等级', nextLevel: '再获得 {n} 分即可升到{tier}', topLevel: '你已达到最高等级', howTitle: '如何获得积分', stay: '完成的入住', purchase: '购买房产', review: '入住评价', perEach: '每次 {n} 分', benefits: '权益', yourActivity: '你的活动', start: '完成第一次入住后开始累积积分。', signIn: '使用 Pi 登录以查看你的奖励。', loadError: '无法加载你的奖励。', loading: '加载中...', bronze: '青铜', silver: '白银', gold: '黄金', platinum: '铂金', from: '{n} 分起', referral: '受邀好友完成入住或购买', inviteTitle: '邀请好友', inviteLine: '已邀请 {n} 位，其中 {m} 位完成了入住或购买', codeTitle: '有好友的邀请码吗？', codeHint: '请在你第一次预订或购买之前输入一次。你完成入住或购买后，好友将获得积分。', codePlaceholder: '好友邀请码', apply: '使用邀请码', applied: '邀请码已使用，谢谢！', errNotFound: '该邀请码不存在。', errOwn: '不能使用自己的邀请码。', errAlready: '你已经使用过邀请码。', errNotNew: '邀请码只能在第一次预订或购买之前使用。', errMutual: '这位好友已经使用过你的邀请码。', errInvalid: '请检查邀请码后重试。' },
};
// A friend code is letters and digits only (4 to 12). Anything else is not a code.
export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const c = raw.trim().toUpperCase();
  return /^[A-Z0-9]{4,12}$/.test(c) ? c : null;
}

export type ReferralError = 'notFound' | 'own' | 'already' | 'notNew' | 'mutual' | 'invalid';

export const rewardStrings = (lang: string): RewardStrings => REWARD_I18N[lang as NavLanguage] ?? REWARD_I18N.en;
export const tierName = (lang: string, id: TierId): string => rewardStrings(lang)[id];
