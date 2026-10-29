import type { NavLanguage } from './nav-i18n';

// Rewards program: points from real, verified activity, and four levels. The admin sets the points and the
// level thresholds; the benefits of each level are plain text the admin writes (nothing is promised by default).

export const TIER_IDS = ['bronze', 'silver', 'gold', 'platinum'] as const;
export type TierId = (typeof TIER_IDS)[number];

export type Rules = {
  points: { stay: number; purchase: number; review: number };
  tiers: Record<TierId, number>;
  benefits: Record<TierId, string>;
};

export const POINTS_MAX = 10_000;
export const TIER_MAX = 10_000_000;
export const BENEFIT_MAX = 200;
// Contracts of these types are property purchases. Stays are counted from bookings; resale is left out on purpose.
export const PURCHASE_TYPES = ['buy', 'offplan', 'abroad', 'tokenized', 'invest'];

export const DEFAULT_RULES: Rules = {
  points: { stay: 100, purchase: 500, review: 20 },
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
  const silver = whole(t.silver), gold = whole(t.gold), platinum = whole(t.platinum);
  if (stay === null || purchase === null || review === null || silver === null || gold === null || platinum === null) return null;
  for (const n of [stay, purchase, review]) if (n < 0 || n > POINTS_MAX) return null;
  if (!(silver > 0 && gold > silver && platinum > gold && platinum <= TIER_MAX)) return null;
  return {
    points: { stay, purchase, review },
    tiers: { bronze: 0, silver, gold, platinum },
    benefits: { bronze: cleanText(b.bronze), silver: cleanText(b.silver), gold: cleanText(b.gold), platinum: cleanText(b.platinum) },
  };
}

// Lenient read of a stored document: anything invalid falls back to the defaults.
export const readRules = (raw: unknown): Rules => parseRules(raw) ?? DEFAULT_RULES;

export type Counts = { stays: number; purchases: number; reviews: number };

