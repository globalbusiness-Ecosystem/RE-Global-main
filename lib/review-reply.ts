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
