import type { NavLanguage } from './nav-i18n';

// Printable booking receipt for a guest. Pure: builds one self-contained HTML page (no scripts).
// Every value that comes from a user or a listing is escaped. The guest saves it as PDF with the browser's print.

export interface ReceiptStrings {
  title: string; reference: string; payment: string; property: string; checkIn: string; checkOut: string; nights: string;
  guests: string; checkInTime: string; checkOutTime: string; guest: string; total: string; status: string; confirmed: string;
  issued: string; policy: string; saveHint: string;
}
export const RECEIPT_I18N: Record<NavLanguage, ReceiptStrings> = {
  en: { title: 'Booking receipt', reference: 'Booking reference', payment: 'Payment ID', property: 'Property', checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', guests: 'Guests', checkInTime: 'Check-in time', checkOutTime: 'Check-out time', guest: 'Guest', total: 'Total paid', status: 'Status', confirmed: 'Confirmed', issued: 'Issued', policy: 'Cancellation policy', saveHint: 'To save as PDF, use your browser’s Print option.' },
  ar: { title: 'إيصال الحجز', reference: 'رقم الحجز', payment: 'رقم الدفع', property: 'العقار', checkIn: 'الوصول', checkOut: 'المغادرة', nights: 'عدد الليالي', guests: 'عدد الضيوف', checkInTime: 'ميعاد الوصول', checkOutTime: 'ميعاد المغادرة', guest: 'الضيف', total: 'إجمالي المدفوع', status: 'الحالة', confirmed: 'مؤكد', issued: 'تاريخ الإصدار', policy: 'سياسة الإلغاء', saveHint: 'علشان تحفظه PDF، استخدم زر الطباعة في المتصفح.' },
  fr: { title: 'Reçu de réservation', reference: 'Référence de réservation', payment: 'ID de paiement', property: 'Hébergement', checkIn: 'Arrivée', checkOut: 'Départ', nights: 'Nuits', guests: 'Voyageurs', checkInTime: 'Heure d’arrivée', checkOutTime: 'Heure de départ', guest: 'Voyageur', total: 'Total payé', status: 'Statut', confirmed: 'Confirmée', issued: 'Émis le', policy: 'Conditions d’annulation', saveHint: 'Pour l’enregistrer en PDF, utilisez l’option Imprimer du navigateur.' },
  es: { title: 'Recibo de reserva', reference: 'Referencia de reserva', payment: 'ID de pago', property: 'Alojamiento', checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', guests: 'Huéspedes', checkInTime: 'Hora de entrada', checkOutTime: 'Hora de salida', guest: 'Huésped', total: 'Total pagado', status: 'Estado', confirmed: 'Confirmada', issued: 'Emitido', policy: 'Política de cancelación', saveHint: 'Para guardarlo como PDF, usa la opción Imprimir del navegador.' },
  pt: { title: 'Recibo da reserva', reference: 'Referência da reserva', payment: 'ID do pagamento', property: 'Acomodação', checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Noites', guests: 'Hóspedes', checkInTime: 'Horário de check-in', checkOutTime: 'Horário de check-out', guest: 'Hóspede', total: 'Total pago', status: 'Status', confirmed: 'Confirmada', issued: 'Emitido em', policy: 'Política de cancelamento', saveHint: 'Para salvar em PDF, use a opção Imprimir do navegador.' },
  ur: { title: 'بکنگ کی رسید', reference: 'بکنگ ریفرنس', payment: 'ادائیگی آئی ڈی', property: 'جائیداد', checkIn: 'آمد', checkOut: 'روانگی', nights: 'راتیں', guests: 'مہمان', checkInTime: 'آمد کا وقت', checkOutTime: 'روانگی کا وقت', guest: 'مہمان', total: 'کل ادا شدہ', status: 'حالت', confirmed: 'تصدیق شدہ', issued: 'جاری کردہ', policy: 'منسوخی کی پالیسی', saveHint: 'PDF محفوظ کرنے کے لیے براؤزر کا پرنٹ آپشن استعمال کریں۔' },
  zh: { title: '预订收据', reference: '预订编号', payment: '支付编号', property: '房源', checkIn: '入住', checkOut: '退房', nights: '晚数', guests: '客人数', checkInTime: '入住时间', checkOutTime: '退房时间', guest: '住客', total: '实付总额', status: '状态', confirmed: '已确认', issued: '开具时间', policy: '取消政策', saveHint: '如需保存为 PDF，请使用浏览器的打印功能。' },
};
export const receiptStrings = (lang: string): ReceiptStrings => RECEIPT_I18N[lang as NavLanguage] ?? RECEIPT_I18N.en;

export const esc = (v: unknown): string =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export interface ReceiptData {
  bookingId: string; paymentId: string; title: string; start: string; end: string; nights: number; guests?: number;
  amount: number; checkInTime?: string; checkOutTime?: string; username: string; issuedAt: string; policy?: string;
}

const RTL = ['ar', 'ur'];

export function buildReceiptHtml(lang: string, d: ReceiptData): string {
  const t = receiptStrings(lang);
  const code = lang in RECEIPT_I18N ? lang : 'en';
  const rows: [string, string][] = [
    [t.property, d.title],
    [t.checkIn, d.start],
    [t.checkOut, d.end],
    [t.nights, String(d.nights)],
    ...(d.guests ? ([[t.guests, String(d.guests)]] as [string, string][]) : []),
    ...(d.checkInTime ? ([[t.checkInTime, d.checkInTime]] as [string, string][]) : []),
    ...(d.checkOutTime ? ([[t.checkOutTime, d.checkOutTime]] as [string, string][]) : []),
    [t.guest, `@${d.username}`],
    [t.status, t.confirmed],
  ];
  const body = rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('');
  return `<!doctype html>
<html lang="${esc(code)}" dir="${RTL.includes(code) ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(t.title)} ${esc(d.bookingId)}</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;background:#fff;margin:0;padding:24px}
main{max-width:560px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px}
.ref{color:#555;font-size:13px;margin:0 0 16px;word-break:break-all}
table{width:100%;border-collapse:collapse;margin:8px 0 16px}
th,td{padding:8px 6px;border-bottom:1px solid #ddd;font-size:14px;text-align:start;vertical-align:top}
th{color:#555;font-weight:600;width:40%}
.total{font-size:20px;font-weight:700;margin:12px 0}
.note{font-size:12px;color:#555;margin-top:12px}
@media print{body{padding:0}.hint{display:none}}
</style>
</head>
<body>
<main>
<h1>${esc(t.title)}</h1>
<p class="ref">${esc(t.reference)}: ${esc(d.bookingId)}<br>${esc(t.payment)}: ${esc(d.paymentId)}</p>
<table>${body}</table>
<p class="total">${esc(t.total)}: ${esc(d.amount.toFixed(2))} π</p>
${d.policy ? `<p class="note"><strong>${esc(t.policy)}:</strong> ${esc(d.policy)}</p>` : ''}
<p class="note">${esc(t.issued)}: ${esc(d.issuedAt.slice(0, 10))}</p>
<p class="note hint">${esc(t.saveHint)}</p>
</main>
</body>
</html>
`;
}
