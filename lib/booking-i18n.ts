import type { NavLanguage } from './nav-i18n';
import type { BookingErrorCode } from './booking-rules';

export interface BookingStrings {
  stayDates: string; rentalPeriod: string; checkIn: string; checkOut: string; from: string; to: string;
  night: string; nights: string; total: string; taken: string; perNight: string; perMonth: string;
  chooseDates: string; bookNow: string;
  invalid: string; past: string; min: string; max: string; unavailable: string; noPrice: string;
}

// {n} is replaced by the number of nights.
export const BOOKING_I18N: Record<NavLanguage, BookingStrings> = {
  en: { stayDates: 'Stay dates', rentalPeriod: 'Rental period (30 nights or more)', checkIn: 'Check-in', checkOut: 'Check-out', from: 'From', to: 'To', night: 'night', nights: 'nights', total: 'Total', taken: 'Already booked', perNight: 'night', perMonth: 'month', chooseDates: 'Choose dates', bookNow: 'Book', invalid: 'Choose valid dates', past: 'The start date is in the past', min: 'Minimum stay is {n} nights', max: 'Maximum stay is {n} nights', unavailable: 'These dates are already booked', noPrice: 'Price unavailable' },
  ar: { stayDates: 'تواريخ الإقامة', rentalPeriod: 'مدة الإيجار (30 ليلة أو أكتر)', checkIn: 'دخول', checkOut: 'خروج', from: 'من', to: 'إلى', night: 'ليلة', nights: 'ليالي', total: 'الإجمالي', taken: 'محجوز بالفعل', perNight: 'ليلة', perMonth: 'شهر', chooseDates: 'اختار التواريخ', bookNow: 'احجز', invalid: 'اختار تواريخ صحيحة', past: 'تاريخ البداية فات', min: 'أقل مدة إقامة {n} ليالي', max: 'أقصى مدة إقامة {n} ليلة', unavailable: 'التواريخ دي محجوزة', noPrice: 'السعر مش متاح' },
  fr: { stayDates: 'Dates du séjour', rentalPeriod: 'Durée de location (30 nuits minimum)', checkIn: 'Arrivée', checkOut: 'Départ', from: 'Du', to: 'Au', night: 'nuit', nights: 'nuits', total: 'Total', taken: 'Déjà réservé', perNight: 'nuit', perMonth: 'mois', chooseDates: 'Choisir les dates', bookNow: 'Réserver', invalid: 'Choisissez des dates valides', past: 'La date de début est passée', min: 'Séjour minimum : {n} nuits', max: 'Séjour maximum : {n} nuits', unavailable: 'Ces dates sont déjà réservées', noPrice: 'Prix indisponible' },
  es: { stayDates: 'Fechas de estancia', rentalPeriod: 'Periodo de alquiler (mínimo 30 noches)', checkIn: 'Entrada', checkOut: 'Salida', from: 'Desde', to: 'Hasta', night: 'noche', nights: 'noches', total: 'Total', taken: 'Ya reservado', perNight: 'noche', perMonth: 'mes', chooseDates: 'Elegir fechas', bookNow: 'Reservar', invalid: 'Elige fechas válidas', past: 'La fecha de inicio ya pasó', min: 'Estancia mínima: {n} noches', max: 'Estancia máxima: {n} noches', unavailable: 'Estas fechas ya están reservadas', noPrice: 'Precio no disponible' },
  pt: { stayDates: 'Datas da estadia', rentalPeriod: 'Período de aluguel (mínimo 30 noites)', checkIn: 'Check-in', checkOut: 'Check-out', from: 'De', to: 'Até', night: 'noite', nights: 'noites', total: 'Total', taken: 'Já reservado', perNight: 'noite', perMonth: 'mês', chooseDates: 'Escolher datas', bookNow: 'Reservar', invalid: 'Escolha datas válidas', past: 'A data de início já passou', min: 'Estadia mínima: {n} noites', max: 'Estadia máxima: {n} noites', unavailable: 'Estas datas já estão reservadas', noPrice: 'Preço indisponível' },
  ur: { stayDates: 'قیام کی تاریخیں', rentalPeriod: 'کرائے کی مدت (کم از کم 30 راتیں)', checkIn: 'آمد', checkOut: 'روانگی', from: 'از', to: 'تا', night: 'رات', nights: 'راتیں', total: 'کل', taken: 'پہلے سے بک ہے', perNight: 'رات', perMonth: 'ماہ', chooseDates: 'تاریخیں منتخب کریں', bookNow: 'بک کریں', invalid: 'درست تاریخیں منتخب کریں', past: 'شروع کی تاریخ گزر چکی ہے', min: 'کم از کم قیام {n} راتیں', max: 'زیادہ سے زیادہ قیام {n} راتیں', unavailable: 'یہ تاریخیں پہلے سے بک ہیں', noPrice: 'قیمت دستیاب نہیں' },
  zh: { stayDates: '入住日期', rentalPeriod: '租期（至少30晚）', checkIn: '入住', checkOut: '退房', from: '从', to: '到', night: '晚', nights: '晚', total: '合计', taken: '已被预订', perNight: '晚', perMonth: '月', chooseDates: '选择日期', bookNow: '预订', invalid: '请选择有效日期', past: '开始日期已过', min: '最少入住 {n} 晚', max: '最多入住 {n} 晚', unavailable: '这些日期已被预订', noPrice: '价格不可用' },
};

export const bookingStrings = (lang: string): BookingStrings => BOOKING_I18N[lang as NavLanguage] ?? BOOKING_I18N.en;

// Localized text for a validateBooking failure.
export function bookingErrorText(lang: string, code: BookingErrorCode, limit?: number): string {
  const t = bookingStrings(lang);
  const raw = code === 'min' ? t.min : code === 'max' ? t.max : code === 'past' ? t.past : t.invalid;
  return raw.replace('{n}', String(limit ?? ''));
}

// 'YYYY-MM-DD' as a readable date in the visitor's language, always with 0-9 digits.
export function formatDay(iso: string, lang: string): string {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(ms)) return iso;
  try {
    return new Intl.DateTimeFormat(`${lang}-u-nu-latn`, { dateStyle: 'medium', timeZone: 'UTC' }).format(ms);
  } catch {
    return iso;
  }
}

export const nightsLabel = (lang: string, n: number) => `${n} ${n === 1 ? bookingStrings(lang).night : bookingStrings(lang).nights}`;
