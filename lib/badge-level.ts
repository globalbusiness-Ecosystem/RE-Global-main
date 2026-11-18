// Seven badge levels, each with its own colour. The level comes from the activity score: the same reward points
// a member earns from completed stays, purchases, reviews and invited friends (see lib/rewards.ts).

export const BADGE_LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
export type BadgeLevel = (typeof BADGE_LEVELS)[number];

// Points needed to reach each level (index 0 = level 1).
export const BADGE_THRESHOLDS: readonly number[] = [0, 100, 300, 700, 1500, 3000, 6000];

// Light, main and dark shade of each level's seal.
export const BADGE_COLORS: Record<BadgeLevel, { light: string; main: string; dark: string }> = {
  1: { light: '#e8b27d', main: '#cd7f32', dark: '#8a4f17' }, // bronze
  2: { light: '#f1f1f1', main: '#b8bcc4', dark: '#7d828c' }, // silver
  3: { light: '#f6e08a', main: '#d4af37', dark: '#a8821c' }, // gold
  4: { light: '#6ee7b7', main: '#10b981', dark: '#047857' }, // emerald
  5: { light: '#93c5fd', main: '#3b82f6', dark: '#1d4ed8' }, // sapphire
  6: { light: '#d8b4fe', main: '#a855f7', dark: '#7e22ce' }, // amethyst
  7: { light: '#fda4af', main: '#e11d48', dark: '#9f1239' }, // ruby
};

const NAMES: Record<string, string[]> = {
  en: ['Bronze', 'Silver', 'Gold', 'Emerald', 'Sapphire', 'Amethyst', 'Ruby'],
  ar: ['برونزي', 'فضي', 'ذهبي', 'زمردي', 'ياقوتي أزرق', 'أرجواني', 'ياقوتي أحمر'],
  fr: ['Bronze', 'Argent', 'Or', 'Émeraude', 'Saphir', 'Améthyste', 'Rubis'],
  es: ['Bronce', 'Plata', 'Oro', 'Esmeralda', 'Zafiro', 'Amatista', 'Rubí'],
  pt: ['Bronze', 'Prata', 'Ouro', 'Esmeralda', 'Safira', 'Ametista', 'Rubi'],
  ur: ['کانسی', 'چاندی', 'سونا', 'زمرد', 'نیلم', 'جمشت', 'یاقوت'],
  zh: ['青铜', '白银', '黄金', '祖母绿', '蓝宝石', '紫水晶', '红宝石'],
};

const LEVEL_WORD: Record<string, string> = { en: 'Level', ar: 'المستوى', fr: 'Niveau', es: 'Nivel', pt: 'Nível', ur: 'درجہ', zh: '等级' };

export const badgeLevelName = (level: BadgeLevel, language?: string): string => (NAMES[language ?? 'en'] ?? NAMES.en)[level - 1];
export const badgeLevelLabel = (level: BadgeLevel, language?: string): string => `${LEVEL_WORD[language ?? 'en'] ?? LEVEL_WORD.en} ${level} · ${badgeLevelName(level, language)}`;

/** Level 1 to 7 for an activity score. Bad input counts as no activity (level 1). */
export function badgeLevelFor(points: unknown, thresholds: readonly number[] = BADGE_THRESHOLDS): BadgeLevel {
  const p = typeof points === 'number' && Number.isFinite(points) ? points : 0;
  let lvl = 1;
  thresholds.forEach((t, i) => { if (p >= t) lvl = i + 1; });
  return lvl as BadgeLevel;
}

export const MAX_BADGE_POINTS = 10_000_000;

/** The admin's seven thresholds: whole numbers, the first is 0, each one higher than the one before. null when anything is wrong. */
export function parseThresholds(raw: unknown): number[] | null {
  if (!Array.isArray(raw) || raw.length !== 7) return null;
  const n = raw.map((v) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN));
  if (n.some((x) => !Number.isInteger(x) || x < 0 || x > MAX_BADGE_POINTS)) return null;
  if (n[0] !== 0) return null;
  for (let i = 1; i < 7; i++) if (n[i] <= n[i - 1]) return null;
  return n;
}

/** Points left to the next level, or null at the top. */
export const pointsToNextBadge = (points: number, thresholds: readonly number[] = BADGE_THRESHOLDS): number | null => {
  const lvl = badgeLevelFor(points, thresholds);
  return lvl >= 7 ? null : thresholds[lvl] - Math.max(0, points);
};

export const parseBadgeLevel = (v: unknown): BadgeLevel => (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 7 ? (v as BadgeLevel) : 1);
