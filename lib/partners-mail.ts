import type { NavLanguage } from './nav-i18n';
import { pt } from './partners-i18n';

// The e-mails a partner gets: the team's decision on the application, a pause or return, and a paid commission.
// Pure text building (nothing is sent here).
export const PARTNER_MAIL_KINDS = ['approved', 'rejected', 'suspended', 'reinstated', 'paid'] as const;
export type PartnerMailKind = (typeof PARTNER_MAIL_KINDS)[number];

type Row = Record<NavLanguage, string>;
const r = (en: string, ar: string, fr: string, es: string, pt: string, ur: string, zh: string): Row => ({ en, ar, fr, es, pt, ur, zh });

const SUBJECT: Record<PartnerMailKind, Row> = {
  approved: r('Your partner application is approved', 'تمت الموافقة على طلب شراكتك', 'Votre demande de partenariat est approuvée', 'Tu solicitud de socio fue aprobada', 'Seu pedido de parceria foi aprovado', 'آپ کی شراکت کی درخواست منظور ہو گئی', '您的合作伙伴申请已通过'),
  rejected: r('Your partner application was not approved', 'لم تتم الموافقة على طلب شراكتك', 'Votre demande de partenariat n’a pas été approuvée', 'Tu solicitud de socio no fue aprobada', 'Seu pedido de parceria não foi aprovado', 'آپ کی شراکت کی درخواست منظور نہیں ہوئی', '您的合作伙伴申请未通过'),
  suspended: r('Your partner account is paused', 'تم إيقاف حساب الشريك مؤقتًا', 'Votre compte partenaire est suspendu', 'Tu cuenta de socio está en pausa', 'Sua conta de parceiro está pausada', 'آپ کا پارٹنر اکاؤنٹ معطل ہے', '您的合作伙伴账户已暂停'),
  reinstated: r('Your partner account is active again', 'تمت إعادة تفعيل حساب الشريك', 'Votre compte partenaire est de nouveau actif', 'Tu cuenta de socio está activa de nuevo', 'Sua conta de parceiro está ativa novamente', 'آپ کا پارٹنر اکاؤنٹ دوبارہ فعال ہے', '您的合作伙伴账户已恢复'),
  paid: r('A commission was paid to you', 'تم دفع عمولة لك', 'Une commission vous a été versée', 'Se te pagó una comisión', 'Uma comissão foi paga a você', 'آپ کو کمیشن ادا کر دیا گیا', '已向您支付佣金'),
};

const BODY: Record<PartnerMailKind, Row> = {
  approved: r('Welcome aboard! Your partner account is active. Open the Partners page to get your invite link.', 'أهلًا بك! حساب الشريك الخاص بك أصبح فعّالًا. افتح صفحة الشركاء للحصول على رابط الدعوة.', 'Bienvenue ! Votre compte partenaire est actif. Ouvrez la page Partenaires pour obtenir votre lien d’invitation.', '¡Bienvenido! Tu cuenta de socio está activa. Abre la página de Socios para obtener tu enlace de invitación.', 'Bem-vindo! Sua conta de parceiro está ativa. Abra a página Parceiros para obter seu link de convite.', 'خوش آمدید! آپ کا پارٹنر اکاؤنٹ فعال ہے۔ دعوتی لنک کے لیے شراکت داروں کا صفحہ کھولیں۔', '欢迎加入！您的合作伙伴账户已启用。请打开“合作伙伴”页面获取邀请链接。'),
  rejected: r('We could not approve your application. You can update your details and apply again.', 'تعذّرت الموافقة على طلبك. يمكنك تعديل بياناتك والتقديم من جديد.', 'Nous n’avons pas pu approuver votre demande. Vous pouvez corriger vos informations et postuler à nouveau.', 'No pudimos aprobar tu solicitud. Puedes actualizar tus datos y volver a solicitar.', 'Não foi possível aprovar seu pedido. Você pode atualizar seus dados e se candidatar de novo.', 'ہم آپ کی درخواست منظور نہیں کر سکے۔ آپ تفصیلات درست کر کے دوبارہ درخواست دے سکتے ہیں۔', '我们无法通过您的申请。您可以修改信息后重新申请。'),
  suspended: r('Your partner account has been paused. Please contact support for details.', 'تم إيقاف حساب الشريك مؤقتًا. تواصل مع الدعم لمعرفة التفاصيل.', 'Votre compte partenaire a été suspendu. Contactez le support pour plus de détails.', 'Tu cuenta de socio se ha puesto en pausa. Contacta con soporte para más detalles.', 'Sua conta de parceiro foi pausada. Fale com o suporte para saber mais.', 'آپ کا پارٹنر اکاؤنٹ معطل کر دیا گیا ہے۔ تفصیل کے لیے سپورٹ سے رابطہ کریں۔', '您的合作伙伴账户已暂停，详情请联系客服。'),
  reinstated: r('Good news: your partner account is active again.', 'خبر سارة: حساب الشريك الخاص بك فعّال من جديد.', 'Bonne nouvelle : votre compte partenaire est de nouveau actif.', 'Buenas noticias: tu cuenta de socio está activa de nuevo.', 'Boas notícias: sua conta de parceiro está ativa novamente.', 'خوشخبری: آپ کا پارٹنر اکاؤنٹ دوبارہ فعال ہے۔', '好消息：您的合作伙伴账户已恢复。'),
  paid: r('We paid you a commission of {amount}. Thank you for partnering with RE.', 'تم دفع عمولة قدرها {amount} لك. شكرًا لشراكتك مع RE.', 'Nous vous avons versé une commission de {amount}. Merci de votre partenariat avec RE.', 'Te pagamos una comisión de {amount}. Gracias por asociarte con RE.', 'Pagamos a você uma comissão de {amount}. Obrigado por ser parceiro da RE.', 'ہم نے آپ کو {amount} کا کمیشن ادا کر دیا ہے۔ RE کے ساتھ شراکت کا شکریہ۔', '我们已向您支付 {amount} 的佣金。感谢您与RE合作。'),
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const isPartnerMailKind = (v: unknown): v is PartnerMailKind => typeof v === 'string' && (PARTNER_MAIL_KINDS as readonly string[]).includes(v);

export function buildPartnerMail(kind: PartnerMailKind, extra: { note?: string; amount?: string }, lang: NavLanguage, appUrl: string): { subject: string; html: string } {
  const pick = (row: Row) => row[lang] ?? row.en;
  const note = (extra.note ?? '').slice(0, 300).trim();
  const body = pick(BODY[kind]).replace('{amount}', (extra.amount ?? '').slice(0, 40)) + (note && kind !== 'paid' ? ` ${pt('noteLabel', lang)}: ${note}` : '');
  const rtl = lang === 'ar' || lang === 'ur';
  const link = appUrl.replace(/\/+$/, '');
  return {
    subject: pick(SUBJECT[kind]),
    html: `<div dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:sans-serif"><p>${esc(body)}</p><p><a href="${esc(link)}">${esc(link)}</a></p></div>`,
  };
}
