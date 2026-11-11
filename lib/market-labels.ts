import type { NavLanguage } from './nav-i18n';

// Texts of the shares market page (/market), in all 7 languages.
// {total}, {fee} and {proceeds} are amounts in π.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const MARKET_LABELS = {
  title: { en: 'Shares market', ar: 'سوق الحصص', fr: 'Marché des parts', es: 'Mercado de participaciones', pt: 'Mercado de frações', ur: 'حصص کی مارکیٹ', zh: '份额市场' },
  back: { en: 'Back', ar: 'رجوع', fr: 'Retour', es: 'Volver', pt: 'Voltar', ur: 'واپس', zh: '返回' },
  forSale: { en: 'Shares for sale', ar: 'حصص للبيع', fr: 'Parts à vendre', es: 'Participaciones en venta', pt: 'Frações à venda', ur: 'برائے فروخت حصص', zh: '在售份额' },
  nothingForSale: { en: 'Nothing is for sale right now.', ar: 'لا توجد حصص معروضة حاليًا.', fr: 'Rien n’est en vente pour le moment.', es: 'No hay nada en venta por ahora.', pt: 'Não há nada à venda no momento.', ur: 'اس وقت کچھ فروخت کے لیے دستیاب نہیں۔', zh: '目前没有在售份额。' },
  sharesWord: { en: 'shares', ar: 'حصة', fr: 'parts', es: 'participaciones', pt: 'frações', ur: 'حصے', zh: '份' },
  someonePaying: { en: 'Someone is paying for this right now', ar: 'هناك من يدفع ثمنها الآن', fr: 'Quelqu’un est en train de payer', es: 'Alguien la está pagando ahora mismo', pt: 'Alguém está pagando por isto agora', ur: 'کوئی اس وقت اس کی ادائیگی کر رہا ہے', zh: '有人正在支付此份额' },
  myShares: { en: 'My shares', ar: 'حصصي', fr: 'Mes parts', es: 'Mis participaciones', pt: 'Minhas frações', ur: 'میرے حصص', zh: '我的份额' },
  noShares: { en: 'You do not own shares yet.', ar: 'لا تملك حصصًا بعد.', fr: 'Vous ne possédez pas encore de parts.', es: 'Aún no tienes participaciones.', pt: 'Você ainda não possui frações.', ur: 'آپ کے پاس ابھی کوئی حصص نہیں ہیں۔', zh: '您还没有份额。' },
  owned: { en: 'Owned', ar: 'ملكك', fr: 'Détenues', es: 'Propias', pt: 'Suas', ur: 'ملکیت', zh: '持有' },
  listed: { en: 'Listed', ar: 'معروض', fr: 'En vente', es: 'En venta', pt: 'À venda', ur: 'فہرست میں', zh: '已挂牌' },
  available: { en: 'Available', ar: 'متاح للبيع', fr: 'Disponibles', es: 'Disponibles', pt: 'Disponíveis', ur: 'دستیاب', zh: '可出售' },
  sell: { en: 'Sell', ar: 'اعرض للبيع', fr: 'Vendre', es: 'Vender', pt: 'Vender', ur: 'فروخت کریں', zh: '出售' },
  sharesLabel: { en: 'Shares', ar: 'عدد الحصص', fr: 'Parts', es: 'Participaciones', pt: 'Frações', ur: 'حصص', zh: '份额数量' },
  pricePerShare: { en: 'Price per share (π)', ar: 'سعر الحصة (π)', fr: 'Prix par part (π)', es: 'Precio por participación (π)', pt: 'Preço por fração (π)', ur: 'فی حصہ قیمت (π)', zh: '每份价格 (π)' },
  totalLine: { en: 'Total {total} π · fee {fee} π · you receive {proceeds} π', ar: 'الإجمالي {total} π · عمولة {fee} π · ستستلم {proceeds} π', fr: 'Total {total} π · frais {fee} π · vous recevez {proceeds} π', es: 'Total {total} π · comisión {fee} π · recibes {proceeds} π', pt: 'Total {total} π · taxa {fee} π · você recebe {proceeds} π', ur: 'کل {total} π · فیس {fee} π · آپ کو ملیں گے {proceeds} π', zh: '总计 {total} π · 手续费 {fee} π · 您将收到 {proceeds} π' },
  confirm: { en: 'Confirm', ar: 'تأكيد العرض', fr: 'Confirmer', es: 'Confirmar', pt: 'Confirmar', ur: 'تصدیق کریں', zh: '确认' },
  cancel: { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler', es: 'Cancelar', pt: 'Cancelar', ur: 'منسوخ کریں', zh: '取消' },
  listedOk: { en: 'Listed for sale ✅', ar: 'تم عرضها للبيع ✅', fr: 'Mis en vente ✅', es: 'Puesto en venta ✅', pt: 'Colocado à venda ✅', ur: 'فروخت کے لیے پیش کر دیا گیا ✅', zh: '已挂牌出售 ✅' },
  myListings: { en: 'My listings', ar: 'عروضي', fr: 'Mes annonces', es: 'Mis anuncios', pt: 'Meus anúncios', ur: 'میری پیشکشیں', zh: '我的挂牌' },
  cancelListing: { en: 'Cancel', ar: 'إلغاء العرض', fr: 'Annuler l’annonce', es: 'Cancelar anuncio', pt: 'Cancelar anúncio', ur: 'پیشکش منسوخ کریں', zh: '取消挂牌' },
  owedToMe: { en: 'Owed to me', ar: 'مستحقاتي', fr: 'Sommes dues', es: 'Pagos pendientes a mi favor', pt: 'Valores a receber', ur: 'میرے واجبات', zh: '应收款项' },
  refund: { en: 'Refund', ar: 'استرداد', fr: 'Remboursement', es: 'Reembolso', pt: 'Reembolso', ur: 'رقم کی واپسی', zh: '退款' },
  proceeds: { en: 'Sale proceeds', ar: 'حصيلة بيع', fr: 'Produit de la vente', es: 'Ingresos de la venta', pt: 'Receita da venda', ur: 'فروخت کی آمدنی', zh: '销售所得' },
  paid: { en: 'Paid', ar: 'تم التحويل', fr: 'Payé', es: 'Pagado', pt: 'Pago', ur: 'ادا ہو گئی', zh: '已支付' },
  pending: { en: 'Pending', ar: 'قيد التحويل', fr: 'En attente', es: 'Pendiente', pt: 'Pendente', ur: 'زیر التوا', zh: '待处理' },
  manualNote: { en: 'The platform team sends these by hand.', ar: 'يتم التحويل يدويًا من فريق المنصة.', fr: 'L’équipe de la plateforme les envoie manuellement.', es: 'El equipo de la plataforma los envía manualmente.', pt: 'A equipe da plataforma envia estes valores manualmente.', ur: 'پلیٹ فارم ٹیم یہ رقوم خود بھیجتی ہے۔', zh: '平台团队会手动发送这些款项。' },
  signIn: { en: 'Sign in with Pi from the home page to buy and sell.', ar: 'سجّل الدخول عبر Pi من الصفحة الرئيسية لتتمكن من الشراء والبيع.', fr: 'Connectez-vous avec Pi depuis la page d’accueil pour acheter et vendre.', es: 'Inicia sesión con Pi desde la página de inicio para comprar y vender.', pt: 'Entre com o Pi na página inicial para comprar e vender.', ur: 'خریدنے اور بیچنے کے لیے ہوم پیج سے Pi کے ساتھ سائن اِن کریں۔', zh: '请从首页使用 Pi 登录后再进行买卖。' },
  perShare: { en: 'Per share', ar: 'سعر الحصة', fr: 'Par part', es: 'Por participación', pt: 'Por fração', ur: 'فی حصہ', zh: '每份' },
  totalWord: { en: 'Total', ar: 'الإجمالي', fr: 'Total', es: 'Total', pt: 'Total', ur: 'کل', zh: '总计' },
  feeWord: { en: 'Fee', ar: 'العمولة', fr: 'Frais', es: 'Comisión', pt: 'Taxa', ur: 'فیس', zh: '手续费' },
  youReceive: { en: 'You receive', ar: 'صافي ما تستلمه', fr: 'Vous recevez', es: 'Recibes', pt: 'Você recebe', ur: 'آپ کو ملیں گے', zh: '您将收到' },
  statusOpen: { en: 'Open', ar: 'معروض', fr: 'Ouverte', es: 'Abierta', pt: 'Aberta', ur: 'کھلی', zh: '在售' },
  statusSold: { en: 'Sold', ar: 'تم البيع', fr: 'Vendue', es: 'Vendida', pt: 'Vendida', ur: 'فروخت ہو گئی', zh: '已售出' },
  statusCancelled: { en: 'Cancelled', ar: 'ملغاة', fr: 'Annulée', es: 'Cancelada', pt: 'Cancelada', ur: 'منسوخ', zh: '已取消' },
} satisfies Record<string, Row>;

type MarketLabelKey = keyof typeof MARKET_LABELS;

export function mk(key: MarketLabelKey, language: string | undefined, vars: Record<string, string | number> = {}): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  let text = (MARKET_LABELS[key] as Row)[known];
  for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
}
