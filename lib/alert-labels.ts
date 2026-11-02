import type { NavLanguage } from './nav-i18n';

// Texts of the smart alerts and of the alerts page, in all 7 languages.
// {placeholders} are filled in by alertLabel(); property names stay as the owner wrote them (the Arabic name is used in Arabic).
type Row = Record<NavLanguage, string>;

export const ALERT_LABELS = {
  priceDrop: { en: 'Price Drop', ar: 'انخفاض في السعر', fr: 'Baisse de prix', es: 'Bajada de precio', pt: 'Queda de preço', ur: 'قیمت میں کمی', zh: '价格下降' },
  priceUp: { en: 'Price Increase', ar: 'ارتفاع في السعر', fr: 'Hausse de prix', es: 'Subida de precio', pt: 'Aumento de preço', ur: 'قیمت میں اضافہ', zh: '价格上涨' },
  priceChangeD: { en: '{title}: {from} → {to} ({pct}%)', ar: '{title}: {from} ← {to} ({pct}%)', fr: '{title} : {from} → {to} ({pct} %)', es: '{title}: {from} → {to} ({pct}%)', pt: '{title}: {from} → {to} ({pct}%)', ur: '{title}: {from} ← {to} ({pct}%)', zh: '{title}：{from} → {to}（{pct}%）' },
  contractActive: { en: 'Contract Active', ar: 'العقد نشط', fr: 'Contrat actif', es: 'Contrato activo', pt: 'Contrato ativo', ur: 'معاہدہ فعال', zh: '合同已生效' },
  contractDone: { en: 'Contract Completed', ar: 'العقد مكتمل', fr: 'Contrat terminé', es: 'Contrato completado', pt: 'Contrato concluído', ur: 'معاہدہ مکمل', zh: '合同已完成' },
  contractD: { en: '{title} — {amount} {currency}', ar: '{title} — {amount} {currency}', fr: '{title} — {amount} {currency}', es: '{title} — {amount} {currency}', pt: '{title} — {amount} {currency}', ur: '{title} — {amount} {currency}', zh: '{title} — {amount} {currency}' },
  recT: { en: 'Matches Your Interests', ar: 'يطابق اهتماماتك', fr: 'Correspond à vos intérêts', es: 'Coincide con tus intereses', pt: 'Combina com seus interesses', ur: 'آپ کی دلچسپی کے مطابق', zh: '符合您的兴趣' },
  recD: { en: '{title} — {price} {currency}', ar: '{title} — {price} {currency}', fr: '{title} — {price} {currency}', es: '{title} — {price} {currency}', pt: '{title} — {price} {currency}', ur: '{title} — {price} {currency}', zh: '{title} — {price} {currency}' },
  stayReviewT: { en: 'Booking under review', ar: 'حجزك تحت المراجعة', fr: 'Réservation en cours de vérification', es: 'Reserva en revisión', pt: 'Reserva em análise', ur: 'بکنگ زیرِ جائزہ ہے', zh: '预订审核中' },
  stayReviewD: { en: '{title}: we are checking your payment and will confirm soon.', ar: '{title}: بنراجع الدفع وهنأكد الحجز قريب.', fr: '{title} : nous vérifions votre paiement et confirmerons bientôt.', es: '{title}: estamos revisando tu pago y confirmaremos pronto.', pt: '{title}: estamos verificando seu pagamento e confirmaremos em breve.', ur: '{title}: ہم آپ کی ادائیگی چیک کر رہے ہیں، جلد تصدیق کریں گے۔', zh: '{title}：我们正在核对您的付款，很快确认。' },
  checkinToday: { en: 'Check-in today', ar: 'تسجيل الوصول النهارده', fr: 'Arrivée aujourd\'hui', es: 'Check-in hoy', pt: 'Check-in hoje', ur: 'آج چیک اِن', zh: '今天入住' },
  checkinTomorrow: { en: 'Check-in tomorrow', ar: 'تسجيل الوصول بكرة', fr: 'Arrivée demain', es: 'Check-in mañana', pt: 'Check-in amanhã', ur: 'کل چیک اِن', zh: '明天入住' },
  checkinDays: { en: 'Check-in in {n} days', ar: 'تسجيل الوصول بعد {n} أيام', fr: 'Arrivée dans {n} jours', es: 'Check-in en {n} días', pt: 'Check-in em {n} dias', ur: '{n} دن بعد چیک اِن', zh: '{n} 天后入住' },
  stayDatesD: { en: '{title}: {start} → {end}', ar: '{title}: {start} ← {end}', fr: '{title} : {start} → {end}', es: '{title}: {start} → {end}', pt: '{title}: {start} → {end}', ur: '{title}: {start} ← {end}', zh: '{title}：{start} → {end}' },
  rateT: { en: 'How was your stay?', ar: 'إقامتك كانت إزاي؟', fr: 'Comment était votre séjour ?', es: '¿Cómo fue tu estancia?', pt: 'Como foi sua estadia?', ur: 'آپ کا قیام کیسا رہا؟', zh: '住得怎么样？' },
  rateD: { en: '{title}: rate your stay from My bookings and earn reward points.', ar: '{title}: قيّم إقامتك من "حجوزاتي" واكسب نقاط مكافآت.', fr: '{title} : notez votre séjour dans Mes réservations et gagnez des points.', es: '{title}: valora tu estancia en Mis reservas y gana puntos de recompensa.', pt: '{title}: avalie sua estadia em Minhas reservas e ganhe pontos de recompensa.', ur: '{title}: "میری بکنگز" سے اپنے قیام کی ریٹنگ دیں اور انعامی پوائنٹس کمائیں۔', zh: '{title}：在“我的预订”中为本次入住评分，赚取奖励积分。' },
  replyT: { en: 'The host replied to your review', ar: 'الإدارة ردّت على تقييمك', fr: 'L\'hôte a répondu à votre avis', es: 'El anfitrión respondió a tu reseña', pt: 'O anfitrião respondeu à sua avaliação', ur: 'میزبان نے آپ کے جائزے کا جواب دیا', zh: '房东回复了您的评价' },
  replyD: { en: '{title}: see the reply under your stay in My bookings.', ar: '{title}: شوف الرد تحت إقامتك في "حجوزاتي".', fr: '{title} : consultez la réponse sous votre séjour dans Mes réservations.', es: '{title}: mira la respuesta bajo tu estancia en Mis reservas.', pt: '{title}: veja a resposta sob sua estadia em Minhas reservas.', ur: '{title}: "میری بکنگز" میں اپنے قیام کے نیچے جواب دیکھیں۔', zh: '{title}：请在“我的预订”的该次入住下查看回复。' },
  refundSentT: { en: 'Your refund was sent', ar: 'تم تحويل الاسترداد', fr: 'Votre remboursement a été envoyé', es: 'Tu reembolso fue enviado', pt: 'Seu reembolso foi enviado', ur: 'آپ کی رقم واپسی بھیج دی گئی', zh: '退款已发送' },
  saleSentT: { en: 'Your sale proceeds were sent', ar: 'تم تحويل حصيلة البيع', fr: 'Le produit de votre vente a été envoyé', es: 'Los ingresos de tu venta fueron enviados', pt: 'Os recursos da sua venda foram enviados', ur: 'آپ کی فروخت کی رقم بھیج دی گئی', zh: '出售款项已发送' },
  paidD: { en: '{amount} π was transferred to your Pi wallet. Check your wallet.', ar: '{amount} π اتحوّلت لمحفظتك على Pi. راجع محفظتك.', fr: '{amount} π ont été transférés vers votre portefeuille Pi. Vérifiez votre portefeuille.', es: 'Se transfirieron {amount} π a tu billetera Pi. Revísala.', pt: '{amount} π foram transferidos para sua carteira Pi. Confira sua carteira.', ur: '{amount} π آپ کے Pi والیٹ میں منتقل کر دیے گئے۔ اپنا والیٹ چیک کریں۔', zh: '{amount} π 已转入您的 Pi 钱包，请查看钱包。' },
  refundPendT: { en: 'Refund on its way', ar: 'الاسترداد في الطريق', fr: 'Remboursement en route', es: 'Reembolso en camino', pt: 'Reembolso a caminho', ur: 'رقم واپسی راستے میں ہے', zh: '退款处理中' },
  salePendT: { en: 'Sale proceeds on their way', ar: 'حصيلة البيع في الطريق', fr: 'Produit de la vente en route', es: 'Ingresos de la venta en camino', pt: 'Recursos da venda a caminho', ur: 'فروخت کی رقم راستے میں ہے', zh: '出售款项处理中' },
  pendD: { en: '{amount} π is waiting for the manual transfer from the team.', ar: '{amount} π مستنية التحويل اليدوي من الفريق.', fr: '{amount} π attendent le virement manuel de l\'équipe.', es: '{amount} π esperan la transferencia manual del equipo.', pt: '{amount} π aguardam a transferência manual da equipe.', ur: '{amount} π ٹیم کی طرف سے دستی منتقلی کے منتظر ہیں۔', zh: '{amount} π 正等待团队手动转账。' },
  pageTitle: { en: 'Smart Alerts', ar: 'التنبيهات الذكية', fr: 'Alertes intelligentes', es: 'Alertas inteligentes', pt: 'Alertas inteligentes', ur: 'سمارٹ الرٹس', zh: '智能提醒' },
  pageSub: { en: 'Based on your real favorites and contracts', ar: 'مبنية على مفضلاتك وعقودك الفعلية', fr: 'Basées sur vos vrais favoris et contrats', es: 'Basadas en tus favoritos y contratos reales', pt: 'Baseados nos seus favoritos e contratos reais', ur: 'آپ کی اصل پسندیدہ فہرست اور معاہدوں پر مبنی', zh: '基于您真实的收藏和合同' },
  pageSignIn: { en: 'Sign in with Pi to see your alerts', ar: 'سجّل الدخول عبر Pi لرؤية تنبيهاتك', fr: 'Connectez-vous avec Pi pour voir vos alertes', es: 'Inicia sesión con Pi para ver tus alertas', pt: 'Entre com Pi para ver seus alertas', ur: 'اپنے الرٹس دیکھنے کے لیے Pi سے سائن اِن کریں', zh: '使用 Pi 登录以查看提醒' },
  pageNone: { en: 'No alerts at this time', ar: 'لا توجد تنبيهات في الوقت الحالي', fr: 'Aucune alerte pour le moment', es: 'No hay alertas por ahora', pt: 'Nenhum alerta no momento', ur: 'اس وقت کوئی الرٹ نہیں', zh: '暂无提醒' },
  pageHint: { en: 'Saving properties to favorites helps us send you price-change and recommendation alerts', ar: 'حفظ عقارات في المفضلة يساعدنا نبعتلك تنبيهات تغيّر السعر والتوصيات', fr: 'Enregistrer des biens en favoris nous aide à vous envoyer des alertes de prix et des recommandations', es: 'Guardar propiedades en favoritos nos ayuda a enviarte alertas de precio y recomendaciones', pt: 'Salvar imóveis nos favoritos nos ajuda a enviar alertas de preço e recomendações', ur: 'پسندیدہ میں جائیدادیں محفوظ کرنے سے ہم قیمت کی تبدیلی اور سفارشات کے الرٹس بھیج سکتے ہیں', zh: '将房源加入收藏，可帮助我们向您发送价格变动和推荐提醒' },
} satisfies Record<string, Row>;

export type AlertLabelKey = keyof typeof ALERT_LABELS;
export type AlertVars = Record<string, string | number | undefined>;
export interface AlertI18n { title: AlertLabelKey; description: AlertLabelKey; vars?: AlertVars }

export function alertLabel(key: AlertLabelKey, language: string, vars: AlertVars = {}): string {
  const row = ALERT_LABELS[key] as Row;
  let text = row[language as NavLanguage] ?? row.en;
  for (const [k, v] of Object.entries(vars)) {
    if (k === 'titleAr') continue;
    const value = k === 'title' && language === 'ar' && vars.titleAr ? vars.titleAr : v;
    text = text.split(`{${k}}`).join(String(value ?? ''));
  }
  return text;
}

// Title and description of an alert in the reader's language. Alerts without i18n fall back to Arabic or English.
export function alertText(
  alert: { i18n?: AlertI18n; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string },
  language: string
): { title: string; description: string } {
  if (alert.i18n) {
    return { title: alertLabel(alert.i18n.title, language, alert.i18n.vars), description: alertLabel(alert.i18n.description, language, alert.i18n.vars) };
  }
  return language === 'ar' ? { title: alert.titleAr, description: alert.descriptionAr } : { title: alert.titleEn, description: alert.descriptionEn };
}