export const pointsFor = (c: Counts, rules: Rules): number =>
  c.stays * rules.points.stay + c.purchases * rules.points.purchase + c.reviews * rules.points.review;

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
}
// {n} is a number, {tier} a level name.
export const REWARD_I18N: Record<NavLanguage, RewardStrings> = {
  en: { title: 'Rewards', points: 'Your points', unit: 'pts', levels: 'Levels', yourLevel: 'Your level', nextLevel: '{n} points to reach {tier}', topLevel: 'You are at the top level', howTitle: 'How you earn points', stay: 'Completed stay', purchase: 'Property purchase', review: 'Review of a stay', perEach: '{n} pts each', benefits: 'Benefits', yourActivity: 'Your activity', start: 'Your points start with your first completed stay.', signIn: 'Sign in with Pi to see your rewards.', loadError: 'Could not load your rewards.', loading: 'Loading...', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum', from: 'from {n} pts' },
  ar: { title: 'المكافآت', points: 'نقاطك', unit: 'نقطة', levels: 'المستويات', yourLevel: 'مستواك', nextLevel: 'باقي {n} نقطة وتوصل لـ {tier}', topLevel: 'إنت في أعلى مستوى', howTitle: 'إزاي تكسب نقاط', stay: 'إقامة مكتملة', purchase: 'شراء عقار', review: 'تقييم إقامة', perEach: '{n} نقطة لكل واحدة', benefits: 'المزايا', yourActivity: 'نشاطك', start: 'نقاطك بتبدأ من أول إقامة مكتملة.', signIn: 'سجّل دخولك بـ Pi عشان تشوف مكافآتك.', loadError: 'مقدرناش نحمّل مكافآتك.', loading: '...جاري التحميل', bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني', from: 'من {n} نقطة' },
  fr: { title: 'Récompenses', points: 'Vos points', unit: 'pts', levels: 'Niveaux', yourLevel: 'Votre niveau', nextLevel: '{n} points pour atteindre {tier}', topLevel: 'Vous avez atteint le niveau maximal', howTitle: 'Comment gagner des points', stay: 'Séjour terminé', purchase: 'Achat de bien', review: 'Avis sur un séjour', perEach: '{n} pts chacun', benefits: 'Avantages', yourActivity: 'Votre activité', start: 'Vos points commencent avec votre premier séjour terminé.', signIn: 'Connectez-vous avec Pi pour voir vos récompenses.', loadError: 'Impossible de charger vos récompenses.', loading: 'Chargement...', bronze: 'Bronze', silver: 'Argent', gold: 'Or', platinum: 'Platine', from: 'dès {n} pts' },
  es: { title: 'Recompensas', points: 'Tus puntos', unit: 'pts', levels: 'Niveles', yourLevel: 'Tu nivel', nextLevel: '{n} puntos para llegar a {tier}', topLevel: 'Estás en el nivel más alto', howTitle: 'Cómo ganar puntos', stay: 'Estancia completada', purchase: 'Compra de propiedad', review: 'Reseña de una estancia', perEach: '{n} pts cada una', benefits: 'Beneficios', yourActivity: 'Tu actividad', start: 'Tus puntos empiezan con tu primera estancia completada.', signIn: 'Inicia sesión con Pi para ver tus recompensas.', loadError: 'No se pudieron cargar tus recompensas.', loading: 'Cargando...', bronze: 'Bronce', silver: 'Plata', gold: 'Oro', platinum: 'Platino', from: 'desde {n} pts' },
  pt: { title: 'Recompensas', points: 'Seus pontos', unit: 'pts', levels: 'Níveis', yourLevel: 'Seu nível', nextLevel: '{n} pontos para chegar a {tier}', topLevel: 'Você está no nível mais alto', howTitle: 'Como ganhar pontos', stay: 'Estadia concluída', purchase: 'Compra de imóvel', review: 'Avaliação de uma estadia', perEach: '{n} pts cada', benefits: 'Benefícios', yourActivity: 'Sua atividade', start: 'Seus pontos começam com a primeira estadia concluída.', signIn: 'Entre com Pi para ver suas recompensas.', loadError: 'Não foi possível carregar suas recompensas.', loading: 'Carregando...', bronze: 'Bronze', silver: 'Prata', gold: 'Ouro', platinum: 'Platina', from: 'a partir de {n} pts' },
  ur: { title: 'انعامات', points: 'آپ کے پوائنٹس', unit: 'پوائنٹس', levels: 'درجے', yourLevel: 'آپ کا درجہ', nextLevel: '{tier} تک پہنچنے کے لیے {n} پوائنٹس باقی', topLevel: 'آپ سب سے اونچے درجے پر ہیں', howTitle: 'پوائنٹس کیسے کمائیں', stay: 'مکمل قیام', purchase: 'جائیداد کی خریداری', review: 'قیام کا جائزہ', perEach: 'ہر ایک کے {n} پوائنٹس', benefits: 'فوائد', yourActivity: 'آپ کی سرگرمی', start: 'آپ کے پوائنٹس پہلے مکمل قیام سے شروع ہوتے ہیں۔', signIn: 'انعامات دیکھنے کے لیے Pi سے سائن اِن کریں۔', loadError: 'آپ کے انعامات لوڈ نہیں ہو سکے۔', loading: '...لوڈ ہو رہا ہے', bronze: 'کانسی', silver: 'چاندی', gold: 'سونا', platinum: 'پلاٹینم', from: '{n} پوائنٹس سے' },
  zh: { title: '奖励', points: '你的积分', unit: '分', levels: '等级', yourLevel: '你的等级', nextLevel: '再获得 {n} 分即可升到{tier}', topLevel: '你已达到最高等级', howTitle: '如何获得积分', stay: '完成的入住', purchase: '购买房产', review: '入住评价', perEach: '每次 {n} 分', benefits: '权益', yourActivity: '你的活动', start: '完成第一次入住后开始累积积分。', signIn: '使用 Pi 登录以查看你的奖励。', loadError: '无法加载你的奖励。', loading: '加载中...', bronze: '青铜', silver: '白银', gold: '黄金', platinum: '铂金', from: '{n} 分起' },
};
export const rewardStrings = (lang: string): RewardStrings => REWARD_I18N[lang as NavLanguage] ?? REWARD_I18N.en;
export const tierName = (lang: string, id: TierId): string => rewardStrings(lang)[id];
