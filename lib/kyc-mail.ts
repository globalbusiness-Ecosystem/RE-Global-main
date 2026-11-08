import { kl } from './kyc-labels';

// The e-mail a person gets when the team decides on their identity check. Pure text building (no sending here).
const SUPPORTED = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
export type MailLang = (typeof SUPPORTED)[number];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** First language of an Accept-Language header that we have texts for; English otherwise. */
export function pickMailLang(header: string | null | undefined): MailLang {
  if (typeof header !== 'string') return 'en';
  for (const part of header.split(',').slice(0, 8)) {
    const tag = part.split(';')[0].trim().toLowerCase().split('-')[0];
    const hit = SUPPORTED.find((l) => l === tag);
    if (hit) return hit;
  }
  return 'en';
}

export const isMailLang = (v: unknown): v is MailLang => typeof v === 'string' && (SUPPORTED as readonly string[]).includes(v);

export function buildKycMail(decision: 'approved' | 'rejected', reason: string, lang: MailLang, appUrl: string): { subject: string; html: string } {
  const body = kl(decision, lang, { reason: reason.slice(0, 300) });
  const rtl = lang === 'ar' || lang === 'ur';
  const link = `${appUrl.replace(/\/+$/, '')}/kyc`;
  return {
    subject: kl(decision === 'approved' ? 'mailApprovedSubject' : 'mailRejectedSubject', lang),
    html: `<div dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:sans-serif"><p>${esc(body)}</p><p><a href="${esc(link)}">${esc(link)}</a></p></div>`,
  };
}
