import type { NavLanguage } from './nav-i18n';

// The host's public reply under a guest review. Pure rules: no Firebase, safe for the browser and the server.
export const REPLY_MAX = 400;

export type ReplyCheck = { ok: true; reply: string } | { ok: false; error: string };

// An empty reply is allowed: it removes the reply.
export function validateReply(raw: unknown): ReplyCheck {
  if (raw !== undefined && raw !== null && typeof raw !== 'string') return { ok: false, error: 'Invalid reply' };
  const reply = typeof raw === 'string' ? raw.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, REPLY_MAX) : '';
  return { ok: true, reply };
}

export const REPLY_I18N: Record<NavLanguage, string> = {
  en: 'Reply from the host', ar: 'رد الإدارة', fr: 'Réponse de l’établissement', es: 'Respuesta del anfitrión',
  pt: 'Resposta do anfitrião', ur: 'میزبان کا جواب', zh: '房东回复',
};
export const replyLabel = (lang: string) => REPLY_I18N[lang as NavLanguage] ?? REPLY_I18N.en;

// How often the host answers: the share of visible reviews that have a reply, in whole percent.
// It is only shown once there are enough reviews for the number to mean something.
export const RATE_MIN_REVIEWS = 5;
export function responseRate(rows: { reply: string }[]): number | null {
  if (rows.length < RATE_MIN_REVIEWS) return null;
  return Math.round((rows.filter((r) => r.reply.trim()).length / rows.length) * 100);
}

// {n} is replaced by the percentage.
export const RATE_I18N: Record<NavLanguage, string> = {
  en: 'The host replies to {n}% of reviews', ar: 'الإدارة بترد على {n}% من التقييمات', fr: 'L’établissement répond à {n} % des avis',
  es: 'El anfitrión responde al {n} % de las opiniones', pt: 'O anfitrião responde a {n}% das avaliações', ur: 'میزبان {n}% جائزوں کا جواب دیتا ہے', zh: '房东回复了 {n}% 的评价',
};
export const rateLabel = (lang: string, n: number) => (RATE_I18N[lang as NavLanguage] ?? RATE_I18N.en).replace('{n}', String(n));
