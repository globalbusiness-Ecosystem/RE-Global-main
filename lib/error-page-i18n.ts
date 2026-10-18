import type { NavLanguage } from './nav-i18n';

export interface ErrorPageStrings {
  errorTitle: string;
  errorBody: string;
  retry: string;
  home: string;
  notFoundTitle: string;
  notFoundBody: string;
}

export const ERROR_PAGE_I18N: Record<NavLanguage, ErrorPageStrings> = {
  en: { errorTitle: 'Something went wrong', errorBody: 'We hit an unexpected problem and have been notified. Your money and data are safe. Please try again.', retry: 'Try again', home: 'Back to home', notFoundTitle: 'Page not found', notFoundBody: 'This page does not exist or was moved.' },
  ar: { errorTitle: 'حصلت مشكلة', errorBody: 'حصلت مشكلة غير متوقعة وتم إبلاغنا بيها. فلوسك وبياناتك في أمان. حاول تاني.', retry: 'حاول تاني', home: 'الرجوع للرئيسية', notFoundTitle: 'الصفحة مش موجودة', notFoundBody: 'الصفحة دي مش موجودة أو اتنقلت.' },
  fr: { errorTitle: "Une erreur s'est produite", errorBody: "Un problème inattendu est survenu et nous avons été prévenus. Votre argent et vos données sont en sécurité. Veuillez réessayer.", retry: 'Réessayer', home: "Retour à l'accueil", notFoundTitle: 'Page introuvable', notFoundBody: "Cette page n'existe pas ou a été déplacée." },
  es: { errorTitle: 'Algo salió mal', errorBody: 'Tuvimos un problema inesperado y ya fuimos avisados. Tu dinero y tus datos están seguros. Inténtalo de nuevo.', retry: 'Reintentar', home: 'Volver al inicio', notFoundTitle: 'Página no encontrada', notFoundBody: 'Esta página no existe o fue movida.' },
  pt: { errorTitle: 'Algo deu errado', errorBody: 'Tivemos um problema inesperado e fomos avisados. Seu dinheiro e seus dados estão seguros. Tente novamente.', retry: 'Tentar novamente', home: 'Voltar ao início', notFoundTitle: 'Página não encontrada', notFoundBody: 'Esta página não existe ou foi movida.' },
  ur: { errorTitle: 'کچھ غلط ہو گیا', errorBody: 'ایک غیر متوقع مسئلہ پیش آیا اور ہمیں اطلاع مل گئی ہے۔ آپ کی رقم اور ڈیٹا محفوظ ہیں۔ دوبارہ کوشش کریں۔', retry: 'دوبارہ کوشش کریں', home: 'ہوم پر واپس جائیں', notFoundTitle: 'صفحہ نہیں ملا', notFoundBody: 'یہ صفحہ موجود نہیں یا منتقل ہو گیا ہے۔' },
  zh: { errorTitle: '出错了', errorBody: '我们遇到了意外问题，并已收到通知。您的资金和数据是安全的。请重试。', retry: '重试', home: '返回首页', notFoundTitle: '页面未找到', notFoundBody: '此页面不存在或已被移动。' },
};
