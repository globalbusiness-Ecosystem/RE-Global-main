import type { NavLanguage } from './nav-i18n';

// Labels of the properties, shares and amounts-owed sections on the contracts page, in all 7 languages.
type Row = Record<NavLanguage, string>;

export const ASSET_LABELS = {
  myProperties: { en: 'My properties', ar: 'ممتلكاتي', fr: 'Mes biens', es: 'Mis propiedades', pt: 'Meus imóveis', ur: 'میری جائیدادیں', zh: '我的房产' },
  underReview: { en: 'Under review', ar: 'قيد المراجعة', fr: 'En cours de vérification', es: 'En revisión', pt: 'Em análise', ur: 'زیر جائزہ', zh: '审核中' },
  confirmed: { en: 'Confirmed', ar: 'مؤكد', fr: 'Confirmé', es: 'Confirmado', pt: 'Confirmado', ur: 'تصدیق شدہ', zh: '已确认' },
  myShares: { en: 'My shares', ar: 'حصصي', fr: 'Mes parts', es: 'Mis participaciones', pt: 'Minhas cotas', ur: 'میرے حصص', zh: '我的份额' },
  sharesMarket: { en: 'Shares market', ar: 'سوق الحصص', fr: 'Marché des parts', es: 'Mercado de participaciones', pt: 'Mercado de cotas', ur: 'حصص کی مارکیٹ', zh: '份额市场' },
  sharesWord: { en: 'shares', ar: 'حصة', fr: 'parts', es: 'participaciones', pt: 'cotas', ur: 'حصص', zh: '份' },
  cancelledRefund: { en: 'Cancelled, refund queued', ar: 'ملغي واتسجل استرداد', fr: 'Annulé, remboursement en attente', es: 'Cancelado, reembolso en cola', pt: 'Cancelado, reembolso na fila', ur: 'منسوخ، ریفنڈ قطار میں', zh: '已取消，退款排队中' },
  owedToMe: { en: 'Owed to me', ar: 'مستحقاتي', fr: 'Dû à moi', es: 'Pendiente a mi favor', pt: 'A receber', ur: 'مجھے واجب الادا', zh: '应收款项' },
  pending: { en: 'Pending', ar: 'قيد التحويل', fr: 'En attente', es: 'Pendiente', pt: 'Pendente', ur: 'زیر التوا', zh: '待处理' },
  refund: { en: 'Refund', ar: 'استرداد', fr: 'Remboursement', es: 'Reembolso', pt: 'Reembolso', ur: 'ریفنڈ', zh: '退款' },
  shareProceeds: { en: 'Share sale proceeds', ar: 'حصيلة بيع حصص', fr: 'Produit de la vente de parts', es: 'Ingresos por venta de participaciones', pt: 'Receita da venda de cotas', ur: 'حصص کی فروخت کی رقم', zh: '份额出售所得' },
  paid: { en: 'Paid', ar: 'اتحوّلت', fr: 'Payé', es: 'Pagado', pt: 'Pago', ur: 'ادا شدہ', zh: '已支付' },
  manualNote: { en: 'The platform team sends these by hand.', ar: 'التحويل بيتم يدويًا من فريق المنصة.', fr: 'L\'équipe de la plateforme les envoie manuellement.', es: 'El equipo de la plataforma los envía manualmente.', pt: 'A equipe da plataforma envia manualmente.', ur: 'پلیٹ فارم ٹیم یہ ادائیگیاں خود بھیجتی ہے۔', zh: '平台团队会手动转账。' },
} satisfies Record<string, Row>;

export type AssetLabelKey = keyof typeof ASSET_LABELS;

export function al(key: AssetLabelKey, language: string): string {
  const row = ASSET_LABELS[key] as Row;
  return row[language as NavLanguage] ?? row.en;
}
